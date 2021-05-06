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
import { IContract, AbiFunctionName, AbiFunctionParams, AbiFunctionOutput } from './utils';

export * from './api';
export * from './models';
export * from './permissions';

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

/**
 * Creates a typed wrapper around contract abi object and address
 *
 * @param abi
 * @param address
 *
 * @example
 * const abi = {
 *   'ABI version': 2,
 *   'header': ['time', 'expire'],
 *   'functions': [
 *     {
 *       'name': 'testMethod',
 *       'inputs': [
 *         { 'name': 'param', 'type': 'address' }
 *       ],
 *       'outputs': [
 *         { 'name': 'value0', 'type': 'uint256' }
 *       ]
 *     }
 *   ]
 * } as const; // < `as const` is required to make types deduction work
 *
 * const contract = makeTypedContract(abi, '....some address..')
 * const { value0 } = await contract.testMethod({
 *   param: '....another address...'
 * })
 * console.log(value0)
 */
export function makeTypedContract<C>(abi: C, address: string): IContract<C> {
  class TypedContract {
    abi: string;
    address: string;

    constructor(abi: any, address: string) {
      this.abi = JSON.stringify(abi);
      this.address = address;
    }
  }

  return new Proxy(new TypedContract(abi, address), {
    get: <K extends AbiFunctionName<C>>(object: TypedContract, method: K) => {
      return (params: AbiFunctionParams<C, K>) => provider.runLocal({
        address: object.address,
        functionCall: {
          abi: object.abi,
          method: method as string,
          params
        }
      });
    }
  }) as unknown as IContract<C>;
}

export default provider;
