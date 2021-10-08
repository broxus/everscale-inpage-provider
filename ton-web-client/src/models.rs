use std::str::FromStr;

use nt::core::models;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

use crate::utils::*;

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION_ID: &str = r#"
export type TransactionId = {
    lt: string,
    hash: string,
};
"#;

pub fn make_transaction_id(data: nt_abi::TransactionId) -> TransactionId {
    ObjectBuilder::new()
        .set("lt", data.lt.to_string())
        .set("hash", hex::encode(data.hash.as_slice()))
        .build()
        .unchecked_into()
}

pub fn parse_transaction_id(data: TransactionId) -> Result<nt_abi::TransactionId, JsValue> {
    let lt = match js_sys::Reflect::get(&data, &JsValue::from_str("lt")).map(|lt| lt.as_string()) {
        Ok(Some(lt)) => u64::from_str(&lt).handle_error()?,
        _ => return Err(ModelError::InvalidTransactionId).handle_error(),
    };
    let hash = match js_sys::Reflect::get(&data, &JsValue::from_str("hash"))
        .map(|hash| hash.as_string())
    {
        Ok(Some(hash)) => ton_types::UInt256::from_str(&hash).handle_error()?,
        _ => return Err(ModelError::InvalidTransactionId).handle_error(),
    };
    Ok(nt_abi::TransactionId { lt, hash })
}

#[wasm_bindgen(typescript_custom_section)]
const ACCOUNT_STATUS: &str = r#"
export type AccountStatus = 'uninit' | 'frozen' | 'active' | 'nonexist';
"#;

fn make_account_status(data: nt::core::models::AccountStatus) -> AccountStatus {
    JsValue::from(match data {
        models::AccountStatus::Uninit => "uninit",
        models::AccountStatus::Frozen => "frozen",
        models::AccountStatus::Active => "active",
        models::AccountStatus::Nonexist => "nonexist",
    })
    .unchecked_into()
}

#[wasm_bindgen(typescript_custom_section)]
const MESSAGE: &str = r#"
export type Message = {
    src?: string,
    dst?: string,
    value: string,
    bounce: boolean,
    bounced: boolean,
    body?: string,
    bodyHash?: string,
};
"#;

pub fn make_message(data: models::Message) -> Message {
    let (body, body_hash) = if let Some(body) = data.body {
        let data = ton_types::serialize_toc(&body.data).expect("Shouldn't fail");
        (Some(base64::encode(data)), Some(body.hash.to_hex_string()))
    } else {
        (None, None)
    };

    ObjectBuilder::new()
        .set("src", data.src.as_ref().map(ToString::to_string))
        .set("dst", data.dst.as_ref().map(ToString::to_string))
        .set("value", data.value.to_string())
        .set("bounce", data.bounce)
        .set("bounced", data.bounced)
        .set("body", body)
        .set("bodyHash", body_hash)
        .build()
        .unchecked_into()
}

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTION: &str = r#"
export type Transaction = {
    id: TransactionId,
    prevTransactionId?: TransactionId,
    createdAt: number,
    aborted: boolean,
    exitCode?: number,
    resultCode?: number,
    origStatus: AccountStatus,
    endStatus: AccountStatus,
    totalFees: string,
    inMessage: Message,
    outMessages: Message[],
};
"#;

pub fn make_transaction(data: models::Transaction) -> Transaction {
    ObjectBuilder::new()
        .set("id", make_transaction_id(data.id))
        .set(
            "prevTransactionId",
            data.prev_trans_id.map(make_transaction_id),
        )
        .set("createdAt", data.created_at)
        .set("aborted", data.aborted)
        .set("exitCode", data.exit_code)
        .set("resultCode", data.result_code)
        .set("origStatus", make_account_status(data.orig_status))
        .set("endStatus", make_account_status(data.end_status))
        .set("totalFees", data.total_fees.to_string())
        .set("inMessage", make_message(data.in_msg))
        .set(
            "outMessages",
            data.out_msgs
                .into_iter()
                .map(make_message)
                .map(JsValue::from)
                .collect::<js_sys::Array>(),
        )
        .build()
        .unchecked_into()
}

#[wasm_bindgen(typescript_custom_section)]
const STATE_INIT: &str = r#"
export type StateInit = {
    data: string | undefined;
    code: string | undefined;
};
"#;

#[wasm_bindgen(typescript_custom_section)]
const DECODED_INPUT: &str = r#"
export type DecodedInput = {
    method: string,
    input: TokensObject,
};
"#;

#[wasm_bindgen(typescript_custom_section)]
const DECODED_EVENT: &str = r#"
export type DecodedEvent = {
    event: string,
    data: TokensObject,
};
"#;

#[wasm_bindgen(typescript_custom_section)]
const DECODED_OUTPUT: &str = r#"
export type DecodedOutput = {
    method: string,
    output: TokensObject,
};
"#;

#[wasm_bindgen(typescript_custom_section)]
const DECODED_TRANSACTION: &str = r#"
export type DecodedTransaction = {
    method: string,
    input: TokensObject,
    output: TokensObject,
};
"#;

#[wasm_bindgen(typescript_custom_section)]
const DECODED_TRANSACTION_EVENTS: &str = r#"
export type DecodedTransactionEvents = Array<DecodedEvent>;
"#;

#[wasm_bindgen(typescript_custom_section)]
const METHOD_NAME: &str = r#"
export type MethodName = string | string[]
"#;

pub fn parse_method_name(value: MethodName) -> Result<nt_abi::MethodName, JsValue> {
    let value: JsValue = value.unchecked_into();
    if let Some(value) = value.as_string() {
        Ok(nt_abi::MethodName::Known(value))
    } else if js_sys::Array::is_array(&value) {
        let value: js_sys::Array = value.unchecked_into();
        Ok(nt_abi::MethodName::GuessInRange(
            value
                .iter()
                .map(|value| match value.as_string() {
                    Some(value) => Ok(value),
                    None => Err("Expected string or array"),
                })
                .collect::<Result<Vec<_>, &'static str>>()
                .handle_error()?,
        ))
    } else {
        Err("Expected string or array").handle_error()
    }
}

#[wasm_bindgen(typescript_custom_section)]
const TOKEN: &str = r#"
export type AbiToken =
    | boolean
    | string
    | number
    | { [K in string]: AbiToken }
    | AbiToken[]
    | (readonly [AbiToken, AbiToken])[];

type TokensObject = { [K in string]: AbiToken };
"#;

#[wasm_bindgen(typescript_custom_section)]
const PARAM: &str = r#"
export type AbiParamKindUint = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint160' | 'uint256';
export type AbiParamKindInt = 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'int160' | 'int256';
export type AbiParamKindTuple = 'tuple';
export type AbiParamKindBool = 'bool';
export type AbiParamKindCell = 'cell';
export type AbiParamKindAddress = 'address';
export type AbiParamKindBytes = 'bytes';
export type AbiParamKindGram = 'gram';
export type AbiParamKindTime = 'time';
export type AbiParamKindExpire = 'expire';
export type AbiParamKindPublicKey = 'pubkey';
export type AbiParamKindPublicKey = 'string';
export type AbiParamKindArray = `${AbiParamKind}[]`;

export type AbiParamKindMap = `map(${AbiParamKindInt | AbiParamKindUint | AbiParamKindAddress},${AbiParamKind | `${AbiParamKind}[]`})`;

export type AbiParamKind =
  | AbiParamKindUint
  | AbiParamKindInt
  | AbiParamKindTuple
  | AbiParamKindBool
  | AbiParamKindCell
  | AbiParamKindAddress
  | AbiParamKindBytes
  | AbiParamKindGram
  | AbiParamKindTime
  | AbiParamKindExpire
  | AbiParamKindPublicKey;

export type AbiParam = {
  name: string;
  type: AbiParamKind | AbiParamKindMap | AbiParamKindArray;
  components?: AbiParam[];
};
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "TransactionId")]
    pub type TransactionId;

    #[wasm_bindgen(typescript_type = "AccountStatus")]
    pub type AccountStatus;

    #[wasm_bindgen(typescript_type = "Message")]
    pub type Message;

    #[wasm_bindgen(typescript_type = "Transaction")]
    pub type Transaction;

    #[wasm_bindgen(typescript_type = "StateInit")]
    pub type StateInit;

    #[wasm_bindgen(typescript_type = "DecodedInput")]
    pub type DecodedInput;

    #[wasm_bindgen(typescript_type = "DecodedEvent")]
    pub type DecodedEvent;

    #[wasm_bindgen(typescript_type = "DecodedOutput")]
    pub type DecodedOutput;

    #[wasm_bindgen(typescript_type = "DecodedTransaction")]
    pub type DecodedTransaction;

    #[wasm_bindgen(typescript_type = "DecodedTransactionEvents")]
    pub type DecodedTransactionEvents;

    #[wasm_bindgen(typescript_type = "MethodName")]
    pub type MethodName;

    #[wasm_bindgen(typescript_type = "TokensObject")]
    pub type TokensObject;

    #[wasm_bindgen(typescript_type = "Array<AbiParam>")]
    pub type ParamsList;
}

#[derive(thiserror::Error, Debug)]
enum ModelError {
    #[error("Invalid last transaction id")]
    InvalidLastTransactionId,
    #[error("Invalid transaction id")]
    InvalidTransactionId,
}
