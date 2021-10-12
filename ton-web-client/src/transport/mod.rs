use std::sync::Arc;

use wasm_bindgen::prelude::*;

use crate::models::*;
use crate::utils::HandleError;

pub mod gql;

pub trait IntoHandle: Sized {
    fn into_handle(self) -> TransportHandle;
}

#[derive(Clone)]
pub enum TransportHandle {
    GraphQl(Arc<nt::transport::gql::GqlTransport>),
    Adnl(Arc<dyn nt::transport::Transport>),
}

impl TransportHandle {
    pub fn transport(&self) -> &dyn nt::transport::Transport {
        match self {
            Self::GraphQl(transport) => transport.as_ref(),
            Self::Adnl(transport) => transport.as_ref(),
        }
    }

    pub fn info(&self) -> TransportInfo {
        make_transport_info(self.transport().info())
    }

    pub async fn get_block(&self, block_id: &str) -> Result<ton_block::Block, JsValue> {
        match self {
            Self::GraphQl(transport) => transport.get_block(block_id).await.handle_error(),
            Self::Adnl(_) => Err(TransportError::MethodNotSupported).handle_error(),
        }
    }
}

#[derive(thiserror::Error, Debug)]
enum TransportError {
    #[error("Method not supported")]
    MethodNotSupported,
}
