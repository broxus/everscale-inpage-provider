use std::convert::TryFrom;
use std::str::FromStr;

use nt::core::models;
use ton_block::{Deserializable, Serializable};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

use crate::tokens_object::*;
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
const GEN_TIMINGS: &str = r#"
export type GenTimings = {
    genLt: string,
    genUtime: number,
};
"#;

pub fn make_gen_timings(data: nt_abi::GenTimings) -> GenTimings {
    let (gen_lt, gen_utime) = match data {
        nt_abi::GenTimings::Unknown => (0, 0),
        nt_abi::GenTimings::Known { gen_lt, gen_utime } => (gen_lt, gen_utime),
    };

    ObjectBuilder::new()
        .set("genLt", gen_lt.to_string())
        .set("genUtime", gen_utime)
        .build()
        .unchecked_into()
}

pub fn parse_gen_timings(data: GenTimings) -> Result<nt_abi::GenTimings, JsValue> {
    #[derive(Clone, serde::Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct ParsedGenTimings {
        gen_lt: String,
        gen_utime: u32,
    }

    let ParsedGenTimings { gen_lt, gen_utime } =
        JsValue::into_serde::<ParsedGenTimings>(&data).handle_error()?;
    let gen_lt = u64::from_str(&gen_lt).handle_error()?;
    match (gen_lt, gen_utime) {
        (0, _) | (_, 0) => Ok(nt_abi::GenTimings::Unknown),
        (gen_lt, gen_utime) => Ok(nt_abi::GenTimings::Known { gen_lt, gen_utime }),
    }
}

#[wasm_bindgen(typescript_custom_section)]
const LAST_TRANSACTION_ID: &str = r#"
export type LastTransactionId = {
    isExact: boolean,
    lt: string,
    hash?: string,
};
"#;

pub fn make_last_transaction_id(data: nt_abi::LastTransactionId) -> LastTransactionId {
    let (lt, hash) = match data {
        nt_abi::LastTransactionId::Exact(id) => (id.lt, Some(id.hash.to_hex_string())),
        nt_abi::LastTransactionId::Inexact { latest_lt } => (latest_lt, None),
    };

    ObjectBuilder::new()
        .set("isExact", data.is_exact())
        .set("lt", lt.to_string())
        .set("hash", hash)
        .build()
        .unchecked_into()
}

pub fn parse_last_transaction_id(
    data: LastTransactionId,
) -> Result<nt_abi::LastTransactionId, JsValue> {
    #[derive(serde::Deserialize)]
    #[serde(rename_all = "camelCase")]
    struct ParsedLastTransactionId {
        is_exact: bool,
        lt: String,
        hash: Option<String>,
    }

    let ParsedLastTransactionId { is_exact, lt, hash } =
        JsValue::into_serde::<ParsedLastTransactionId>(&data).handle_error()?;
    let lt = u64::from_str(&lt).handle_error()?;

    Ok(match (is_exact, hash) {
        (true, Some(hash)) => {
            let hash = ton_types::UInt256::from_str(&hash).handle_error()?;
            nt_abi::LastTransactionId::Exact(nt_abi::TransactionId { lt, hash })
        }
        (false, None) => nt_abi::LastTransactionId::Inexact { latest_lt: lt },
        _ => return Err(ModelError::InvalidLastTransactionId).handle_error(),
    })
}

#[wasm_bindgen(typescript_custom_section)]
const CONTRACT_STATE: &str = r#"
export type ContractState = {
    balance: string,
    genTimings: GenTimings,
    lastTransactionId?: LastTransactionId,
    isDeployed: boolean,
};
"#;

pub fn make_contract_state(data: models::ContractState) -> ContractState {
    ObjectBuilder::new()
        .set("balance", data.balance.to_string())
        .set("genTimings", make_gen_timings(data.gen_timings))
        .set(
            "lastTransactionId",
            data.last_transaction_id.map(make_last_transaction_id),
        )
        .set("isDeployed", data.is_deployed)
        .build()
        .unchecked_into()
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
const PENDING_TRANSACTION: &str = r#"
export type PendingTransaction = {
    messageHash: string,
    bodyHash: string,
    src?: string,
    expireAt: number,
};
"#;

pub fn make_pending_transaction(data: models::PendingTransaction) -> PendingTransaction {
    ObjectBuilder::new()
        .set("messageHash", data.message_hash.to_hex_string())
        .set("bodyHash", data.body_hash.to_hex_string())
        .set("src", data.src.as_ref().map(ToString::to_string))
        .set("expireAt", data.expire_at)
        .build()
        .unchecked_into()
}

#[wasm_bindgen(typescript_custom_section)]
const TRANSACTIONS_LIST: &'static str = r#"
export type TransactionsList = {
    transactions: Transaction[];
    continuation: TransactionId | undefined;
};
"#;

pub fn make_transactions_list(
    raw_transactions: Vec<nt::transport::models::RawTransaction>,
) -> TransactionsList {
    let batch_info = match (raw_transactions.first(), raw_transactions.last()) {
        (Some(first), Some(last)) => Some(nt::core::models::TransactionsBatchInfo {
            min_lt: last.data.lt, // transactions in response are in descending order
            max_lt: first.data.lt,
            batch_type: nt::core::models::TransactionsBatchType::New,
        }),
        _ => None,
    };

    let continuation = raw_transactions.last().and_then(|transaction| {
        (transaction.data.prev_trans_lt != 0).then(|| nt_abi::TransactionId {
            lt: transaction.data.prev_trans_lt,
            hash: transaction.data.prev_trans_hash,
        })
    });
    ObjectBuilder::new()
        .set(
            "transactions",
            raw_transactions
                .into_iter()
                .filter_map(|transaction| {
                    nt::core::models::Transaction::try_from((transaction.hash, transaction.data))
                        .ok()
                })
                .map(make_transaction)
                .collect::<js_sys::Array>(),
        )
        .set("continuation", continuation.map(make_transaction_id))
        .set("info", batch_info.map(make_transactions_batch_info))
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
const TRANSACTIONS_BATCH_INFO: &str = r#"
export type TransactionsBatchType = 'old' | 'new';

export type TransactionsBatchInfo = {
    minLt: string,
    maxLt: string,
    batchType: TransactionsBatchType,
};
"#;

pub fn make_transactions_batch_info(data: models::TransactionsBatchInfo) -> TransactionsBatchInfo {
    ObjectBuilder::new()
        .set("minLt", data.min_lt.to_string())
        .set("maxLt", data.max_lt.to_string())
        .set(
            "batchType",
            match data.batch_type {
                models::TransactionsBatchType::Old => "old",
                models::TransactionsBatchType::New => "new",
            },
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
const EXECUTION_OUTPUT: &str = r#"
export type ExecutionOutput = {
    output?: TokensObject,
    code: number,
};
"#;

pub fn make_execution_output(data: nt_abi::ExecutionOutput) -> Result<ExecutionOutput, JsValue> {
    Ok(ObjectBuilder::new()
        .set("output", data.tokens.map(make_tokens_object).transpose()?)
        .set("code", data.result_code)
        .build()
        .unchecked_into())
}

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

#[wasm_bindgen(typescript_custom_section)]
const TRANSPORT_INFO: &'static str = r#"
export type ReliableBahavior =
    | 'intensive_polling'
    | 'block_walking';

export type TransportInfo = {
    maxTransactionsPerFetch: number;
    reliableBehavior: ReliableBehavior;
};
"#;

pub fn make_transport_info(data: nt::transport::TransportInfo) -> TransportInfo {
    ObjectBuilder::new()
        .set("maxTransactionsPerFetch", data.max_transactions_per_fetch)
        .set("reliableBehavior", data.reliable_behavior.to_string())
        .build()
        .unchecked_into()
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "Promise<GenericContract>")]
    pub type PromiseGenericContract;
}

#[wasm_bindgen(typescript_custom_section)]
const LATEST_BLOCK: &'static str = r#"
export type LatestBlock = {
    id: string,
    endLt: string,
    genUtime: number,
};
"#;

pub fn make_latest_block(latest_block: nt::transport::gql::LatestBlock) -> JsValue {
    ObjectBuilder::new()
        .set("id", latest_block.id)
        .set("endLt", latest_block.end_lt.to_string())
        .set("genUtime", latest_block.gen_utime)
        .build()
}

#[wasm_bindgen(typescript_custom_section)]
const SIGNED_MESSAGE: &str = r#"
export type SignedMessage = {
    hash: string,
    bodyHash: string,
    expireAt: number,
    boc: string,
};
"#;

pub fn make_signed_message(data: nt::crypto::SignedMessage) -> Result<SignedMessage, JsValue> {
    let (boc, hash) = {
        let cell = data.message.write_to_new_cell().handle_error()?.into();
        (
            base64::encode(ton_types::serialize_toc(&cell).handle_error()?),
            cell.repr_hash(),
        )
    };

    Ok(ObjectBuilder::new()
        .set("hash", hash.to_hex_string())
        .set(
            "bodyHash",
            data.message
                .body()
                .map(|body| body.into_cell().repr_hash())
                .unwrap_or_default()
                .to_hex_string(),
        )
        .set("expireAt", data.expire_at)
        .set("boc", boc)
        .build()
        .unchecked_into())
}

pub fn parse_signed_message(data: SignedMessage) -> Result<nt::crypto::SignedMessage, JsValue> {
    if !data.is_object() {
        return Err(TokensJsonError::ObjectExpected).handle_error();
    }
    let message = match js_sys::Reflect::get(&data, &JsValue::from_str("boc"))
        .map_err(|_| TokensJsonError::ParameterNotFound("boc".to_owned()))
        .handle_error()?
        .as_string()
    {
        Some(boc) => {
            let body = base64::decode(boc).handle_error()?;
            let cell = ton_types::deserialize_tree_of_cells(&mut std::io::Cursor::new(&body))
                .handle_error()?;
            ton_block::Message::construct_from_cell(cell).handle_error()?
        }
        None => return Err(TokensJsonError::StringExpected).handle_error(),
    };

    let expire_at = match js_sys::Reflect::get(&data, &JsValue::from_str("expireAt"))
        .map_err(|_| TokensJsonError::ParameterNotFound("expireAt".to_owned()))
        .handle_error()?
        .as_f64()
    {
        Some(expire_at) => expire_at as u32,
        None => return Err(TokensJsonError::NumberExpected).handle_error(),
    };

    Ok(nt::crypto::SignedMessage { message, expire_at })
}

#[wasm_bindgen(typescript_custom_section)]
const POLLING_METHOD: &str = r#"
export type PollingMethod = 'manual' | 'reliable';
"#;

pub fn make_polling_method(s: models::PollingMethod) -> PollingMethod {
    JsValue::from(match s {
        models::PollingMethod::Manual => "manual",
        models::PollingMethod::Reliable => "reliable",
    })
    .unchecked_into()
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "TransactionId")]
    pub type TransactionId;

    #[wasm_bindgen(typescript_type = "GenTimings")]
    pub type GenTimings;

    #[wasm_bindgen(typescript_type = "LastTransactionId")]
    pub type LastTransactionId;

    #[wasm_bindgen(typescript_type = "ContractState")]
    pub type ContractState;

    #[wasm_bindgen(typescript_type = "AccountStatus")]
    pub type AccountStatus;

    #[wasm_bindgen(typescript_type = "Message")]
    pub type Message;

    #[wasm_bindgen(typescript_type = "PendingTransaction")]
    pub type PendingTransaction;

    #[wasm_bindgen(typescript_type = "Promise<PendingTransaction>")]
    pub type PromisePendingTransaction;

    #[wasm_bindgen(typescript_type = "Transaction")]
    pub type Transaction;

    #[wasm_bindgen(typescript_type = "TransactionsList")]
    pub type TransactionsList;

    #[wasm_bindgen(typescript_type = "Promise<TransactionsList>")]
    pub type PromiseTransactionsList;

    #[wasm_bindgen(typescript_type = "TransactionsBatchType")]
    pub type TransactionsBatchType;

    #[wasm_bindgen(typescript_type = "TransactionsBatchInfo")]
    pub type TransactionsBatchInfo;

    #[wasm_bindgen(typescript_type = "Promise<Transaction>")]
    pub type PromiseTransaction;

    #[wasm_bindgen(typescript_type = "PollingMethod")]
    pub type PollingMethod;

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

    #[wasm_bindgen(typescript_type = "ExecutionOutput")]
    pub type ExecutionOutput;

    #[wasm_bindgen(typescript_type = "MethodName")]
    pub type MethodName;

    #[wasm_bindgen(typescript_type = "TokensObject")]
    pub type TokensObject;

    #[wasm_bindgen(typescript_type = "Array<AbiParam>")]
    pub type ParamsList;

    #[wasm_bindgen(typescript_type = "TransportInfo")]
    pub type TransportInfo;

    #[wasm_bindgen(typescript_type = "Promise<LatestBlock>")]
    pub type PromiseLatestBlock;

    #[wasm_bindgen(typescript_type = "SignedMessage")]
    pub type SignedMessage;
}

#[derive(thiserror::Error, Debug)]
enum ModelError {
    #[error("Invalid last transaction id")]
    InvalidLastTransactionId,
    #[error("Invalid transaction id")]
    InvalidTransactionId,
}
