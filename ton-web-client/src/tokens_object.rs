use std::collections::BTreeMap;
use std::str::FromStr;

use nt_utils::*;
use num_bigint::{BigInt, BigUint};
use num_traits::Num;
use ton_block::Serializable;
use wasm_bindgen::{JsCast, JsValue};

use crate::models::*;
use crate::utils::*;

pub fn insert_init_data(
    contract_abi: &ton_abi::Contract,
    data: ton_types::SliceData,
    public_key: &Option<ed25519_dalek::PublicKey>,
    tokens: TokensObject,
) -> Result<ton_types::SliceData, JsValue> {
    let mut map = ton_types::HashmapE::with_hashmap(
        ton_abi::Contract::DATA_MAP_KEYLEN,
        data.reference_opt(0),
    );

    if let Some(public_key) = public_key {
        map.set_builder(
            0u64.write_to_new_cell().trust_me().into(),
            ton_types::BuilderData::new()
                .append_raw(public_key.as_bytes(), 256)
                .trust_me(),
        )
        .handle_error()?;
    }

    if !contract_abi.data().is_empty() {
        if !tokens.is_object() {
            return Err(TokensJsonError::ObjectExpected).handle_error();
        }

        for (param_name, param) in contract_abi.data() {
            let value = js_sys::Reflect::get(&tokens, &JsValue::from_str(param_name.as_str()))
                .map_err(|_| TokensJsonError::ParameterNotFound(param_name.clone()))
                .handle_error()?;

            let builder = parse_token_value(&param.value.kind, value)
                .handle_error()?
                .pack_into_chain(2)
                .handle_error()?;

            map.set_builder(param.key.write_to_new_cell().trust_me().into(), &builder)
                .handle_error()?;
        }
    }

    map.write_to_new_cell().map(From::from).handle_error()
}

pub fn make_tokens_object(tokens: Vec<ton_abi::Token>) -> Result<TokensObject, JsValue> {
    let object = js_sys::Object::new();
    for token in tokens {
        js_sys::Reflect::set(
            &object,
            &JsValue::from(token.name),
            &make_token_value(token.value)?,
        )
        .trust_me();
    }
    Ok(object.unchecked_into())
}

pub fn make_token_value(value: ton_abi::TokenValue) -> Result<JsValue, JsValue> {
    Ok(match value {
        ton_abi::TokenValue::Uint(value) => JsValue::from(value.number.to_string()),
        ton_abi::TokenValue::Int(value) => JsValue::from(value.number.to_string()),
        ton_abi::TokenValue::VarInt(_, value) => JsValue::from(value.to_string()),
        ton_abi::TokenValue::VarUint(_, value) => JsValue::from(value.to_string()),
        ton_abi::TokenValue::Bool(value) => JsValue::from(value),
        ton_abi::TokenValue::Tuple(tokens) => make_tokens_object(tokens)?.unchecked_into(),
        ton_abi::TokenValue::Array(_, values) | ton_abi::TokenValue::FixedArray(_, values) => {
            values
                .into_iter()
                .map(make_token_value)
                .collect::<Result<js_sys::Array, _>>()
                .map(JsCast::unchecked_into)?
        }
        ton_abi::TokenValue::Cell(value) => {
            let data = ton_types::serialize_toc(&value).handle_error()?;
            JsValue::from(base64::encode(&data))
        }
        ton_abi::TokenValue::Map(_, _, values) => values
            .into_iter()
            .map(|(key, value)| {
                Result::<JsValue, JsValue>::Ok(
                    [JsValue::from(key), make_token_value(value)?]
                        .iter()
                        .collect::<js_sys::Array>()
                        .unchecked_into(),
                )
            })
            .collect::<Result<js_sys::Array, _>>()?
            .unchecked_into(),
        ton_abi::TokenValue::Address(value) => JsValue::from(value.to_string()),
        ton_abi::TokenValue::Bytes(value) | ton_abi::TokenValue::FixedBytes(value) => {
            JsValue::from(base64::encode(value))
        }
        ton_abi::TokenValue::String(value) => JsValue::from(value),
        ton_abi::TokenValue::Token(value) => JsValue::from(value.0.to_string()),
        ton_abi::TokenValue::Time(value) => JsValue::from(value.to_string()),
        ton_abi::TokenValue::Expire(value) => JsValue::from(value),
        ton_abi::TokenValue::PublicKey(value) => {
            JsValue::from(value.map(|value| hex::encode(value.as_bytes())))
        }
        ton_abi::TokenValue::Optional(_, value) => match value {
            Some(value) => make_token_value(*value)?,
            None => JsValue::null(),
        },
    })
}

pub fn parse_tokens_object(
    params: &[ton_abi::Param],
    tokens: TokensObject,
) -> Result<Vec<ton_abi::Token>, TokensJsonError> {
    if !tokens.is_object() {
        return Err(TokensJsonError::ObjectExpected);
    }
    let tokens: js_sys::Object = tokens.unchecked_into();

    if js_sys::Object::keys(&tokens).length() != params.len() as u32 {
        return Err(TokensJsonError::ParameterCountMismatch);
    }

    let mut result = Vec::with_capacity(params.len());
    for param in params {
        let value = js_sys::Reflect::get(&tokens, &JsValue::from_str(&param.name))
            .map_err(|_| TokensJsonError::ParameterNotFound(param.name.clone()))?;
        result.push(parse_token(param, value)?);
    }

    Ok(result)
}

pub fn parse_token(
    param: &ton_abi::Param,
    token: JsValue,
) -> Result<ton_abi::Token, TokensJsonError> {
    let value = parse_token_value(&param.kind, token)?;
    Ok(ton_abi::Token {
        name: param.name.clone(),
        value,
    })
}

pub fn parse_token_value(
    param: &ton_abi::ParamType,
    value: JsValue,
) -> Result<ton_abi::TokenValue, TokensJsonError> {
    let value = match param {
        &ton_abi::ParamType::Uint(size) | &ton_abi::ParamType::VarUint(size) => {
            let number = if let Some(value) = value.as_string() {
                let value = value.trim();
                if let Some(value) = value.strip_prefix("0x") {
                    BigUint::from_str_radix(value, 16)
                } else {
                    BigUint::from_str(value)
                }
                .map_err(|_| TokensJsonError::InvalidNumber(value.to_string()))
            } else if let Some(value) = value.as_f64() {
                // Check if there is a conversion error
                #[allow(clippy::float_cmp)]
                if value as u64 as f64 != value {
                    return Err(TokensJsonError::IntegerValueExpected(value));
                }

                if value >= 0.0 {
                    Ok(BigUint::from(value as u64))
                } else {
                    Err(TokensJsonError::UnsignedValueExpected(value))
                }
            } else {
                Err(TokensJsonError::NumberExpected)
            }?;

            match param {
                ton_abi::ParamType::Uint(_) => {
                    ton_abi::TokenValue::Uint(ton_abi::Uint { number, size })
                }
                _ => ton_abi::TokenValue::VarUint(size, number),
            }
        }
        &ton_abi::ParamType::Int(size) | &ton_abi::ParamType::VarInt(size) => {
            let number = if let Some(value) = value.as_string() {
                let value = value.trim();
                if let Some(value) = value.strip_prefix("0x") {
                    BigInt::from_str_radix(value, 16)
                } else {
                    BigInt::from_str(value)
                }
                .map_err(|_| TokensJsonError::InvalidNumber(value.to_string()))
            } else if let Some(value) = value.as_f64() {
                // Check if there is a conversion error
                #[allow(clippy::float_cmp)]
                if value as i64 as f64 != value {
                    return Err(TokensJsonError::IntegerValueExpected(value));
                }

                Ok(BigInt::from(value as i64))
            } else {
                Err(TokensJsonError::NumberExpected)
            }?;

            match param {
                ton_abi::ParamType::Int(_) => {
                    ton_abi::TokenValue::Int(ton_abi::Int { number, size })
                }
                _ => ton_abi::TokenValue::VarInt(size, number),
            }
        }
        ton_abi::ParamType::Bool => value
            .as_bool()
            .map(ton_abi::TokenValue::Bool)
            .ok_or(TokensJsonError::BoolExpected)?,
        ton_abi::ParamType::Tuple(params) => {
            ton_abi::TokenValue::Tuple(parse_tokens_object(params, value.unchecked_into())?)
        }
        ton_abi::ParamType::Array(param) => {
            if !js_sys::Array::is_array(&value) {
                return Err(TokensJsonError::ArrayExpected);
            }
            let value: js_sys::Array = value.unchecked_into();

            ton_abi::TokenValue::Array(
                *param.clone(),
                value
                    .iter()
                    .map(|value| parse_token_value(param.as_ref(), value))
                    .collect::<Result<_, _>>()?,
            )
        }
        ton_abi::ParamType::FixedArray(param, size) => {
            if !js_sys::Array::is_array(&value) {
                return Err(TokensJsonError::ArrayExpected);
            }
            let value: js_sys::Array = value.unchecked_into();

            if value.length() != *size as u32 {
                return Err(TokensJsonError::InvalidArrayLength(value.length()));
            }

            ton_abi::TokenValue::FixedArray(
                *param.clone(),
                value
                    .iter()
                    .map(|value| parse_token_value(param.as_ref(), value))
                    .collect::<Result<_, _>>()?,
            )
        }
        ton_abi::ParamType::Cell => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                if value.is_empty() {
                    Ok(ton_types::Cell::default())
                } else {
                    base64::decode(&value)
                        .map_err(|_| TokensJsonError::InvalidCell)
                        .and_then(|value| {
                            ton_types::deserialize_tree_of_cells(&mut std::io::Cursor::new(&value))
                                .map_err(|_| TokensJsonError::InvalidCell)
                        })
                }
            } else if value.is_null() {
                Ok(ton_types::Cell::default())
            } else {
                Err(TokensJsonError::StringExpected)
            }?;

            ton_abi::TokenValue::Cell(value)
        }
        ton_abi::ParamType::Map(param_key, param_value) => {
            if !js_sys::Array::is_array(&value) {
                return Err(TokensJsonError::ArrayExpected);
            }
            let value: js_sys::Array = value.unchecked_into();

            let mut result = BTreeMap::new();

            for value in value.iter() {
                if !js_sys::Array::is_array(&value) {
                    return Err(TokensJsonError::MapItemExpected);
                }
                let value: js_sys::Array = value.unchecked_into();
                if value.length() != 2 {
                    return Err(TokensJsonError::MapItemExpected);
                }

                let key = parse_token_value(param_key.as_ref(), value.get(0))?;
                let value = parse_token_value(param_value.as_ref(), value.get(1))?;

                result.insert(key.to_string(), value);
            }

            ton_abi::TokenValue::Map(*param_key.clone(), *param_value.clone(), result)
        }
        ton_abi::ParamType::Address => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                ton_block::MsgAddressInt::from_str(value)
                    .map_err(|_| TokensJsonError::InvalidAddress)
            } else {
                Err(TokensJsonError::StringExpected)
            }?;

            ton_abi::TokenValue::Address(match value {
                ton_block::MsgAddressInt::AddrStd(value) => ton_block::MsgAddress::AddrStd(value),
                ton_block::MsgAddressInt::AddrVar(value) => ton_block::MsgAddress::AddrVar(value),
            })
        }
        ton_abi::ParamType::Bytes => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                if value.is_empty() {
                    Ok(Vec::new())
                } else {
                    base64::decode(value).map_err(|_| TokensJsonError::InvalidBytes)
                }
            } else {
                Err(TokensJsonError::StringExpected)
            }?;

            ton_abi::TokenValue::Bytes(value)
        }
        ton_abi::ParamType::String => {
            let value = value.as_string().ok_or(TokensJsonError::StringExpected)?;
            ton_abi::TokenValue::String(value)
        }
        &ton_abi::ParamType::FixedBytes(size) => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                base64::decode(value).map_err(|_| TokensJsonError::InvalidBytes)
            } else {
                Err(TokensJsonError::StringExpected)
            }?;

            if value.len() != size {
                return Err(TokensJsonError::InvalidBytesLength(value.len()));
            }

            ton_abi::TokenValue::FixedBytes(value)
        }
        ton_abi::ParamType::Token => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                if let Some(value) = value.strip_prefix("0x") {
                    u128::from_str_radix(value, 16)
                } else {
                    u128::from_str(value)
                }
                .map_err(|_| TokensJsonError::InvalidNumber(value.to_string()))
            } else if let Some(value) = value.as_f64() {
                if value >= 0.0 {
                    Ok(value as u128)
                } else {
                    Err(TokensJsonError::UnsignedValueExpected(value))
                }
            } else {
                Err(TokensJsonError::NumberExpected)
            }?;

            ton_abi::TokenValue::Token(ton_block::Grams(value))
        }
        ton_abi::ParamType::Time => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                if let Some(value) = value.strip_prefix("0x") {
                    u64::from_str_radix(value, 16)
                } else {
                    u64::from_str(value)
                }
                .map_err(|_| TokensJsonError::InvalidNumber(value.to_string()))
            } else if let Some(value) = value.as_f64() {
                if value >= 0.0 {
                    Ok(value as u64)
                } else {
                    Err(TokensJsonError::UnsignedValueExpected(value))
                }
            } else {
                Err(TokensJsonError::NumberExpected)
            }?;

            ton_abi::TokenValue::Time(value)
        }
        ton_abi::ParamType::Expire => {
            let value = if let Some(value) = value.as_f64() {
                if value >= 0.0 {
                    Ok(value as u32)
                } else {
                    Err(TokensJsonError::UnsignedValueExpected(value))
                }
            } else if let Some(value) = value.as_string() {
                let value = value.trim();
                if let Some(value) = value.strip_prefix("0x") {
                    u32::from_str_radix(value, 16)
                } else {
                    u32::from_str(value)
                }
                .map_err(|_| TokensJsonError::InvalidNumber(value.to_string()))
            } else {
                Err(TokensJsonError::NumberExpected)
            }?;

            ton_abi::TokenValue::Expire(value)
        }
        ton_abi::ParamType::PublicKey => {
            let value = if let Some(value) = value.as_string() {
                let value = value.trim();
                if value.is_empty() {
                    Ok(None)
                } else {
                    hex::decode(value.strip_prefix("0x").unwrap_or(value))
                        .map_err(|_| TokensJsonError::InvalidPublicKey)
                        .and_then(|value| {
                            ed25519_dalek::PublicKey::from_bytes(&value)
                                .map_err(|_| TokensJsonError::InvalidPublicKey)
                        })
                        .map(Some)
                }
            } else {
                Err(TokensJsonError::StringExpected)
            }?;

            ton_abi::TokenValue::PublicKey(value)
        }
        ton_abi::ParamType::Optional(param) => {
            if value.is_null() {
                ton_abi::TokenValue::Optional(*param.clone(), None)
            } else {
                let value = Box::new(parse_token_value(param, value)?);
                ton_abi::TokenValue::Optional(*param.clone(), Some(value))
            }
        }
    };

    Ok(value)
}

pub fn parse_params_list(params: ParamsList) -> Result<Vec<ton_abi::Param>, TokensJsonError> {
    if !js_sys::Array::is_array(&params) {
        return Err(TokensJsonError::ObjectExpected);
    }
    let params: js_sys::Array = params.unchecked_into();
    params.iter().map(parse_param).collect()
}

pub fn parse_param(param: JsValue) -> Result<ton_abi::Param, TokensJsonError> {
    if !param.is_object() {
        return Err(TokensJsonError::ObjectExpected);
    }

    let name = match js_sys::Reflect::get(&param, &JsValue::from_str("name"))
        .ok()
        .and_then(|value| value.as_string())
    {
        Some(name) => name,
        None => return Err(TokensJsonError::StringExpected),
    };

    let mut kind: ton_abi::ParamType =
        match js_sys::Reflect::get(&param, &JsValue::from_str("type"))
            .ok()
            .and_then(|value| value.as_string())
        {
            Some(kind) => parse_param_type(&kind)?,
            None => return Err(TokensJsonError::StringExpected),
        };

    let components: Vec<ton_abi::Param> =
        match js_sys::Reflect::get(&param, &JsValue::from_str("components")) {
            Ok(components) => {
                if js_sys::Array::is_array(&components) {
                    let components: js_sys::Array = components.unchecked_into();
                    components
                        .iter()
                        .map(parse_param)
                        .collect::<Result<_, _>>()?
                } else if components.is_undefined() {
                    Vec::new()
                } else {
                    return Err(TokensJsonError::ObjectExpected);
                }
            }
            _ => return Err(TokensJsonError::ObjectExpected),
        };

    kind.set_components(components)
        .map_err(|_| TokensJsonError::InvalidComponents)?;

    Ok(ton_abi::Param { name, kind })
}

pub fn parse_param_type(kind: &str) -> Result<ton_abi::ParamType, TokensJsonError> {
    if let Some(']') = kind.chars().last() {
        let num: String = kind
            .chars()
            .rev()
            .skip(1)
            .take_while(|c| *c != '[')
            .collect::<String>()
            .chars()
            .rev()
            .collect();

        let count = kind.len();
        return if num.is_empty() {
            let subtype = parse_param_type(&kind[..count - 2])?;
            Ok(ton_abi::ParamType::Array(Box::new(subtype)))
        } else {
            let len = usize::from_str(&num).map_err(|_| TokensJsonError::ParamTypeExpected)?;

            let subtype = parse_param_type(&kind[..count - num.len() - 2])?;
            Ok(ton_abi::ParamType::FixedArray(Box::new(subtype), len))
        };
    }

    let result = match kind {
        "bool" => ton_abi::ParamType::Bool,
        "tuple" => ton_abi::ParamType::Tuple(Vec::new()),
        s if s.starts_with("int") => {
            let len = usize::from_str(&s[3..]).map_err(|_| TokensJsonError::ParamTypeExpected)?;
            ton_abi::ParamType::Int(len)
        }
        s if s.starts_with("uint") => {
            let len = usize::from_str(&s[4..]).map_err(|_| TokensJsonError::ParamTypeExpected)?;
            ton_abi::ParamType::Uint(len)
        }
        s if s.starts_with("varint") => {
            let len = usize::from_str(&s[6..]).map_err(|_| TokensJsonError::ParamTypeExpected)?;
            ton_abi::ParamType::Int(len)
        }
        s if s.starts_with("varuint") => {
            let len = usize::from_str(&s[7..]).map_err(|_| TokensJsonError::ParamTypeExpected)?;
            ton_abi::ParamType::Uint(len)
        }
        s if s.starts_with("map(") && s.ends_with(')') => {
            let types: Vec<&str> = kind[4..kind.len() - 1].splitn(2, ',').collect();
            if types.len() != 2 {
                return Err(TokensJsonError::ParamTypeExpected);
            }

            let key_type = parse_param_type(types[0])?;
            let value_type = parse_param_type(types[1])?;

            match key_type {
                ton_abi::ParamType::Int(_)
                | ton_abi::ParamType::Uint(_)
                | ton_abi::ParamType::Address => {
                    ton_abi::ParamType::Map(Box::new(key_type), Box::new(value_type))
                }
                _ => return Err(TokensJsonError::ParamTypeExpected),
            }
        }
        "cell" => ton_abi::ParamType::Cell,
        "address" => ton_abi::ParamType::Address,
        "token" | "gram" => ton_abi::ParamType::Token,
        "bytes" => ton_abi::ParamType::Bytes,
        s if s.starts_with("fixedbytes") => {
            let len = usize::from_str(&s[10..]).map_err(|_| TokensJsonError::ParamTypeExpected)?;
            ton_abi::ParamType::FixedBytes(len)
        }
        "time" => ton_abi::ParamType::Time,
        "expire" => ton_abi::ParamType::Expire,
        "pubkey" => ton_abi::ParamType::PublicKey,
        "string" => ton_abi::ParamType::String,
        s if s.starts_with("optional(") && s.ends_with(')') => {
            let inner_type = parse_param_type(&s[9..s.len() - 1])?;
            ton_abi::ParamType::Optional(Box::new(inner_type))
        }
        _ => return Err(TokensJsonError::ParamTypeExpected),
    };

    Ok(result)
}
