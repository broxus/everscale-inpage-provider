import {
  ProviderEvent,
  ProviderEventData,
  ProviderMethod,
  ProviderRequestParams,
  ProviderResponse
} from './api';
import {
  Transaction,
  TransactionsBatchInfo
} from './models';
import { AbiFunctionName, AbiFunctionParams, AbiFunctionOutput, Address, AddressLiteral } from './utils';

export * from './api';
export * from './models';
export * from './permissions';
export { Address, AddressLiteral } from './utils';

export interface TonRequest<T extends ProviderMethod> {
  method: T
  params: ProviderRequestParams<T>
}

interface Emitter {
  addListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  on<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  once<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void
}

export interface Ton extends Emitter {
  request<T extends ProviderMethod>(data: TonRequest<T>): Promise<ProviderResponse<T>>
}

type RpcMethod<P extends ProviderMethod> = ProviderRequestParams<P> extends {}
  ? (args: ProviderRequestParams<P>) => Promise<ProviderResponse<P>>
  : () => Promise<ProviderResponse<P>>

interface IProviderRpcClient extends Emitter {
  ensureInitialized(): Promise<void>
}

type ProviderApiMethods = {
  [P in ProviderMethod]: RpcMethod<P>
}

export type IProvider = {
  [K in ProviderMethod | keyof IProviderRpcClient]: K extends ProviderMethod
    ? ProviderApiMethods[K]
    : K extends keyof IProviderRpcClient
      ? IProviderRpcClient[K]
      : never
}

let ensurePageLoaded: Promise<void>;
if (document.readyState == 'complete') {
  ensurePageLoaded = Promise.resolve();
} else {
  ensurePageLoaded = new Promise<void>((resolve) => {
    window.addEventListener('load', () => {
      resolve();
    });
  });
}

export async function hasTonProvider() {
  await ensurePageLoaded;
  return (window as Record<string, any>).hasTonProvider === true;
}

/**
 * Modifies knownTransactions array, merging it with new transactions.
 * All arrays are assumed to be sorted by descending logical time.
 *
 * > Note! This method does not remove duplicates.
 *
 * @param knownTransactions
 * @param newTransactions
 * @param info
 */
export function mergeTransactions(
  knownTransactions: Transaction[],
  newTransactions: Transaction[],
  info: TransactionsBatchInfo
): Transaction[] {
  if (info.batchType == 'old') {
    knownTransactions.push(...newTransactions);
    return knownTransactions;
  }

  if (knownTransactions.length === 0) {
    knownTransactions.push(...newTransactions);
    return knownTransactions;
  }

  // Example:
  // known lts: [N, N-1, N-2, N-3, (!) N-10,...]
  // new lts: [N-4, N-5]
  // batch info: { minLt: N-5, maxLt: N-4, batchType: 'new' }

  // 1. Skip indices until known transaction lt is greater than the biggest in the batch
  let i = 0;
  while (
    i < knownTransactions.length &&
    knownTransactions[i].id.lt.localeCompare(info.maxLt) >= 0
    ) {
    ++i;
  }

  // 2. Insert new transactions
  knownTransactions.splice(i, 0, ...newTransactions);
  return knownTransactions;
}

class ProviderRpcClient implements IProviderRpcClient {
  private readonly _initializationPromise: Promise<void>;
  private _ton?: Ton;

  constructor() {
    this._ton = (window as any).ton;
    if (this._ton != null) {
      this._initializationPromise = Promise.resolve();
      return;
    }

    this._initializationPromise = hasTonProvider().then((hasTonProvider) => new Promise((resolve, reject) => {
      if (!hasTonProvider) {
        reject(new Error('TON provider was not found'));
        return;
      }

      this._ton = (window as any).ton;
      if (this._ton != null) {
        resolve();
      } else {
        window.addEventListener('ton#initialized', (_data) => {
          this._ton = (window as any).ton;
          resolve();
        });
      }
    }));
  }

  public async ensureInitialized() {
    await this._initializationPromise;
  }

  public get isInitialized() {
    return this._ton != null;
  }

  public get ton() {
    return this._ton!;
  }

  addListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void {
    this._ton?.addListener(eventName, listener);
  }

  on<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void {
    this._ton?.on(eventName, listener);
  }

  once<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void {
    this._ton?.once(eventName, listener);
  }

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void {
    this._ton?.prependListener(eventName, listener);
  }

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void {
    this._ton?.prependOnceListener(eventName, listener);
  }
}

const provider = new Proxy(new ProviderRpcClient(), {
  get: <K extends ProviderMethod>(
    object: ProviderRpcClient,
    method: K
  ) => {
    const property = (object as any)[method];
    if (property != null) {
      return property;
    }

    return (params?: ProviderRequestParams<K>) => object.ton.request({ method, params: params! });
  }
}) as unknown as IProvider;

export default provider;

interface ISendInternal {
  from: Address,
  amount: string,
  /**
   * @default true
   */
  bounce?: boolean,
}

interface ISendExternal {
  publicKey: string,
  stateInit?: string,
}

interface IContractMethod<I, O> {
  /**
   * Target contract address
   */
  readonly address: Address
  readonly abi: string
  readonly method: string
  readonly params: I

  /**
   * Sends internal message and returns wallet transactions
   *
   * @param args
   */
  send(args: ISendInternal): Promise<Transaction>

  /**
   * Sends external message and returns contract transaction with parsed output
   *
   * @param args
   */
  sendExternal(args: ISendExternal): Promise<{ transaction: Transaction, output?: O }>

  /**
   * Runs message locally
   */
  call(): Promise<(O | undefined) & { _tvmExitCode: number }>
}

type IContractMethods<C> = {
  [K in AbiFunctionName<C>]: (params: AbiFunctionParams<C, K>) => IContractMethod<AbiFunctionParams<C, K>, AbiFunctionOutput<C, K>>
}

export class Contract<Abi> {
  private readonly _abi: string;
  private readonly _address: Address;
  private readonly _methods: IContractMethods<Abi>;

  constructor(abi: Abi, address: Address) {
    this._abi = JSON.stringify(abi);
    this._address = address;

    class ContractMethod implements IContractMethod<any, any> {
      constructor(readonly abi: string, readonly address: Address, readonly method: string, readonly params: any) {
      }

      async send(args: ISendInternal): Promise<Transaction> {
        const { transaction } = await provider.sendMessage({
          sender: args.from.toString(),
          recipient: this.address.toString(),
          amount: args.amount,
          bounce: args.bounce == null ? true : args.bounce,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });
        return transaction;
      }

      sendExternal(args: ISendExternal): Promise<{ transaction: Transaction, output?: any }> {
        return provider.sendExternalMessage({
          publicKey: args.publicKey,
          recipient: this.address.toString(),
          stateInit: args.stateInit,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });
      }

      async call(): Promise<any> {
        let { output, code } = await provider.runLocal({
          address: this.address.toString(),
          functionCall: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });

        if (output == null) {
          output = {};
        }
        output._tvmExitCode = code;

        return output;
      }
    }

    this._methods = new Proxy({}, {
      get: <K extends AbiFunctionName<Abi>>(_object: {}, method: K) => {
        return (params: AbiFunctionParams<Abi, K>) => new ContractMethod(this._abi, this._address, method, params);
      }
    }) as unknown as IContractMethods<Abi>;
  }

  public get methods() {
    return this._methods;
  }
}
