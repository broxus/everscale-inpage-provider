import { Permission, Permissions } from './permissions';
import {
  ContractState,
  ContractUpdatesSubscription,
  FullContractState,
  FunctionCall,
  TokensObject,
  Transaction
} from './models';
import { UniqueArray } from './utils';

export interface ProviderState {
  // Selected connection name (Mainnet / Testnet)
  selectedConnection: string
  // Object with active permissions attached data
  permissions: Partial<Permissions>
  // Current subscription states
  subscriptions: {
    [address: string]: ContractUpdatesSubscription
  },
}

export type ProviderEvents = {
  // Called when inpage provider disconnects from extension
  disconnected: Error,

  // Called on each new transaction, received on subscription
  transactionFound: {
    transaction: Transaction
  }

  // Called every time contract state changes
  contractStateChanged: {
    // Contract address
    address: string
    // New contract state
    state: ContractState
  }

  // Called each time the user changes network
  networkChanged: {
    selectedConnection: string
  }

  // Called when permissions are changed.
  // Mostly when account has been removed from the current `accountInteraction` permission,
  // or disconnect method was called
  permissionsChanged: {
    permissions: Permissions
  }

  // Called when the user logs out of the extension
  loggedOut: {}
}

export type ProviderApi = {
  // Requests new permissions for current origin.
  // Shows an approval window to the user.
  // Will overwrite already existing permissions
  requestPermissions: {
    input: {
      permissions: UniqueArray<Permission>[]
    }
    output: Partial<Permissions>
  }

  // Removes all permissions for current origin and stops all subscriptions
  disconnect: {}

  // Subscribes to contract updates.
  // Can also be used to update subscriptions
  subscribe: {
    input: {
      // Contract address
      address: string,
      // Subscription changes
      subscriptions: Partial<ContractUpdatesSubscription>
    }
    output: ContractUpdatesSubscription
  }

  // Fully unsubscribe from specific contract updates
  unsubscribe: {
    input: {
      // Contract address
      address: string
    }
  }

  // Fully unsubscribe from all contracts
  unsubscribeAll: {}

  // Returns provider api state
  getProviderState: {
    output: {
      // Selected connection name (Mainnet / Testnet)
      selectedConnection: string
      // Object with active permissions attached data
      permissions: Partial<Permissions>
      // Current subscription states
      subscriptions: {
        [address: string]: ContractUpdatesSubscription
      },
    }
  }

  // Requests contract data
  getFullContractState: {
    input: {
      // Contract address
      address: string
    }
    output: {
      // Contract state or `undefined` if it doesn't not exist
      state?: FullContractState
    }
  }

  // Requests contract transactions
  getTransactions: {
    input: {
      // Contract address
      address: string
      // Optional upper limit of logical time.
      // If not specified, transactions will be requested starting with the latest one
      beforeLt?: string
      // Whether to include transaction with logical time == `beforeLt`.
      // `false` by default
      inclusive?: boolean
      // Optional limit. Values greater than 50 have no effect
      limit?: number
    }
    output: {
      // Transactions list in descending order (from latest lt to the oldest)
      transactions: Transaction[]
      // Logical time of the oldest transaction. Can be used to continue transactions batch
      oldestLt?: string
    }
  }

  // Executes external message locally
  runLocal: {
    input: {
      // Contract address
      address: string
      // Cached contract state
      cachedState?: FullContractState
      // Function call params
      functionCall: FunctionCall
    }
    output: {
      // Execution output
      output?: TokensObject
      // TVM execution code
      code: number
    }
  }

  // Calculates contract address from code and init params
  getExpectedAddress: {
    input: {
      // Base64 encoded TVC file
      tvc: string
      // Contract ABI
      abi: string
      // Contract workchain. 0 by default
      workchain?: number
      // Public key, which will be injected into the contract. 0 by default
      publicKey?: string
      // State init params
      initParams: TokensObject
    }
    output: {
      // Contract address
      address: string
    }
  }

  // Creates internal message body
  encodeInternalInput: {
    input: FunctionCall
    output: {
      // Base64 encoded message body BOC
      boc: string
    }
  }

  // Decodes body of incoming message
  decodeInput: {
    input: {
      // Base64 encoded message body BOC
      body: string
      // Contract ABI
      abi: string
      // Specific method from specified contract ABI
      method: string
      // Function call type
      internal: boolean
    }
    output: {
      // Decoded function arguments
      output: TokensObject
    }
  }

  // Decodes body of outgoing message
  decodeOutput: {
    input: {
      // Base64 encoded message body BOC
      body: string
      // Contract ABI
      abi: string
      // Specific method from specified contract ABI
      method: string
    }
    output: {
      // Decoded function returned value
      output: TokensObject
    }
  }

  // Decodes function call
  decodeTransaction: {
    input: {
      // Transaction with the function call
      transaction: Transaction
      // Contract ABI
      abi: string
      // Specific method from specified contract ABI
      method: string
    }
    output: {
      input: TokensObject
      output: TokensObject
    }
  }

  // Calculates transaction fees
  estimateFees: {
    input: {
      // Preferred wallet address.
      // This wallet will be used to send the message if specified
      preferredSender?: string,
      // Message destination address
      address: string
      // Amount of nano TON to send
      amount: string
      // Optional function call
      payload?: FunctionCall
    }
    output: {
      // Fees in nano TON
      fees: string
    }
  }

  // Sends internal message from user account.
  // Shows an approval window to the user.
  sendMessage: {
    input: {
      // Preferred wallet address.
      // This wallet will be used to send the message if specified
      preferredSender?: string,
      // Message destination address
      address: string
      // Amount of nano TON to send
      amount: string
      // Whether to bounce message back on error
      bounce: boolean
      // Optional function call
      payload?: FunctionCall
    }
    output: {
      // Executed transaction
      transaction: Transaction
      // Parsed function call output
      output?: TokensObject
    }
  }

  // Sends an external message to the contract
  // Shows and approval window to the user
  sendExternalMessage: {
    input: {
      // The public key of the preferred account.
      // This key will be used to sign the message if specified
      preferredKey?: string
      // Message destination address
      address: string
      // Base64 encoded optional init data
      initData?: string
      // Function call
      payload: FunctionCall
    }
    output: {
      // Executed transaction
      transaction: Transaction
      // Parsed function call output
      output?: TokensObject
    }
  }
}

export type ProviderEvent = keyof ProviderEvents

export type ProviderEventData<T extends ProviderEvent> = ProviderEvents[T]

export type ProviderEventCall<T extends ProviderEvent> = { method: T; params: ProviderEventData<T> }

export type ProviderMethod = keyof ProviderApi

export type ProviderRequestParams<T extends ProviderMethod> =
  ProviderApi[T] extends { input: infer I } ? I
    : ProviderApi[T] extends {} ? undefined : never

export type ProviderResponse<T extends ProviderMethod> =
  ProviderApi[T] extends { output: infer O } ? O
    : ProviderApi[T] extends {} ? undefined : never
