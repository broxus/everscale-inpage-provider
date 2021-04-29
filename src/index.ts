import {
    ProviderEvent,
    ProviderEventData,
    ProviderMethod,
    ProviderRequestParams,
    ProviderResponse
} from "./api";

export * from './api'
export * from './models'
export * from './permissions'

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

let ton: Ton = (window as any).ton

let resolveInitialized: (() => void) | undefined
const initializationPromise = new Promise<void>((resolve) => {
    resolveInitialized = () => resolve()
})

if (ton != null) {
    resolveInitialized?.()
} else {
    window.addEventListener("ton#initialized", (_data) => {
        resolveInitialized?.()
        ton = (window as any).ton
    });
}

export async function ensureProviderInitialized() {
    return initializationPromise
}

export default ton
