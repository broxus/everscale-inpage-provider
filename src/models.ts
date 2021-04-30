// Account stuff
//

export interface ContractState {
  balance: string,
  genTimings: GenTimings,
  lastTransactionId?: LastTransactionId,
  isDeployed: boolean,
}

export interface FullContractState extends ContractState {
  boc: string,
}

export interface GenTimings {
  genLt: string,
  genUtime: number,
}

export type ContractType =
  | 'SafeMultisigWallet'
  | 'SafeMultisigWallet24h'
  | 'SetcodeMultisigWallet'
  | 'SurfWallet'
  | 'WalletV3';

// Transaction stuff
//

export interface Transaction {
  id: TransactionId,
  prevTransactionId?: TransactionId,
  createdAt: number,
  aborted: boolean,
  origStatus: AccountStatus,
  endStatus: AccountStatus,
  totalFees: string,
  inMessage: Message,
  outMessages: Message[],
}

export interface Message {
  src?: string,
  dst?: string,
  value: string,
  bounce: boolean,
  bounced: boolean,
  bodyHash?: string,
}

export type AccountStatus = 'uninit' | 'frozen' | 'active' | 'nonexist';

export interface LastTransactionId {
  isExact: boolean,
  lt: string,
  hash?: string,
}

export interface TransactionId {
  lt: string,
  hash: string,
}

// ABI stuff
//

export interface SignedMessage {
  bodyHash: string,
  expireAt: number,
  boc: string,
}

export type AbiToken =
  | boolean
  | string
  | number
  | { [K in string]: AbiToken }
  | AbiToken[]
  | [AbiToken, AbiToken][];

export type TokensObject = { [K in string]: AbiToken };

export type HeadersObject = {
  pubkey?: string
  expire?: string | number
  time?: string | number
}

export interface FunctionCall {
  // Contract ABI
  abi: string
  // Specific method from specified contract ABI
  method: string
  // Method arguments
  params: TokensObject
}

export interface ExternalFunctionCall extends FunctionCall {
  // Optionally explicit header values
  headers?: HeadersObject,
}
