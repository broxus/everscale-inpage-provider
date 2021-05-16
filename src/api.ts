import { Permission, Permissions } from './permissions';
import {
  ContractState,
  ContractUpdatesSubscription,
  FullContractState,
  FunctionCall,
  TokensObject,
  Transaction, TransactionsBatchInfo
} from './models';
import { UniqueArray } from './utils';

export interface ProviderState {
  /**
   * Selected connection name (Mainnet / Testnet)
   */
  selectedConnection: string
  /**
   * Object with active permissions attached data
   */
  permissions: Partial<Permissions>
  /**
   * Current subscription states
   */
  subscriptions: {
    [address: string]: ContractUpdatesSubscription
  },
}

export type ProviderEvents = {
  /**
   * Called when inpage provider disconnects from extension
   */
  disconnected: Error,

  /**
   * Called on each new transaction, received on subscription
   */
  transactionsFound: {
    /**
     * Contract address
     */
    address: string
    /**
     * Guaranteed to be non-empty and ordered by descending lt
     */
    transactions: Transaction[]
    /**
     * Describes transactions lt rage
     */
    info: TransactionsBatchInfo,
  }

  /**
   * Called every time contract state changes
   */
  contractStateChanged: {
    /**
     * Contract address
     */
    address: string
    /**
     * New contract state
     */
    state: ContractState
  }

  /**
   * Called each time the user changes network
   */
  networkChanged: {
    selectedConnection: string
  }

  /**
   * Called when permissions are changed.
   * Mostly when account has been removed from the current `accountInteraction` permission,
   * or disconnect method was called
   */
  permissionsChanged: {
    permissions: Partial<Permissions>
  }

  /**
   * Called when the user logs out of the extension
   */
  loggedOut: {}
}

export type ProviderApi = {
  /**
   * Requests new permissions for current origin.
   * Shows an approval window to the user.
   * Will overwrite already existing permissions
   *
   * ---
   * Required permissions: none
   */
  requestPermissions: {
    input: {
      permissions: UniqueArray<Permission>[]
    }
    output: Partial<Permissions>
  }

  /**
   * Removes all permissions for current origin and stops all subscriptions
   *
   * ---
   * Required permissions: none
   */
  disconnect: {}

  /**
   * Subscribes to contract updates.
   * Can also be used to update subscriptions
   *
   * ---
   * Required permissions: `tonClient`
   */
  subscribe: {
    input: {
      /**
       * Contract address
       */
      address: string,
      /**
       * Subscription changes
       */
      subscriptions: Partial<ContractUpdatesSubscription>
    }
    output: ContractUpdatesSubscription
  }

  /**
   * Fully unsubscribe from specific contract updates
   *
   * ---
   * Required permissions: none
   */
  unsubscribe: {
    input: {
      /**
       * Contract address
       */
      address: string
    }
  }

  /**
   * Fully unsubscribe from all contracts
   *
   * ---
   * Required permissions: none
   */
  unsubscribeAll: {}

  /**
   * Returns provider api state
   *
   * ---
   * Required permissions: none
   */
  getProviderState: {
    output: {
      /**
       * Provider api version
       */
      version: string
      /**
       * Selected connection name (Mainnet / Testnet)
       */
      selectedConnection: string
      /**
       * Object with active permissions attached data
       */
      permissions: Partial<Permissions>
      /**
       * Current subscription states
       */
      subscriptions: {
        [address: string]: ContractUpdatesSubscription
      },
    }
  }

  /**
   * Requests contract data
   *
   * ---
   * Required permissions: `tonClient`
   */
  getFullContractState: {
    input: {
      /**
       * Contract address
       */
      address: string
    }
    output: {
      /**
       * Contract state or `undefined` if it doesn't exist
       */
      state?: FullContractState
    }
  }

  /**
   * Requests contract transactions
   *
   * ---
   * Required permissions: `tonClient`
   */
  getTransactions: {
    input: {
      /**
       * Contract address
       */
      address: string
      /**
       * Optional upper limit of logical time.
       * If not specified, transactions will be requested starting with the latest one
       */
      beforeLt?: string
      /**
       * Whether to include transaction with logical time == `beforeLt`.
       * `false` by default
       */
      inclusive?: boolean
      /**
       * Optional limit. Values greater than 50 have no effect
       */
      limit?: number
    }
    output: {
      /**
       * Transactions list in descending order (from latest lt to the oldest)
       */
      transactions: Transaction[]
      /**
       * Logical time of the oldest transaction. Can be used to continue transactions batch
       */
      oldestLt?: string
      /**
       * Whether there are still some transactions left
       */
      idEnd: boolean
    }
  }

  /**
   * Executes external message locally
   *
   * ---
   * Required permissions: `tonClient`
   */
  runLocal: {
    input: {
      /**
       * Contract address
       */
      address: string
      /**
       * Cached contract state
       */
      cachedState?: FullContractState
      /**
       * Function call params
       */
      functionCall: FunctionCall
    }
    output: {
      /**
       * Execution output
       */
      output?: TokensObject
      /**
       * TVM execution code
       */
      code: number
    }
  }

  /**
   * Calculates contract address from code and init params
   *
   * ---
   * Required permissions: `tonClient`
   */
  getExpectedAddress: {
    input: {
      /**
       * Base64 encoded TVC file
       */
      tvc: string
      /**
       * Contract ABI
       */
      abi: string
      /**
       * Contract workchain. 0 by default
       */
      workchain?: number
      /**
       * Public key, which will be injected into the contract. 0 by default
       */
      publicKey?: string
      /**
       * State init params
       */
      initParams: TokensObject
    }
    output: {
      /**
       * Contract address
       */
      address: string
    }
  }

  /**
   * Creates internal message body
   *
   * ---
   * Required permissions: `tonClient`
   */
  encodeInternalInput: {
    input: FunctionCall
    output: {
      /**
       * Base64 encoded message body BOC
       */
      boc: string
    }
  }

  /**
   * Decodes body of incoming message
   *
   * ---
   * Required permissions: `tonClient`
   */
  decodeInput: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string
      /**
       * Contract ABI
       */
      abi: string
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful
       *
       * > Note! If **`method`** param was provided as string, it will assume that message body contains
       * > specified function and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if message body doesn't contain requested method.
       */
      method: string | string[]
      /**
       * Function call type
       */
      internal: boolean
    }
    output: {
      /**
       * Decoded method name
       */
      method: string
      /**
       * Decoded function arguments
       */
      input: TokensObject
    } | null
  }

  /**
   * Decodes body of outgoing message
   *
   * ---
   * Required permissions: `tonClient`
   */
  decodeOutput: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string
      /**
       * Contract ABI
       */
      abi: string
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful
       *
       * > Note! If **`method`** param was provided as string, it will assume that message body contains
       * > specified function and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if message body doesn't contain requested method.
       */
      method: string | string[]
    }
    output: {
      /**
       * Decoded method name
       */
      method: string
      /**
       * Decoded function returned value
       */
      output: TokensObject
    } | null
  }

  /**
   * Decodes body of event message
   *
   * ---
   * Required permissions: `tonClient`
   */
  decodeEvent: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string
      /**
       * Contract ABI
       */
      abi: string
      /**
       * Specific event from specified contract ABI.
       * When an array of event names is passed it will try to decode until first successful
       *
       * > Note! If **`event`** param was provided as string, it will assume that message body contains
       * > specified event and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified event, use **`['event']`**, in that case it will return null
       * > if message body doesn't contain requested event.
       */
      event: string | string[]
    }
    output: {
      /**
       * Decoded event name
       */
      event: string
      /**
       * Decoded event data
       */
      data: TokensObject
    } | null
  }

  /**
   * Decodes function call
   *
   * ---
   * Required permissions: `tonClient`
   */
  decodeTransaction: {
    input: {
      /**
       * Transaction with the function call
       */
      transaction: Transaction
      /**
       * Contract ABI
       */
      abi: string
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful.
       *
       * > Note! If **`method`** param was provided as string, it will assume that transaction contains
       * > specified call and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if transaction doesn't contain requested method.
       */
      method: string | string[]
    }
    output: {
      /**
       * Decoded method name
       */
      method: string
      /**
       * Decoded function arguments
       */
      input: TokensObject
      /**
       * Decoded function returned value
       */
      output: TokensObject
    } | null
  }

  /**
   * Decodes transaction events
   *
   * ---
   * Required permissions: `tonClient`
   */
  decodeTransactionEvents: {
    input: {
      /**
       * Transaction with the function call
       */
      transaction: Transaction
      /**
       * Contract ABI
       */
      abi: string
    }
    output: {
      /**
       * Successfully decoded events
       */
      events: {
        event: string,
        data: TokensObject
      }[]
    }
  }

  /**
   * Calculates transaction fees
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  estimateFees: {
    input: {
      /**
       * This wallet will be used to send the message.
       * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
       */
      sender: string,
      /**
       * Message destination address
       */
      recipient: string
      /**
       * Amount of nano TON to send
       */
      amount: string
      /**
       * Optional function call
       */
      payload?: FunctionCall
    }
    output: {
      /**
       * Fees in nano TON
       */
      fees: string
    }
  }

  /**
   * Sends internal message from user account.
   * Shows an approval window to the user.
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  sendMessage: {
    input: {
      /**
       * Preferred wallet address.
       * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
       */
      sender: string,
      /**
       * Message destination address
       */
      recipient: string
      /**
       * Amount of nano TON to send
       */
      amount: string
      /**
       * Whether to bounce message back on error
       */
      bounce: boolean
      /**
       * Optional function call
       */
      payload?: FunctionCall
    }
    output: {
      /**
       * Executed transaction
       */
      transaction: Transaction
    }
  }

  /**
   * Sends an external message to the contract
   * Shows and approval window to the user
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  sendExternalMessage: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string
      /**
       * Message destination address
       */
      recipient: string
      /**
       * Optional base64 encoded `.tvc` file
       */
      stateInit?: string
      /**
       * Function call
       */
      payload: FunctionCall
    }
    output: {
      /**
       * Executed transaction
       */
      transaction: Transaction
      /**
       * Parsed function call output
       */
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
