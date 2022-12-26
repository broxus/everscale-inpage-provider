import {
  AbiVersion,
  AbiParam,
  AssetType,
  AssetTypeParams,
  ContractState,
  ContractUpdatesSubscription,
  EncryptedData,
  EncryptionAlgorithm,
  FullContractState,
  Transaction,
  TransactionId,
  TransactionsBatchInfo,
  Permissions,
  Permission,
  FunctionCall,
  TokensObject,
  DelayedMessage,
} from './models';

import { UniqueArray, Address } from './utils';

/**
 * @category Provider Api
 */
export type ProviderEvents<Addr = Address> = {
  /**
   * Called when inpage provider connects to the extension
   */
  connected: Record<string, never>;

  /**
   * Called when inpage provider disconnects from extension
   */
  disconnected: Error;

  /**
   * Called on each new transactions batch, received on subscription
   */
  transactionsFound: {
    /**
     * Contract address
     */
    address: Addr;
    /**
     * Guaranteed to be non-empty and ordered by descending lt
     */
    transactions: Transaction<Addr>[];
    /**
     * Describes transactions lt rage
     */
    info: TransactionsBatchInfo;
  };

  /**
   * Called every time contract state changes
   */
  contractStateChanged: {
    /**
     * Contract address
     */
    address: Addr;
    /**
     * New contract state
     */
    state: ContractState;
  };

  /**
   * Called every time a delayed message was delivered or expired
   */
  messageStatusUpdated: {
    /**
     * Account address
     */
    address: Addr;
    /**
     * Message hash
     */
    hash: string;
    /**
     * If not null, the transaction of the delivered message. Otherwise, the message has expired.
     */
    transaction?: Transaction<Addr>;
  };

  /**
   * Called each time the user changes network
   */
  networkChanged: {
    /**
     * Network group name
     *
     * @deprecated `networkId` should be used instead
     */
    selectedConnection: string;
    /**
     * Numeric network id
     */
    networkId: number;
  };

  /**
   * Called when permissions are changed.
   * Mostly when account has been removed from the current `accountInteraction` permission,
   * or disconnect method was called
   */
  permissionsChanged: {
    permissions: Partial<Permissions<Addr>>;
  };

  /**
   * Called when the user logs out of the extension
   */
  loggedOut: Record<string, never>;
};

/**
 * @category Provider Api
 */
export type ProviderApi<Addr = Address> = {
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
      permissions: UniqueArray<Permission[]>;
    };
    output: Partial<Permissions<Addr>>;
  };

  /**
   * Updates `accountInteraction` permission value
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  changeAccount: {
    output: Partial<Permissions<Addr>>;
  };

  /**
   * Removes all permissions for current origin and stops all subscriptions
   *
   * ---
   * Required permissions: none
   */
  disconnect: Record<string, never>;

  /**
   * Subscribes to contract updates.
   * Can also be used to update subscriptions
   *
   * ---
   * Required permissions: `basic`
   */
  subscribe: {
    input: {
      /**
       * Contract address
       */
      address: Addr;
      /**
       * Subscription changes
       */
      subscriptions: Partial<ContractUpdatesSubscription>;
    };
    output: ContractUpdatesSubscription;
  };

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
      address: Addr;
    };
  };

  /**
   * Fully unsubscribe from all contracts
   *
   * ---
   * Required permissions: none
   */
  unsubscribeAll: Record<string, never>;

  /**
   * Returns provider api state
   *
   * ---
   * Required permissions: none
   */
  getProviderState: {
    output: {
      /**
       * Provider api version in semver format (x.y.z)
       */
      version: string;
      /**
       * Provider api version in uint32 format (xxxyyyzzz)
       */
      numericVersion: number;
      /**
       * Selected connection group name (`mainnet` / `testnet` / etc.)
       *
       * @deprecated `networkId` should be used instead
       */
      selectedConnection: string;
      /**
       * Numeric network id
       */
      networkId: number;
      /**
       * List of supported permissions
       */
      supportedPermissions: UniqueArray<Permission[]>;
      /**
       * Object with active permissions attached data
       */
      permissions: Partial<Permissions<Addr>>;
      /**
       * Current subscription states
       */
      subscriptions: {
        [address: string]: ContractUpdatesSubscription;
      };
    };
  };

  /**
   * Requests contract data
   *
   * ---
   * Required permissions: `basic`
   */
  getFullContractState: {
    input: {
      /**
       * Contract address
       */
      address: Addr;
    };
    output: {
      /**
       * Contract state or `undefined` if it doesn't exist
       */
      state: FullContractState | undefined;
    };
  };

  /**
   * Requests accounts with specified code hash
   *
   * ---
   * Required permissions: `basic`
   */
  getAccountsByCodeHash: {
    input: {
      /**
       * Hex encoded code hash
       */
      codeHash: string;
      /**
       * Last address from previous batch
       */
      continuation?: string;
      /**
       * Optional limit. Values grater than 50 have no effect
       */
      limit?: number;
    };
    output: {
      /**
       * List of account addresses
       */
      accounts: Addr[];
      /**
       * Last address from this batch. Should be used as a `continuation` for further requests
       */
      continuation: string | undefined;
    };
  };

  /**
   * Requests contract transactions
   *
   * ---
   * Required permissions: `basic`
   */
  getTransactions: {
    input: {
      /**
       * Contract address
       */
      address: Addr;
      /**
       * Id of the transaction from which to request the next batch
       */
      continuation?: TransactionId;
      /**
       * Optional limit. Values greater than 50 have no effect
       */
      limit?: number;
    };
    output: {
      /**
       * Transactions list in descending order (from latest lt to the oldest)
       */
      transactions: Transaction<Addr>[];
      /**
       * Previous transaction id of the last transaction in result. Can be used to continue transactions batch
       */
      continuation: TransactionId | undefined;
      /**
       * Describes transactions lt rage (none if empty `transactions` array)
       */
      info?: TransactionsBatchInfo;
    };
  };

  /**
   * Fetches transaction by the exact hash
   *
   * ---
   * Required permissions: `basic`
   */
  getTransaction: {
    input: {
      /**
       * Hex encoded transaction hash
       */
      hash: string;
    };
    output: {
      /**
       * Transaction
       */
      transaction: Transaction<Addr> | undefined;
    };
  };

  /**
   * Searches transaction by filters
   *
   * NOTE: at least one filter must be specified
   *
   * ---
   * Required permissions: `basic`
   */
  findTransaction: {
    input: {
      /**
       * Hex encoded incoming message hash
       */
      inMessageHash?: string;

      /* TODO: add more filters */
    };
    output: {
      /**
       * Transaction
       */
      transaction: Transaction<Addr> | undefined;
    };
  };

  /**
   * Executes external message locally
   *
   * ---
   * Required permissions: `basic`
   */
  runLocal: {
    input: {
      /**
       * Contract address
       */
      address: Addr;
      /**
       * Cached contract state
       */
      cachedState?: FullContractState;
      /**
       * Whether to run the method locally as responsible.
       *
       * This will use internal message with unlimited account balance.
       */
      responsible?: boolean;
      /**
       * Function call params
       */
      functionCall: FunctionCall<Addr>;
    };
    output: {
      /**
       * Execution output
       */
      output: TokensObject<Addr> | undefined;
      /**
       * TVM execution code
       */
      code: number;
    };
  };

  /**
   * Calculates contract address from code and init params
   *
   * ---
   * Required permissions: `basic`
   */
  getExpectedAddress: {
    input: {
      /**
       * Base64 encoded TVC file
       */
      tvc: string;
      /**
       * Contract ABI
       */
      abi: string;
      /**
       * Contract workchain. 0 by default
       */
      workchain?: number;
      /**
       * Public key, which will be injected into the contract. 0 by default
       */
      publicKey?: string;
      /**
       * State init params
       */
      initParams: TokensObject<Addr>;
    };
    output: {
      /**
       * Contract address
       */
      address: Addr;
      /**
       * Base64 encoded state init
       */
      stateInit: string;
    };
  };

  /**
   * Computes hash of base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  getBocHash: {
    input: {
      /**
       * Base64 encoded cell BOC
       */
      boc: string;
    };
    output: {
      /**
       * Hex encoded cell hash
       */
      hash: string;
    };
  };

  /**
   * Creates base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  packIntoCell: {
    input: {
      /**
       * ABI version. 2.2 if not specified otherwise
       */
      abiVersion?: AbiVersion;
      /**
       * Cell structure
       */
      structure: AbiParam[];
      /**
       * Cell data
       */
      data: TokensObject<Addr>;
    };
    output: {
      /**
       * Base64 encoded cell BOC
       */
      boc: string;
    };
  };

  /**
   * Decodes base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  unpackFromCell: {
    input: {
      /**
       * ABI version. 2.2 if not specified otherwise
       */
      abiVersion?: AbiVersion;
      /**
       * Cell structure
       */
      structure: AbiParam[];
      /**
       * Base64 encoded cell BOC
       */
      boc: string;
      /**
       * Don't fail if something is left in a cell after unpacking
       */
      allowPartial: boolean;
    };
    output: {
      /**
       * Cell data
       */
      data: TokensObject<Addr>;
    };
  };

  /**
   * Extracts public key from raw account state
   *
   * **NOTE:** can only be used on contracts which are deployed and has `pubkey` header
   *
   * ---
   * Required permissions: `basic`
   */
  extractPublicKey: {
    input: {
      /**
       * Base64 encoded account state
       *
       * @see FullContractState
       */
      boc: string;
    };
    output: {
      /**
       * Hex encoded public key
       */
      publicKey: string;
    };
  };

  /**
   * Converts base64 encoded contract code into tvc with default init data
   *
   * ---
   * Required permissions: `basic`
   */
  codeToTvc: {
    input: {
      /**
       * Base64 encoded contract code
       */
      code: string;
    };
    output: {
      /**
       * Base64 encoded state init
       */
      tvc: string;
    };
  };

  /**
   * Merges base64 encoded contract code and state into a tvc
   *
   * ---
   * Required permissions: `basic`
   */
  mergeTvc: {
    input: {
      /**
       * Base64 encoded contract code
       */
      code: string;
      /**
       * Base64 encoded contract data
       */
      data: string;
    };
    output: {
      /**
       * Base64 encoded state init
       */
      tvc: string;
    };
  };

  /**
   * Splits base64 encoded state init into code and data
   *
   * ---
   * Required permissions: `basic`
   */
  splitTvc: {
    input: {
      /**
       * Base64 encoded state init
       */
      tvc: string;
    };
    output: {
      /**
       * Base64 encoded init data
       */
      data: string | undefined;
      /**
       * Base64 encoded contract code
       */
      code: string | undefined;
    };
  };

  /**
   * Inserts salt into code
   *
   * ---
   * Required permissions: `basic`
   */
  setCodeSalt: {
    input: {
      /**
       * Base64 encoded contract code
       */
      code: string;
      /**
       * Base64 encoded salt (as BOC)
       */
      salt: string;
    };
    output: {
      /**
       * Base64 encoded contract code with salt
       */
      code: string;
    };
  };

  /**
   * Retrieves salt from code. Returns undefined if code doesn't contain salt
   *
   * ---
   * Required permissions: `basic`
   */
  getCodeSalt: {
    input: {
      /**
       * Base64 encoded contract code
       */
      code: string;
    };
    output: {
      /**
       * Base64 encoded salt (as BOC)
       */
      salt: string | undefined;
    };
  };

  /**
   * Creates internal message body
   *
   * ---
   * Required permissions: `basic`
   */
  encodeInternalInput: {
    input: FunctionCall<Addr>;
    output: {
      /**
       * Base64 encoded message body BOC
       */
      boc: string;
    };
  };

  /**
   * Decodes body of incoming message
   *
   * ---
   * Required permissions: `basic`
   */
  decodeInput: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string;
      /**
       * Contract ABI
       */
      abi: string;
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful
       *
       * > Note! If **`method`** param was provided as string, it will assume that message body contains
       * > specified function and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if message body doesn't contain requested method.
       */
      method: string | string[];
      /**
       * Function call type
       */
      internal: boolean;
    };
    output: {
      /**
       * Decoded method name
       */
      method: string;
      /**
       * Decoded function arguments
       */
      input: TokensObject<Addr>;
    } | null;
  };

  /**
   * Decodes body of outgoing message
   *
   * ---
   * Required permissions: `basic`
   */
  decodeOutput: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string;
      /**
       * Contract ABI
       */
      abi: string;
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful
       *
       * > Note! If **`method`** param was provided as string, it will assume that message body contains
       * > specified function and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if message body doesn't contain requested method.
       */
      method: string | string[];
    };
    output: {
      /**
       * Decoded method name
       */
      method: string;
      /**
       * Decoded function returned value
       */
      output: TokensObject<Addr>;
    } | null;
  };

  /**
   * Decodes body of event message
   *
   * ---
   * Required permissions: `basic`
   */
  decodeEvent: {
    input: {
      /**
       * Base64 encoded message body BOC
       */
      body: string;
      /**
       * Contract ABI
       */
      abi: string;
      /**
       * Specific event from specified contract ABI.
       * When an array of event names is passed it will try to decode until first successful
       *
       * > Note! If **`event`** param was provided as string, it will assume that message body contains
       * > specified event and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified event, use **`['event']`**, in that case it will return null
       * > if message body doesn't contain requested event.
       */
      event: string | string[];
    };
    output: {
      /**
       * Decoded event name
       */
      event: string;
      /**
       * Decoded event data
       */
      data: TokensObject<Addr>;
    } | null;
  };

  /**
   * Decodes function call
   *
   * ---
   * Required permissions: `basic`
   */
  decodeTransaction: {
    input: {
      /**
       * Transaction with the function call
       */
      transaction: Transaction<Addr>;
      /**
       * Contract ABI
       */
      abi: string;
      /**
       * Specific method from specified contract ABI.
       * When an array of method names is passed it will try to decode until first successful.
       *
       * > Note! If **`method`** param was provided as string, it will assume that transaction contains
       * > specified call and this method will either return output or throw an exception. If you just want
       * > to **_try_** to decode specified method, use **`['method']`**, in that case it will return null
       * > if transaction doesn't contain requested method.
       */
      method: string | string[];
    };
    output: {
      /**
       * Decoded method name
       */
      method: string;
      /**
       * Decoded function arguments
       */
      input: TokensObject<Addr>;
      /**
       * Decoded function returned value
       */
      output: TokensObject<Addr>;
    } | null;
  };

  /**
   * Decodes transaction events
   *
   * ---
   * Required permissions: `basic`
   */
  decodeTransactionEvents: {
    input: {
      /**
       * Transaction with the function call
       */
      transaction: Transaction<Addr>;
      /**
       * Contract ABI
       */
      abi: string;
    };
    output: {
      /**
       * Successfully decoded events
       */
      events: {
        event: string;
        data: TokensObject<Addr>;
      }[];
    };
  };

  /**
   * Checks if a specific data hash was signed with the specified key
   *
   * ---
   * Requires permissions: `basic`
   */
  verifySignature: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string;
      /**
       * Base64 or hex encoded arbitrary bytes hash (data must be 32 bytes long)
       */
      dataHash: string;
      /**
       * Base64 or hex encoded signature bytes (data must be 64 bytes long)
       */
      signature: string;
    };
    output: {
      /**
       * Returns true if message was signed with this key
       */
      isValid: boolean;
    };
  };

  /**
   * Sends an unsigned external message to the contract
   *
   * ---
   * Required permissions: `basic`
   */
  sendUnsignedExternalMessage: {
    input: {
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Optional base64 encoded `.tvc` file
       */
      stateInit?: string;
      /**
       * Function call
       */
      payload?: string | FunctionCall<Addr>;
      /**
       * Whether to only run it locally (false by default)
       * Can be used as alternative `runLocal` method
       */
      local?: boolean;
      /**
       * Optional executor parameters used during local contract execution
       */
      executorParams?: {
        /**
         * If `true`, signature verification always succeds
         */
        disableSignatureCheck?: boolean;
        /**
         * Explicit account balance in nano EVER
         */
        overrideBalance?: string | number;
      };
    };
    output: {
      /**
       * Executed transaction
       */
      transaction: Transaction<Addr>;
      /**
       * Parsed function call output
       */
      output: TokensObject<Addr> | undefined;
    };
  };

  /**
   * Adds asset to the selected account
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  addAsset: {
    input: {
      /**
       * Owner's wallet address.
       * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
       */
      account: Addr;
      /**
       * Which asset to add
       */
      type: AssetType;
      /**
       * Asset parameters
       */
      params: AssetTypeParams<AssetType, Addr>;
    };
    output: {
      /**
       * Returns true if the account did not have this asset before
       */
      newAsset: boolean;
    };
  };

  /**
   * Signs arbitrary data.
   *
   * NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  signData: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string;
      /**
       * Base64 encoded arbitrary bytes
       */
      data: string;
    };
    output: {
      /**
       * Hex encoded data hash
       */
      dataHash: string;
      /**
       * Base64 encoded signature bytes (data is guaranteed to be 64 bytes long)
       */
      signature: string;
      /**
       * Hex encoded signature bytes (data is guaranteed to be 64 bytes long)
       */
      signatureHex: string;
      /**
       * Same signature, but split into two uint256 parts
       */
      signatureParts: {
        /**
         * High 32 bytes of the signature as uint256
         */
        high: string;
        /**
         * Low 32 bytes of the signature as uint256
         */
        low: string;
      };
    };
  };

  /**
   * Signs arbitrary data without hashing it
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  signDataRaw: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string;
      /**
       * Base64 encoded arbitrary bytes
       */
      data: string;
    };
    output: {
      /**
       * Base64 encoded signature bytes (data is guaranteed to be 64 bytes long)
       */
      signature: string;
      /**
       * Hex encoded signature bytes (data is guaranteed to be 64 bytes long)
       */
      signatureHex: string;
      /**
       * Same signature, but split into two uint256 parts
       */
      signatureParts: {
        /**
         * High 32 bytes of the signature as uint256
         */
        high: string;
        /**
         * Low 32 bytes of the signature as uint256
         */
        low: string;
      };
    };
  };

  /**
   * Encrypts arbitrary data with specified algorithm for each specified recipient
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  encryptData: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string;
      /**
       * Public keys of recipients. Hex encoded
       */
      recipientPublicKeys: string[];
      /**
       * Encryption algorithm. Nonce will be generated for each recipient
       */
      algorithm: EncryptionAlgorithm;
      /**
       * Base64 encoded data
       */
      data: string;
    };
    output: {
      /**
       * Encrypted data for each recipient public key
       */
      encryptedData: EncryptedData[];
    };
  };

  /**
   * Decrypts encrypted data
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  decryptData: {
    input: {
      /**
       * Encrypted data. The recipient's public key must match the public key of the current account.
       */
      encryptedData: EncryptedData;
    };
    output: {
      /**
       * Base64 encoded decrypted data
       */
      data: string;
    };
  };

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
      sender: Addr;
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Amount of nano EVER to send
       */
      amount: string;
      /**
       * Optional function call
       */
      payload?: FunctionCall<Addr>;
      /**
       * Optional base64 encoded TVC
       *
       * NOTE: If the selected contract do not support this, an error is returned
       */
      stateInit?: string;
    };
    output: {
      /**
       * Fees in nano EVER
       */
      fees: string;
    };
  };

  /**
   * Sends an internal message from the user account.
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
      sender: Addr;
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Amount of nano EVER to send
       */
      amount: string;
      /**
       * Whether to bounce message back on error
       */
      bounce: boolean;
      /**
       * Optional function call
       */
      payload?: FunctionCall<Addr>;
      /**
       * Optional base64 encoded TVC
       *
       * NOTE: If the selected contract do not support this, an error is returned
       */
      stateInit?: string;
    };
    output: {
      /**
       * Executed transaction
       */
      transaction: Transaction<Addr>;
    };
  };

  /**
   * Sends an internal message from the user account without waiting for the transaction.
   * Shows an approval window to the user.
   *
   * @see messageStatusUpdated
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  sendMessageDelayed: {
    input: {
      /**
       * Preferred wallet address.
       * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
       */
      sender: Addr;
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Amount of nano EVER to send
       */
      amount: string;
      /**
       * Whether to bounce message back on error
       */
      bounce: boolean;
      /**
       * Optional function call
       */
      payload?: FunctionCall<Addr>;
      /**
       * Optional base64 encoded TVC
       *
       * NOTE: If the selected contract do not support this, an error is returned
       */
      stateInit?: string;
    };
    output: {
      /**
       * External message info
       */
      message: DelayedMessage<Addr>;
    };
  };

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
      publicKey: string;
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Optional base64 encoded `.tvc` file
       */
      stateInit?: string;
      /**
       * Function call
       */
      payload: FunctionCall<Addr>;
      /**
       * Whether to only run it locally (false by default)
       * Can be used as alternative `runLocal` method but with user signature
       */
      local?: boolean;
      /**
       * Optional executor parameters used during local contract execution
       */
      executorParams?: {
        /**
         * If `true`, signature verification always succeds
         */
        disableSignatureCheck?: boolean;
        /**
         * Explicit account balance in nano EVER
         */
        overrideBalance?: string | number;
      };
    };
    output: {
      /**
       * Executed transaction
       */
      transaction: Transaction<Addr>;
      /**
       * Parsed function call output
       */
      output: TokensObject<Addr> | undefined;
    };
  };

  /**
   * Sends an external message to the contract without waiting for the transaction.
   * Shows and approval window to the user
   *
   * @see messageStatusUpdated
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  sendExternalMessageDelayed: {
    input: {
      /**
       * The public key of the preferred account.
       * It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided
       */
      publicKey: string;
      /**
       * Message destination address
       */
      recipient: Addr;
      /**
       * Optional base64 encoded `.tvc` file
       */
      stateInit?: string;
      /**
       * Function call
       */
      payload: FunctionCall<Addr>;
    };
    output: {
      /**
       * External message info
       */
      message: DelayedMessage<Addr>;
    };
  };
};

/**
 * @category Provider Api
 */
export type ProviderEvent = keyof ProviderEvents;

/**
 * @category Provider Api
 */
export type ProviderEventData<T extends ProviderEvent, Addr = Address> = ProviderEvents<Addr>[T];

/**
 * @category Provider Api
 */
export type RawProviderEventData<T extends ProviderEvent> = ProviderEventData<T, string>;

/**
 * @category Provider Api
 */
export type ProviderMethod = keyof ProviderApi;

/**
 * @category Provider Api
 */
export type ProviderApiRequestParams<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  input: infer I;
}
  ? I
  : undefined;

/**
 * @category Provider Api
 */
export type RawProviderApiRequestParams<T extends ProviderMethod> = ProviderApiRequestParams<T, string>;

/**
 * @category Provider Api
 */
export type ProviderApiResponse<T extends ProviderMethod, Addr = Address> = ProviderApi<Addr>[T] extends {
  output: infer O;
}
  ? O
  : undefined;

/**
 * @category Provider Api
 */
export type RawProviderApiResponse<T extends ProviderMethod> = ProviderApiResponse<T, string>;

/**
 * @category Provider Api
 */
export interface RawProviderRequest<T extends ProviderMethod> {
  method: T;
  params: RawProviderApiRequestParams<T>;
}
