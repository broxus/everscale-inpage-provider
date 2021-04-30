import { Permission, Permissions } from './permissions';
import { FullContractState, TokensObject, Transaction } from './models';
import { UniqueArray } from './utils';

export type ProviderEvents = {
  disconnect: {},
}

export type ProviderEvent = keyof ProviderEvents
export type ProviderEventData<T extends ProviderEvent> = ProviderEvents[T]


export type InternalMessageParams = {
  abi: string
  method: string
  params: TokensObject
}

export type ProviderApi = {
  requestPermissions: {
    input: {
      permissions: UniqueArray<Permission>[]
    }
    output: {}
  }
  getProviderState: {
    output: {
      selectedConnection: string
      permissions: Partial<Permissions>
    }
  }
  getFullAccountState: {
    input: {
      address: string
    }
    output: {
      state?: FullContractState
    }
  }
  runLocal: {
    input: {
      address: string
      abi: string
      method: string
      params: TokensObject
    }
    output: {
      output: TokensObject
    }
  }
  getExpectedAddress: {
    input: {
      tvc: string
      abi: string
      workchain?: number
      publicKey?: string
      initParams: TokensObject
    }
    output: {
      address: string
    }
  }
  encodeInternalInput: {
    input: {
      abi: string
      method: string
      params: TokensObject
    }
    output: {
      boc: string
    }
  }
  decodeInput: {
    input: {
      body: string
      abi: string
      method: string
      internal: boolean
    }
    output: {
      output: TokensObject
    }
  }
  decodeOutput: {
    input: {
      body: string
      abi: string
      method: string
    }
    output: {
      output: TokensObject
    }
  }
  estimateFees: {
    input: {
      address: string
      amount: string
      payload?: InternalMessageParams
    }
    output: {
      fees: string
    }
  }
  sendMessage: {
    input: {
      address: string
      amount: string
      bounce: boolean
      payload?: InternalMessageParams
    }
    output: {
      transaction: Transaction
      output?: TokensObject
    }
  }
}

export type ProviderMethod = keyof ProviderApi
export type ProviderRequestParams<T extends ProviderMethod> =
  ProviderApi[T] extends { input?: infer I }
    ? I extends undefined
    ? ({} | undefined) : I
    : never
export type ProviderResponse<T extends ProviderMethod> = ProviderApi[T] extends { output?: infer O } ? O : never
