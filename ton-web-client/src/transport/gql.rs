use nt::transport::Transport;
use std::sync::Arc;

use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::*;

use super::{IntoHandle, TransportHandle};
use crate::external::{GqlConnectionImpl, GqlSender};
use crate::generic_contract::*;
use crate::models::*;
use crate::utils::*;

#[wasm_bindgen]
#[derive(Clone)]
pub struct GqlTransport {
    #[wasm_bindgen(skip)]
    pub inner: Arc<GqlConnectionImpl>,
}

#[wasm_bindgen]
impl GqlTransport {
    #[wasm_bindgen(constructor)]
    pub fn new(sender: GqlSender) -> Self {
        Self {
            inner: Arc::new(GqlConnectionImpl::new(sender)),
        }
    }

    #[wasm_bindgen(js_name = "subscribeToGenericContract")]
    pub fn subscribe_to_generic_contract_wallet(
        &self,
        address: &str,
        handler: GenericContractSubscriptionHandlerImpl,
    ) -> Result<PromiseGenericContract, JsValue> {
        let address = parse_address(address)?;

        let transport = Arc::new(self.make_transport());
        let handler = Arc::new(GenericContractSubscriptionHandler::from(handler));

        Ok(JsCast::unchecked_into(future_to_promise(async move {
            let wallet = nt::core::generic_contract::GenericContract::subscribe(
                transport.clone() as Arc<dyn nt::transport::Transport>,
                address,
                handler,
            )
            .await
            .handle_error()?;

            Ok(JsValue::from(GenericContract::new(
                transport.into_handle(),
                wallet,
            )))
        })))
    }

    #[wasm_bindgen(js_name = "getLatestBlock")]
    pub fn get_latest_block(&self, address: &str) -> Result<PromiseLatestBlock, JsValue> {
        let address = parse_address(address)?;
        let transport = self.make_transport();

        Ok(JsCast::unchecked_into(future_to_promise(async move {
            let latest_block = transport.get_latest_block(&address).await.handle_error()?;
            Ok(make_latest_block(latest_block))
        })))
    }

    #[wasm_bindgen(js_name = "waitForNextBlock")]
    pub fn wait_for_next_block(
        &self,
        current_block_id: String,
        address: &str,
        timeout: u32,
    ) -> Result<PromiseString, JsValue> {
        let address = parse_address(address)?;
        let transport = self.make_transport();

        Ok(JsCast::unchecked_into(future_to_promise(async move {
            let next_block = transport
                .wait_for_next_block(
                    &current_block_id,
                    &address,
                    std::time::Duration::from_secs(timeout as u64),
                )
                .await
                .handle_error()?;
            Ok(JsValue::from(next_block))
        })))
    }

    #[wasm_bindgen(js_name = "getTransactions")]
    pub fn get_transactions(
        &self,
        address: &str,
        continuation: Option<TransactionId>,
        limit: u8,
    ) -> Result<PromiseTransactionsList, JsValue> {
        let address = parse_address(address)?;
        let before_lt = continuation
            .map(parse_transaction_id)
            .transpose()?
            .map(|id| id.lt);
        let transport = self.make_transport();

        Ok(JsCast::unchecked_into(future_to_promise(async move {
            let raw_transactions = transport
                .get_transactions(
                    address,
                    nt_abi::TransactionId {
                        lt: before_lt.unwrap_or(u64::MAX),
                        hash: Default::default(),
                    },
                    limit,
                )
                .await
                .handle_error()?;
            Ok(make_transactions_list(raw_transactions).unchecked_into())
        })))
    }
}

impl GqlTransport {
    pub fn make_transport(&self) -> nt::transport::gql::GqlTransport {
        nt::transport::gql::GqlTransport::new(self.inner.clone())
    }
}

impl IntoHandle for Arc<nt::transport::gql::GqlTransport> {
    fn into_handle(self) -> TransportHandle {
        TransportHandle::GraphQl(self)
    }
}
