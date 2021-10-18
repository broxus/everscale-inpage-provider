import init, * as nt from 'nekoton-wasm';
import safeStringify from 'fast-safe-stringify';

import { SafeEventEmitter } from '../utils';
import {
  FullContractState,
  GenTimings,
  Provider,
  ProviderMethod,
  RawFunctionCall,
  RawProviderApiResponse,
  RawProviderRequest,
} from '../index';

let clientInitializationStarted: boolean = false;
let notifyClientInitialized: { resolve: () => void, reject: () => void };
let initializationPromise: Promise<void> = new Promise<void>((resolve, reject) => {
  notifyClientInitialized = { resolve, reject };
});

export function ensureClientInitialized(): Promise<void> {
  if (!clientInitializationStarted) {
    clientInitializationStarted = true;
    init().then(notifyClientInitialized.resolve).catch(notifyClientInitialized.reject);
  }
  return initializationPromise;
}

export type StandaloneTonClientProperties = {};

export const DEFAULT_STANDALONE_TON_CLIENT_PROPERTIES: StandaloneTonClientProperties = {};

export class StandaloneTonClient extends SafeEventEmitter implements Provider {
  private _context: Context;
  private _handlers: { [K in ProviderMethod]?: ProviderHandler<K> } = {
    getFullContractState,
    getTransactions,
    runLocal,
    getExpectedAddress,
    packIntoCell,
    unpackFromCell,
    extractPublicKey,
    codeToTvc,
    splitTvc,
    encodeInternalInput,
    decodeInput,
    decodeEvent,
    decodeOutput,
    decodeTransaction,
    decodeTransactionEvents,
    verifySignature,
  };

  constructor(params: StandaloneTonClientProperties) {
    super();
    this._context = new Context(params);
  }

  request<T extends ProviderMethod>(req: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>> {
    const handler = this._handlers[req.method] as any as ProviderHandler<T> | undefined;
    if (handler == null) {
      throw invalidRequest(req, 'Method is not supported by standalone transport');
    }
    return handler(this._context, req);
  }
}

class Context {
  constructor(public params: StandaloneTonClientProperties) {
  }

  public get transport(): nt.GqlTransport {
    return null!;
  }
}

type ProviderHandler<T extends ProviderMethod> = (ctx: Context, req: RawProviderRequest<T>) => Promise<RawProviderApiResponse<T>>;

const getFullContractState: ProviderHandler<'getFullContractState'> = async (ctx, req) => {
  requireParams(req);

  const { address } = req.params;
  requireString(req, req.params, 'address');

  return { state: await ctx.transport.getFullContractState(address) };
};

const getTransactions: ProviderHandler<'getTransactions'> = async (ctx, req) => {
  requireParams(req);

  const { address, continuation, limit } = req.params;
  requireString(req, req.params, 'address');
  requireOptional(req, req.params, 'continuation', requireTransactionId);
  requireOptionalNumber(req, req.params, 'limit');

  try {
    return ctx.transport.getTransactions(address, continuation, limit || 50);
  } catch (e: any) {
    throw invalidRequest(req, e.toString());
  }
};

const runLocal: ProviderHandler<'runLocal'> = async (ctx, req) => {
  requireParams(req);

  const { address, cachedState, functionCall } = req.params;
  requireString(req, req.params, 'address');
  requireOptional(req, req.params, 'cachedState', requireContractState);
  requireFunctionCall(req, req.params, 'functionCall');

  let contractState = cachedState;
  if (contractState == null) {
    contractState = await ctx.transport.getFullContractState(address);
  }

  if (contractState == null) {
    throw invalidRequest(req, 'Account not found');
  }
  if (!contractState.isDeployed || contractState.lastTransactionId == null) {
    throw invalidRequest(req, 'Account is not deployed');
  }

  try {
    const { output, code } = nt.runLocal(
      contractState.genTimings,
      contractState.lastTransactionId,
      contractState.boc,
      functionCall.abi,
      functionCall.method,
      functionCall.params,
    );
    return { output, code };
  } catch (e: any) {
    throw invalidRequest(req, e.toString());
  }
};

const getExpectedAddress: ProviderHandler<'getExpectedAddress'> = async (_ctx, req) => {
  requireParams(req);

  const { tvc, abi, workchain, publicKey, initParams } = req.params;
  requireString(req, req.params, 'tvc');
  requireString(req, req.params, 'abi');
  requireOptionalNumber(req, req.params, 'workchain');
  requireOptionalString(req, req.params, 'publicKey');

  try {
    return { address: nt.getExpectedAddress(tvc, abi, workchain || 0, publicKey, initParams) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const packIntoCell: ProviderHandler<'packIntoCell'> = async (_ctx, req) => {
  requireParams(req);

  const { structure, data } = req.params;
  requireArray(req, req.params, 'structure');

  try {
    return { boc: nt.packIntoCell(structure as nt.AbiParam[], data) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const unpackFromCell: ProviderHandler<'unpackFromCell'> = async (_ctx, req) => {
  requireParams(req);

  const { structure, boc, allowPartial } = req.params;
  requireArray(req, req.params, 'structure');
  requireString(req, req.params, 'boc');
  requireBoolean(req, req.params, 'allowPartial');

  try {
    return { data: nt.unpackFromCell(structure as nt.AbiParam[], boc, allowPartial) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const extractPublicKey: ProviderHandler<'extractPublicKey'> = async (_ctx, req) => {
  requireParams(req);

  const { boc } = req.params;
  requireString(req, req.params, 'boc');

  try {
    return { publicKey: nt.extractPublicKey(boc) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const codeToTvc: ProviderHandler<'codeToTvc'> = async (_ctx, req) => {
  requireParams(req);

  const { code } = req.params;
  requireString(req, req.params, 'code');

  try {
    return { tvc: nt.codeToTvc(code) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const splitTvc: ProviderHandler<'splitTvc'> = async (_ctx, req) => {
  requireParams(req);

  const { tvc } = req.params;
  requireString(req, req.params, 'tvc');

  try {
    return nt.splitTvc(tvc);
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const encodeInternalInput: ProviderHandler<'encodeInternalInput'> = async (_ctx, req) => {
  requireParams(req);

  requireFunctionCall(req, req, 'params');
  const { abi, method, params } = req.params;

  try {
    return { boc: nt.encodeInternalInput(abi, method, params) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const decodeInput: ProviderHandler<'decodeInput'> = async (_ctx, req) => {
  requireParams(req);

  const { body, abi, method, internal } = req.params;
  requireString(req, req.params, 'body');
  requireString(req, req.params, 'abi');
  requireMethodOrArray(req, req.params, 'method');
  requireBoolean(req, req.params, 'internal');

  try {
    return nt.decodeInput(body, abi, method, internal) || null;
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const decodeEvent: ProviderHandler<'decodeEvent'> = async (_ctx, req) => {
  requireParams(req);

  const { body, abi, event } = req.params;
  requireString(req, req.params, 'body');
  requireString(req, req.params, 'abi');
  requireMethodOrArray(req, req.params, 'event');

  try {
    return nt.decodeEvent(body, abi, event) || null;
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const decodeOutput: ProviderHandler<'decodeOutput'> = async (_ctx, req) => {
  requireParams(req);

  const { body, abi, method } = req.params;
  requireString(req, req.params, 'body');
  requireString(req, req.params, 'abi');
  requireMethodOrArray(req, req.params, 'method');

  try {
    return nt.decodeOutput(body, abi, method) || null;
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const decodeTransaction: ProviderHandler<'decodeTransaction'> = async (_ctx, req) => {
  requireParams(req);

  const { transaction, abi, method } = req.params;
  requireString(req, req.params, 'abi');
  requireMethodOrArray(req, req.params, 'method');

  try {
    return nt.decodeTransaction(transaction, abi, method) || null;
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const decodeTransactionEvents: ProviderHandler<'decodeTransactionEvents'> = async (_ctx, req) => {
  requireParams(req);

  const { transaction, abi } = req.params;
  requireString(req, req.params, 'abi');

  try {
    return { events: nt.decodeTransactionEvents(transaction, abi) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};

const verifySignature: ProviderHandler<'verifySignature'> = async (_ctx, req) => {
  requireParams(req);

  const { publicKey, dataHash, signature } = req.params;
  requireString(req, req.params, 'publicKey');
  requireString(req, req.params, 'dataHash');
  requireString(req, req.params, 'signature');

  try {
    return { isValid: nt.verifySignature(publicKey, dataHash, signature) };
  } catch (e) {
    throw invalidRequest(req, e.toString());
  }
};


function requireParams<T extends ProviderMethod>(req: any): asserts req is RawProviderRequest<T> {
  if (req.params == null || typeof req.params !== 'object') {
    throw invalidRequest(req, 'required params object');
  }
}

function requireObject<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'object') {
    throw invalidRequest(req, `'${key}' must be an object`);
  }
}

function requireOptionalObject<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (property != null && typeof property !== 'object') {
    throw invalidRequest(req, `'${key}' must be an object if specified`);
  }
}

function requireBoolean<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'boolean') {
    throw invalidRequest(req, `'${key}' must be a boolean`);
  }
}

function requireOptionalBoolean<O, P extends keyof O>(
  req: RawProviderRequest<ProviderMethod>,
  object: O,
  key: P,
) {
  const property = object[key];
  if (property != null && typeof property !== 'boolean') {
    throw invalidRequest(req, `'${key}' must be a boolean if specified`);
  }
}

function requireString<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'string' || property.length === 0) {
    throw invalidRequest(req, `'${key}' must be non-empty string`);
  }
}

function requireOptionalString<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (property != null && (typeof property !== 'string' || property.length === 0)) {
    throw invalidRequest(req, `'${key}' must be a non-empty string if provided`);
  }
}

function requireNumber<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'number') {
    throw invalidRequest(req, `'${key}' must be a number`);
  }
}

function requireOptionalNumber<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (property != null && typeof property !== 'number') {
    throw invalidRequest(req, `'${key}' must be a number if provider`);
  }
}

function requireArray<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (!Array.isArray(property)) {
    throw invalidRequest(req, `'${key}' must be an array`);
  }
}

function requireOptional<O, P extends keyof O>(
  req: RawProviderRequest<ProviderMethod>,
  object: O,
  key: P,
  predicate: (req: RawProviderRequest<ProviderMethod>, object: O, key: P) => void,
) {
  const property = object[key];
  if (property != null) {
    predicate(req, object, key);
  }
}

function requireTransactionId<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  requireObject(req, object, key);
  const property = (object[key] as unknown) as nt.TransactionId;
  requireString(req, property, 'lt');
  requireString(req, property, 'hash');
}

function requireLastTransactionId<O, P extends keyof O>(
  req: RawProviderRequest<ProviderMethod>,
  object: O,
  key: P,
) {
  requireObject(req, object, key);
  const property = (object[key] as unknown) as nt.LastTransactionId;
  requireBoolean(req, property, 'isExact');
  requireString(req, property, 'lt');
  requireOptionalString(req, property, 'hash');
}

function requireGenTimings<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  requireObject(req, object, key);
  const property = (object[key] as unknown) as GenTimings;
  requireString(req, property, 'genLt');
  requireNumber(req, property, 'genUtime');
}

function requireContractState<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  requireObject(req, object, key);
  const property = (object[key] as unknown) as FullContractState;
  requireString(req, property, 'balance');
  requireGenTimings(req, property, 'genTimings');
  requireOptional(req, property, 'lastTransactionId', requireLastTransactionId);
  requireBoolean(req, property, 'isDeployed');
}

function requireFunctionCall<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  requireObject(req, object, key);
  const property = (object[key] as unknown) as RawFunctionCall;
  requireString(req, property, 'abi');
  requireString(req, property, 'method');
  requireObject(req, property, 'params');
}

function requireMethodOrArray<O, P extends keyof O>(req: RawProviderRequest<ProviderMethod>, object: O, key: P) {
  const property = object[key];
  if (typeof property !== 'string' && !Array.isArray(property)) {
    throw invalidRequest(req, `'${key}' must be a method name or an array of possible names`);
  }
}

const invalidRequest = (req: RawProviderRequest<ProviderMethod>, message: string, data?: unknown) =>
  new NekotonRpcError(2, `${req.method}: ${message}`, data);

class NekotonRpcError<T> extends Error {
  code: number;
  data?: T;

  constructor(code: number, message: string, data?: T) {
    if (!Number.isInteger(code)) {
      throw new Error('"code" must be an integer');
    }

    if (!message || (typeof message as any) !== 'string') {
      throw new Error('"message" must be a nonempty string');
    }

    super(message);

    this.code = code;
    this.data = data;
  }

  serialize(): JsonRpcError {
    const serialized: JsonRpcError = {
      code: this.code,
      message: this.message,
    };
    if (this.data !== undefined) {
      serialized.data = this.data;
    }
    if (this.stack) {
      serialized.stack = this.stack;
    }
    return serialized;
  }

  toString(): string {
    return safeStringify(this.serialize(), stringifyReplacer, 2);
  }
}

interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
  stack?: string;
}

const stringifyReplacer = (_: unknown, value: unknown): unknown => {
  if (value === '[Circular]') {
    return undefined;
  }
  return value;
};
