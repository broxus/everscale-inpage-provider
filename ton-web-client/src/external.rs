use std::sync::Arc;

use anyhow::Result;
use futures::channel::oneshot;
use wasm_bindgen::prelude::*;

pub struct GqlConnectionImpl {
    sender: Arc<GqlSender>,
}

impl GqlConnectionImpl {
    pub fn new(sender: GqlSender) -> Self {
        Self {
            sender: Arc::new(sender),
        }
    }
}

#[async_trait::async_trait]
impl nt::external::GqlConnection for GqlConnectionImpl {
    fn is_local(&self) -> bool {
        self.sender.is_local()
    }

    async fn post(&self, data: &str) -> Result<String> {
        let (tx, rx) = oneshot::channel();

        self.sender.send(data, GqlQuery { tx });

        let response = rx.await.unwrap_or(Err(GqlQueryError::RequestDropped))?;
        Ok(response)
    }
}

#[wasm_bindgen]
extern "C" {
    pub type GqlSender;

    #[wasm_bindgen(method, js_name = "isLocal")]
    pub fn is_local(this: &GqlSender) -> bool;

    #[wasm_bindgen(method)]
    pub fn send(this: &GqlSender, data: &str, handler: GqlQuery);
}

unsafe impl Send for GqlSender {}
unsafe impl Sync for GqlSender {}

#[wasm_bindgen]
pub struct GqlQuery {
    #[wasm_bindgen(skip)]
    pub tx: oneshot::Sender<GqlQueryResult>,
}

type GqlQueryResult = Result<String, GqlQueryError>;

#[derive(thiserror::Error, Debug)]
pub enum GqlQueryError {
    #[error("Request dropped unexpectedly")]
    RequestDropped,
    #[error("Timeout reached")]
    TimeoutReached,
    #[error("Request failed")]
    RequestFailed,
}
