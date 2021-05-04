import {
  ProviderEvent,
  ProviderEventData,
  ProviderMethod,
  ProviderRequestParams,
  ProviderResponse
} from './api';

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

export function hasTonProvider() {
  return (window as any).hasTonProvider === true;
}

class ProviderRpcClient implements IProviderRpcClient {
  private readonly _initializationPromise: Promise<void>;
  private _ton?: Ton;

  constructor() {
    if (!hasTonProvider()) {
      this._initializationPromise = Promise.reject(new Error('TON provider was not found'))
      return;
    }

    this._ton = (window as any).ton;
    if (this._ton != null) {
      this._initializationPromise = Promise.resolve();
    } else {
      let resolveInitialized: (() => void) | undefined;

      this._initializationPromise = new Promise<void>((resolve) => {
        resolveInitialized = () => resolve();
      });

      window.addEventListener('ton#initialized', (_data) => {
        this._ton = (window as any).ton;
        resolveInitialized?.();
      });
    }
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
