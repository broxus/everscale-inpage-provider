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

export interface Ton {
  request<T extends ProviderMethod>(data: TonRequest<T>): Promise<ProviderResponse<T>>

  addListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  on<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  once<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: ProviderEventData<T>) => void): void
}

type ProviderApiMethods = {
  [P in ProviderMethod]: (args: ProviderRequestParams<P>) => Promise<ProviderResponse<P>>
}

export type IProviderRpcClient = {
  [K in ProviderMethod | keyof Ton]: K extends keyof ProviderMethod
    ? ProviderApiMethods[K]
    : K extends keyof Ton
      ? Ton[K]
      : never
}

export const makeProviderRpcClient = (
  ton: Ton
): IProviderRpcClient => {
  return new Proxy(ton, {
    get: <K extends ProviderMethod>(
      object: Ton,
      method: K
    ) => {
      return (params: ProviderRequestParams<K>) =>
        object.request({ method, params });
    }
  }) as IProviderRpcClient;
};

export function hasTonProvider() {
  return (window as any).ton != null;
}

let tonProvider: IProviderRpcClient | null = hasTonProvider() ? makeProviderRpcClient((window as any).ton) : null;

let resolveInitialized: (() => void) | undefined;
const initializationPromise = new Promise<void>((resolve) => {
  resolveInitialized = () => resolve();
});

if (tonProvider != null) {
  resolveInitialized?.();
} else {
  window.addEventListener('ton#initialized', (_data) => {
    resolveInitialized?.();
    tonProvider = makeProviderRpcClient((window as any).ton);
  });
}

export async function ensureProviderInitialized() {
  return initializationPromise;
}

export default tonProvider!;
