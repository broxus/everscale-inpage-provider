import {
  ProviderApiRequestParams,
  ProviderApiResponse,
  ProviderEvent,
  ProviderEventData,
  ProviderMethod,
  RawProviderApiRequestParams,
  RawProviderApiResponse,
  RawProviderEventData,
  RawProviderRequest,
} from './api';

import {
  AbiVersion,
  AbiParam,
  AssetType,
  AssetTypeParams,
  ContractUpdatesSubscription,
  EncryptedData,
  DecodedAbiInitData,
  MergeInputObjectsArray,
  MergeOutputObjectsArray,
  ReadonlyAbiParam,
  parsePermissions,
  parseTokensObject,
  parsePartialTokensObject,
  parseTransaction,
  serializeTokensObject,
  Network,
} from './models';
import { Address, DelayedTransactions, getUniqueId } from './utils';
import * as subscriber from './stream';
import * as contract from './contract';

export * from './api';
export * from './models';
export * from './contract';
export { Stream, Subscriber } from './stream';
export {
  Address,
  CheckAddress,
  AddressLiteral,
  UniqueArray,
  MessageExpiredException,
  mergeTransactions,
  isAddressObject,
  LT_COLLATOR,
} from './utils';

/**
 * @category Provider
 */
export interface Provider {
  request<T extends ProviderMethod>(data: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;

  addListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;

  removeListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;

  on<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;

  once<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): this;
}

/**
 * @category Provider
 */
export type ProviderProperties = {
  /***
   * Ignore injected provider and try to use `fallback` instead.
   * @default false
   */
  forceUseFallback?: boolean;
  /***
   * Provider factory which will be called if injected provider was not found.
   * Can be used for initialization of the standalone Everscale client
   */
  fallback?: () => Promise<Provider>;
};

declare global {
  interface Window {
    __ever: Provider | undefined;
    __hasEverscaleProvider: boolean | undefined;
    ton: Provider | undefined;
    hasTonProvider: boolean | undefined;
  }
}

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

let ensurePageLoaded: Promise<void>;
if (!isBrowser || document.readyState === 'complete') {
  ensurePageLoaded = Promise.resolve();
} else {
  ensurePageLoaded = new Promise<void>(resolve => {
    window.addEventListener('load', () => {
      resolve();
    });
  });
}

const getProvider = (): Provider | undefined => (isBrowser ? window.__ever || window.ton : undefined);

/**
 * @category Provider
 */
export async function hasEverscaleProvider(): Promise<boolean> {
  if (!isBrowser) {
    return false;
  }

  await ensurePageLoaded;
  return window.__hasEverscaleProvider === true || window.hasTonProvider === true;
}

/**
 * @category Provider
 */
export class ProviderRpcClient {
  private readonly _properties: ProviderProperties;
  private readonly _api: RawProviderApiMethods;
  private readonly _initializationPromise: Promise<void>;
  private readonly _subscriptions: { [K in ProviderEvent]: Map<number, (data: ProviderEventData<K>) => void> } = {
    connected: new Map(),
    disconnected: new Map(),
    transactionsFound: new Map(),
    contractStateChanged: new Map(),
    messageStatusUpdated: new Map(),
    networkChanged: new Map(),
    permissionsChanged: new Map(),
    loggedOut: new Map(),
  };
  private readonly _contractSubscriptions: Map<string, Map<number, ContractUpdatesSubscription>> = new Map();
  private _provider?: Provider;

  public Contract: new <Abi>(abi: Abi, address: Address) => contract.Contract<Abi>;
  public Subscriber: new () => subscriber.Subscriber;

  constructor(properties: ProviderProperties = {}) {
    this._properties = properties;

    const self = this;

    // Create contract proxy type
    class ProviderContract<Abi> extends contract.Contract<Abi> {
      constructor(abi: Abi, address: Address) {
        super(self, abi, address);
      }
    }

    this.Contract = ProviderContract;

    // Create subscriber proxy type
    class ProviderSubscriber extends subscriber.Subscriber {
      constructor() {
        super(self);
      }
    }

    this.Subscriber = ProviderSubscriber;

    // Wrap provider requests
    this._api = new Proxy(
      {},
      {
        get:
          <K extends ProviderMethod>(_object: ProviderRpcClient, method: K) =>
          (params: RawProviderApiRequestParams<K>) => {
            if (this._provider != null) {
              return this._provider.request({ method, params });
            } else {
              throw new ProviderNotInitializedException();
            }
          },
      },
    ) as unknown as RawProviderApiMethods;

    if (properties.forceUseFallback === true) {
      this._initializationPromise =
        properties.fallback != null
          ? properties.fallback().then(provider => {
              this._provider = provider;
            })
          : Promise.resolve();
    } else {
      // Initialize provider with injected object by default
      this._provider = getProvider();
      if (this._provider != null) {
        // Provider as already injected
        this._initializationPromise = Promise.resolve();
      } else {
        // Wait until page is loaded and initialization complete
        this._initializationPromise = hasEverscaleProvider()
          .then(
            hasProvider =>
              new Promise<void>(resolve => {
                if (!hasProvider) {
                  // Fully loaded page doesn't even contain provider flag
                  return resolve();
                }

                // Wait injected provider initialization otherwise
                this._provider = getProvider();
                if (this._provider != null) {
                  resolve();
                } else {
                  const eventName = window.__hasEverscaleProvider === true ? 'ever#initialized' : 'ton#initialized';
                  window.addEventListener(eventName, _ => {
                    this._provider = getProvider();
                    resolve();
                  });
                }
              }),
          )
          .then(async () => {
            if (this._provider == null && properties.fallback != null) {
              this._provider = await properties.fallback();
            }
          });
      }
    }

    // Will only register handlers for successfully loaded injected provider
    this._initializationPromise.then(() => {
      if (this._provider != null) {
        this._registerEventHandlers(this._provider);
      }
    });
  }

  /**
   * Checks whether this page has injected Everscale provider or
   * there is a fallback provider.
   */
  public async hasProvider(): Promise<boolean> {
    if (this._properties.fallback != null) {
      return true;
    }
    return hasEverscaleProvider();
  }

  /**
   * Waits until provider api will be available. Calls `fallback` if no provider was found
   *
   * @throws ProviderNotFoundException when no provider found
   */
  public async ensureInitialized(): Promise<void> {
    await this._initializationPromise;
    if (this._provider == null) {
      throw new ProviderNotFoundException();
    }
  }

  /**
   * Whether provider api is ready
   */
  public get isInitialized(): boolean {
    return this._provider != null;
  }

  /**
   * Raw provider
   */
  public get raw(): Provider {
    if (this._provider != null) {
      return this._provider;
    } else {
      throw new ProviderNotInitializedException();
    }
  }

  /**
   * Raw provider api
   */
  public get rawApi(): RawProviderApiMethods {
    return this._api;
  }

  /**
   * Creates typed contract wrapper.
   *
   * @param abi Readonly object (must be declared with `as const`)
   * @param address Default contract address
   *
   * @deprecated `new ever.Contract(abi, address)` should be used instead
   */
  public createContract<Abi>(abi: Abi, address: Address): contract.Contract<Abi> {
    return new this.Contract<Abi>(abi, address);
  }

  /**
   * Creates subscriptions group
   *
   * @deprecated `new ever.Subscriber()` should be used instead
   */
  public createSubscriber(): subscriber.Subscriber {
    return new this.Subscriber();
  }

  /**
   * Requests new permissions for current origin.
   * Shows an approval window to the user.
   * Will overwrite already existing permissions
   *
   * ---
   * Required permissions: none
   */
  public async requestPermissions(
    args: ProviderApiRequestParams<'requestPermissions'>,
  ): Promise<ProviderApiResponse<'requestPermissions'>> {
    await this.ensureInitialized();
    const result = await this._api.requestPermissions({
      permissions: args.permissions,
    });
    return parsePermissions(result);
  }

  /**
   * Updates `accountInteraction` permission value
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async changeAccount(): Promise<void> {
    await this.ensureInitialized();
    await this._api.changeAccount();
  }

  /**
   * Removes all permissions for current origin and stops all subscriptions
   */
  public async disconnect(): Promise<void> {
    await this.ensureInitialized();
    await this._api.disconnect();
  }

  /**
   * Called every time contract state changes
   */
  public subscribe(
    eventName: 'contractStateChanged',
    params: { address: Address },
  ): Promise<Subscription<'contractStateChanged'>>;

  /**
   * Called on each new transactions batch, received on subscription
   */
  public subscribe(
    eventName: 'transactionsFound',
    params: { address: Address },
  ): Promise<Subscription<'transactionsFound'>>;

  /**
   * Called every time when provider connection is established
   */
  public subscribe(eventName: 'connected'): Promise<Subscription<'connected'>>;

  /**
   * Called when inpage provider disconnects from extension
   */
  public subscribe(eventName: 'disconnected'): Promise<Subscription<'disconnected'>>;

  /**
   * Called every time a delayed message was delivered or expired
   */
  public subscribe(eventName: 'messageStatusUpdated'): Promise<Subscription<'messageStatusUpdated'>>;

  /**
   * Called each time the user changes network
   */
  public subscribe(eventName: 'networkChanged'): Promise<Subscription<'networkChanged'>>;

  /**
   * Called when permissions are changed.
   * Mostly when account has been removed from the current `accountInteraction` permission,
   * or disconnect method was called
   */
  public subscribe(eventName: 'permissionsChanged'): Promise<Subscription<'permissionsChanged'>>;

  /**
   * Called when the user logs out of the extension
   */
  public subscribe(eventName: 'loggedOut'): Promise<Subscription<'loggedOut'>>;

  public async subscribe<T extends ProviderEvent>(
    eventName: T,
    params?: { address: Address },
  ): Promise<Subscription<T>> {
    type Handler<K extends SubscriptionEvent, T extends ProviderEvent> = K extends 'data'
      ? (data: ProviderEventData<T>) => void
      : () => void;

    class SubscriptionImpl<T extends ProviderEvent> implements Subscription<T> {
      private readonly _listeners: { [K in SubscriptionEvent]: Handler<K, T>[] } = {
        data: [],
        subscribed: [],
        unsubscribed: [],
      };
      private _subscribed = false;

      constructor(
        private readonly _subscribe: (s: SubscriptionImpl<T>) => Promise<void>,
        private readonly _unsubscribe: () => Promise<void>,
      ) {}

      on(eventName: 'data', listener: (data: ProviderEventData<T>) => void): this;
      on(eventName: 'subscribed', listener: () => void): this;
      on(eventName: 'unsubscribed', listener: () => void): this;
      on<K extends SubscriptionEvent>(eventName: K, listener: Handler<K, T>): this {
        this._listeners[eventName].push(listener);
        return this;
      }

      subscribe = async (): Promise<void> => {
        if (this._subscribed) {
          return;
        }
        this._subscribed = true;

        await this._subscribe(this);
        for (const handler of this._listeners['subscribed']) {
          handler();
        }
      };

      unsubscribe = async (): Promise<void> => {
        if (!this._subscribed) {
          return;
        }
        this._subscribed = false;

        await this._unsubscribe();
        for (const handler of this._listeners['unsubscribed']) {
          handler();
        }
      };

      notify(data: ProviderEventData<T>) {
        for (const handler of this._listeners['data']) {
          handler(data);
        }
      }
    }

    const existingSubscriptions = this._subscriptions[eventName];

    const id = getUniqueId();

    switch (eventName) {
      case 'connected':
      case 'disconnected':
      case 'messageStatusUpdated':
      case 'networkChanged':
      case 'permissionsChanged':
      case 'loggedOut': {
        const subscription = new SubscriptionImpl<T>(
          async subscription => {
            if (existingSubscriptions.has(id)) {
              return;
            }
            existingSubscriptions.set(id, data => {
              subscription.notify(data);
            });
          },
          async () => {
            existingSubscriptions.delete(id);
          },
        );
        await subscription.subscribe();
        return subscription;
      }
      case 'transactionsFound':
      case 'contractStateChanged': {
        if (params == null) {
          throw new Error('Address must be specified for the subscription');
        }

        await this.ensureInitialized();

        const address = params.address.toString();

        const subscription = new SubscriptionImpl<T>(
          async subscription => {
            if (existingSubscriptions.has(id)) {
              return;
            }
            existingSubscriptions.set(id, ((data: ProviderEventData<'transactionsFound' | 'contractStateChanged'>) => {
              if (data.address.toString() === address) {
                subscription.notify(data as ProviderEventData<T>);
              }
            }) as (data: ProviderEventData<T>) => void);

            let contractSubscriptions = this._contractSubscriptions.get(address);
            if (contractSubscriptions == null) {
              contractSubscriptions = new Map();
              this._contractSubscriptions.set(address, contractSubscriptions);
            }

            const subscriptionState = {
              state: eventName === 'contractStateChanged',
              transactions: eventName === 'transactionsFound',
            };
            contractSubscriptions.set(id, subscriptionState);

            const { total, withoutExcluded } = foldSubscriptions(contractSubscriptions.values(), subscriptionState);

            try {
              if (total.transactions !== withoutExcluded.transactions || total.state !== withoutExcluded.state) {
                await this.rawApi.subscribe({ address, subscriptions: total });
              }
            } catch (e) {
              existingSubscriptions.delete(id);
              contractSubscriptions.delete(id);
              throw e;
            }
          },
          async () => {
            existingSubscriptions.delete(id);

            const contractSubscriptions = this._contractSubscriptions.get(address);
            if (contractSubscriptions == null) {
              return;
            }
            const updates = contractSubscriptions.get(id);

            const { total, withoutExcluded } = foldSubscriptions(contractSubscriptions.values(), updates);
            contractSubscriptions.delete(id);

            if (!withoutExcluded.transactions && !withoutExcluded.state) {
              await this.rawApi.unsubscribe({ address });
            } else if (total.transactions !== withoutExcluded.transactions || total.state !== withoutExcluded.state) {
              await this.rawApi.subscribe({ address, subscriptions: withoutExcluded });
            }
          },
        );
        await subscription.subscribe();
        return subscription;
      }
      default: {
        throw new Error(`Unknown event ${eventName}`);
      }
    }
  }

  /**
   * Returns provider api state
   *
   * ---
   * Required permissions: none
   */
  public async getProviderState(): Promise<ProviderApiResponse<'getProviderState'>> {
    await this.ensureInitialized();
    const state = await this._api.getProviderState();
    return {
      ...state,
      permissions: parsePermissions(state.permissions),
    } as ProviderApiResponse<'getProviderState'>;
  }

  /**
   * Requests contract balance
   *
   * ---
   * Required permissions: `basic`
   */
  public async getBalance(address: Address): Promise<string> {
    const { state } = await this.getFullContractState({
      address,
    });
    return state == null ? '0' : state?.balance;
  }

  /**
   * Requests contract data
   *
   * ---
   * Required permissions: `basic`
   */
  public async getFullContractState(
    args: ProviderApiRequestParams<'getFullContractState'>,
  ): Promise<ProviderApiResponse<'getFullContractState'>> {
    await this.ensureInitialized();
    return (await this._api.getFullContractState({
      address: args.address.toString(),
    })) as ProviderApiResponse<'getFullContractState'>;
  }

  /**
   * Compute storage fee
   *
   * ---
   * Required permissions: `basic`
   */
  public async computeStorageFee(
    args: ProviderApiRequestParams<'computeStorageFee'>,
  ): Promise<ProviderApiResponse<'computeStorageFee'>> {
    await this.ensureInitialized();
    return (await this._api.computeStorageFee({
      state: {
        boc: args.state.boc,
        balance: args.state.balance,
        genTimings: {
          ...args.state.genTimings,
        },
        lastTransactionId: args.state.lastTransactionId != null ? { ...args.state.lastTransactionId } : undefined,
        isDeployed: args.state.isDeployed,
        codeHash: args.state.codeHash,
      },
      masterchain: args.masterchain,
      timestamp: args.timestamp,
    })) as ProviderApiResponse<'computeStorageFee'>;
  }

  /**
   * Requests accounts with specified code hash
   *
   * ---
   * Required permissions: `basic`
   */
  public async getAccountsByCodeHash(
    args: ProviderApiRequestParams<'getAccountsByCodeHash'>,
  ): Promise<ProviderApiResponse<'getAccountsByCodeHash'>> {
    await this.ensureInitialized();
    const { accounts, continuation } = await this._api.getAccountsByCodeHash({
      ...args,
    });
    return {
      accounts: accounts.map(address => new Address(address)),
      continuation,
    } as ProviderApiResponse<'getAccountsByCodeHash'>;
  }

  /**
   * Requests contract transactions
   *
   * ---
   * Required permissions: `basic`
   */
  public async getTransactions(
    args: ProviderApiRequestParams<'getTransactions'>,
  ): Promise<ProviderApiResponse<'getTransactions'>> {
    await this.ensureInitialized();
    const { transactions, continuation, info } = await this._api.getTransactions({
      ...args,
      address: args.address.toString(),
    });
    return {
      transactions: transactions.map(parseTransaction),
      continuation,
      info,
    } as ProviderApiResponse<'getTransactions'>;
  }

  /**
   * Searches transaction by hash
   *
   * ---
   * Required permissions: `basic`
   */
  public async getTransaction(
    args: ProviderApiRequestParams<'getTransaction'>,
  ): Promise<ProviderApiResponse<'getTransaction'>> {
    await this.ensureInitialized();
    const { transaction } = await this._api.getTransaction({
      ...args,
    });
    return {
      transaction: transaction ? parseTransaction(transaction) : undefined,
    } as ProviderApiResponse<'getTransaction'>;
  }

  /**
   * Computes contract address from code and init params
   *
   * ---
   * Required permissions: `basic`
   */
  public async getExpectedAddress<Abi>(abi: Abi, args: GetExpectedAddressParams<Abi>): Promise<Address> {
    const { address } = await this.getStateInit(abi, args);
    return address;
  }

  /**
   * Computes contract address and state from code and init params
   *
   * ---
   * Required permissions: `basic`
   */
  public async getStateInit<Abi>(
    abi: Abi,
    args: GetExpectedAddressParams<Abi>,
  ): Promise<ProviderApiResponse<'getExpectedAddress'>> {
    await this.ensureInitialized();
    const { address, stateInit, hash } = await this._api.getExpectedAddress({
      abi: JSON.stringify(abi),
      ...args,
      initParams: serializeTokensObject(args.initParams),
    });
    return {
      address: new Address(address),
      stateInit,
      hash,
    };
  }

  /**
   * Decodes initial contract data using the specified ABI
   *
   * ---
   * Required permissions: `basic`
   */
  public async unpackInitData<Abi>(
    abi: Abi,
    data: string,
  ): Promise<{
    publicKey?: string;
    initParams: DecodedAbiInitData<Abi>;
  }> {
    await this.ensureInitialized();
    const { publicKey, initParams } = await this._api.unpackInitData({
      abi: JSON.stringify(abi),
      data,
    });
    return {
      publicKey,
      initParams: parsePartialTokensObject((abi as any).data as AbiParam[], initParams) as DecodedAbiInitData<Abi>,
    };
  }

  /**
   * Computes hash of base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async getBocHash(boc: string): Promise<string> {
    await this.ensureInitialized();
    return await this._api
      .getBocHash({
        boc,
      })
      .then(({ hash }) => hash);
  }

  /**
   * Creates base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async packIntoCell<P extends readonly ReadonlyAbiParam[]>(args: {
    abiVersion?: AbiVersion;
    structure: P;
    data: MergeInputObjectsArray<P>;
  }): Promise<ProviderApiResponse<'packIntoCell'>> {
    await this.ensureInitialized();
    return (await this._api.packIntoCell({
      abiVersion: args.abiVersion,
      structure: args.structure as unknown as AbiParam[],
      data: serializeTokensObject(args.data),
    })) as ProviderApiResponse<'packIntoCell'>;
  }

  /**
   * Decodes base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async unpackFromCell<P extends readonly ReadonlyAbiParam[]>(args: {
    abiVersion?: AbiVersion;
    structure: P;
    boc: string;
    allowPartial: boolean;
  }): Promise<{ data: MergeOutputObjectsArray<P> }> {
    await this.ensureInitialized();
    const { data } = await this._api.unpackFromCell({
      ...args,
      structure: args.structure as unknown as AbiParam[],
    });
    return {
      data: parseTokensObject(args.structure as unknown as AbiParam[], data) as MergeOutputObjectsArray<P>,
    };
  }

  /**
   * Extracts public key from raw account state
   *
   * **NOTE:** can only be used on contracts which are deployed and has `pubkey` header
   *
   * ---
   * Required permissions: `basic`
   */
  public async extractPublicKey(boc: string): Promise<string> {
    await this.ensureInitialized();
    const { publicKey } = await this._api.extractPublicKey({
      boc,
    });
    return publicKey;
  }

  /**
   * Converts base64 encoded contract code into tvc with default init data
   *
   * ---
   * Required permissions: `basic`
   */
  public async codeToTvc(code: string): Promise<string> {
    await this.ensureInitialized();
    const { tvc } = await this._api.codeToTvc({
      code,
    });
    return tvc;
  }

  /**
   * Merges code and data into state init
   *
   * ---
   * Required permissions: `basic`
   */
  public async mergeTvc(args: ProviderApiRequestParams<'mergeTvc'>): Promise<ProviderApiResponse<'mergeTvc'>> {
    await this.ensureInitialized();
    return await this._api.mergeTvc(args);
  }

  /**
   * Splits base64 encoded state init into code and data
   *
   * ---
   * Required permissions: `basic`
   */
  public async splitTvc(tvc: string): Promise<ProviderApiResponse<'splitTvc'>> {
    await this.ensureInitialized();
    return await this._api.splitTvc({
      tvc,
    });
  }

  /**
   * Merges code and data into state init
   *
   * ---
   * Required permissions: `basic`
   */
  public async setCodeSalt<P extends readonly ReadonlyAbiParam[]>(
    args: SetCodeSaltParams<P>,
  ): Promise<ProviderApiResponse<'setCodeSalt'>> {
    let salt;
    if (typeof args.salt === 'string') {
      await this.ensureInitialized();
      salt = args.salt;
    } else {
      const { boc } = await this.packIntoCell(args.salt);
      salt = boc;
    }
    return await this._api.setCodeSalt({ code: args.code, salt });
  }

  /**
   * Retrieves salt from code. Returns undefined if code doesn't contain salt
   *
   * ---
   * Required permissions: `basic`
   */
  public async getCodeSalt(args: GetCodeSaltParams): Promise<string | undefined> {
    await this.ensureInitialized();
    const { salt } = await this.rawApi.getCodeSalt({
      code: args.code,
    });
    return salt;
  }

  /**
   * Adds asset to the selected account
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async addAsset<T extends AssetType>(args: AddAssetParams<T>): Promise<ProviderApiResponse<'addAsset'>> {
    await this.ensureInitialized();
    let params: AssetTypeParams<T, string>;
    switch (args.type) {
      case 'tip3_token': {
        params = {
          rootContract: args.params.rootContract.toString(),
        } as AssetTypeParams<T, string>;
        break;
      }
      default:
        throw new Error('Unknown asset type');
    }

    return await this._api.addAsset({
      account: args.account.toString(),
      type: args.type,
      params,
    });
  }

  public async verifySignature(
    args: ProviderApiRequestParams<'verifySignature'>,
  ): Promise<ProviderApiResponse<'verifySignature'>> {
    await this.ensureInitialized();
    return await this._api.verifySignature(args);
  }

  /**
   * Signs arbitrary data.
   *
   * NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async signData(args: ProviderApiRequestParams<'signData'>): Promise<ProviderApiResponse<'signData'>> {
    await this.ensureInitialized();
    return await this._api.signData(args);
  }

  /**
   * Signs arbitrary data without hashing it
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async signDataRaw(args: ProviderApiRequestParams<'signDataRaw'>): Promise<ProviderApiResponse<'signDataRaw'>> {
    await this.ensureInitialized();
    return await this._api.signDataRaw(args);
  }

  /**
   * Encrypts arbitrary data with specified algorithm for each specified recipient
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async encryptData(args: ProviderApiRequestParams<'encryptData'>): Promise<EncryptedData[]> {
    await this.ensureInitialized();
    const { encryptedData } = await this._api.encryptData(args);
    return encryptedData;
  }

  /**
   * Decrypts encrypted data. Returns base64 encoded data
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async decryptData(encryptedData: EncryptedData): Promise<string> {
    await this.ensureInitialized();
    const { data } = await this._api.decryptData({ encryptedData });
    return data;
  }

  /**
   * Sends an internal message from the user account.
   * Shows an approval window to the user.
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  public async sendMessage(args: ProviderApiRequestParams<'sendMessage'>): Promise<ProviderApiResponse<'sendMessage'>> {
    await this.ensureInitialized();
    const { transaction } = await this._api.sendMessage({
      sender: args.sender.toString(),
      recipient: args.recipient.toString(),
      amount: args.amount,
      bounce: args.bounce,
      payload: args.payload
        ? {
            abi: args.payload.abi,
            method: args.payload.method,
            params: serializeTokensObject(args.payload.params),
          }
        : undefined,
      stateInit: args.stateInit,
    });
    return {
      transaction: parseTransaction(transaction),
    };
  }

  /**
   * Sends an internal message from the user account without waiting for the transaction.
   * Shows an approval window to the user.
   *
   * @see messageStatusUpdated
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  public async sendMessageDelayed(
    args: ProviderApiRequestParams<'sendMessageDelayed'>,
  ): Promise<contract.DelayedMessageExecution> {
    await this.ensureInitialized();

    const transactions = new DelayedTransactions();

    const subscription = await this.subscribe('messageStatusUpdated');
    subscription.on('data', data => {
      if (!data.address.equals(args.sender)) {
        return;
      }
      transactions.fillTransaction(data.hash, data.transaction);
    });

    const { message } = await this._api
      .sendMessageDelayed({
        sender: args.sender.toString(),
        recipient: args.recipient.toString(),
        amount: args.amount,
        bounce: args.bounce,
        payload: args.payload
          ? {
              abi: args.payload.abi,
              method: args.payload.method,
              params: serializeTokensObject(args.payload.params),
            }
          : undefined,
        stateInit: args.stateInit,
      })
      .catch(e => {
        subscription.unsubscribe().catch(console.error);
        throw e;
      });

    const transaction = transactions
      .waitTransaction(args.sender, message.hash)
      .finally(() => subscription.unsubscribe().catch(console.error));

    return {
      messageHash: message.hash,
      expireAt: message.expireAt,
      transaction,
    };
  }

  /**
   * Get a list of available networks.
   *
   * ---
   * Required permissions: `basic`
   */
  public async getAvailableNetworks(): Promise<Network[]> {
    await this.ensureInitialized();
    return await this._api.getAvailableNetworks();
  }

  /**
   * Request user to add a new network.
   * Shows an approval window to the user.
   *
   * ---
   * Required permissions: `basic`
   */
  public async addNetwork(args: ProviderApiRequestParams<'addNetwork'>): Promise<Network | null> {
    await this.ensureInitialized();
    return await this._api.addNetwork(args);
  }

  /**
   * Request user to change selected network.
   * Shows an approval window to the user.
   *
   * ---
   * Required permissions: `basic`
   */
  public async changeNetwork(args: ProviderApiRequestParams<'changeNetwork'>): Promise<Network | null> {
    await this.ensureInitialized();
    return await this._api.changeNetwork(args);
  }

  private _registerEventHandlers(provider: Provider) {
    const knownEvents: { [K in ProviderEvent]: (data: RawProviderEventData<K>) => ProviderEventData<K> } = {
      connected: data => data,
      disconnected: data => data,
      transactionsFound: data => ({
        address: new Address(data.address),
        transactions: data.transactions.map(parseTransaction),
        info: data.info,
      }),
      contractStateChanged: data => ({
        address: new Address(data.address),
        state: data.state,
      }),
      messageStatusUpdated: data => ({
        address: new Address(data.address),
        hash: data.hash,
        transaction: data.transaction != null ? parseTransaction(data.transaction) : undefined,
      }),
      networkChanged: data => data,
      permissionsChanged: data => ({
        permissions: parsePermissions(data.permissions),
      }),
      loggedOut: data => data,
    };

    for (const [eventName, extractor] of Object.entries(knownEvents)) {
      provider.addListener(eventName as ProviderEvent, data => {
        const handlers = this._subscriptions[eventName as ProviderEvent];
        const parsed = (extractor as any)(data);
        for (const handler of handlers.values()) {
          handler(parsed);
        }
      });
    }
  }
}

/**
 * @category Provider
 */
export interface Subscription<T extends ProviderEvent> {
  /**
   * Fires on each incoming event with the event object as argument.
   *
   * @param eventName 'data'
   * @param listener
   */
  on(eventName: 'data', listener: (data: ProviderEventData<T>) => void): this;

  /**
   * Fires on successful re-subscription
   *
   * @param eventName 'subscribed'
   * @param listener
   */
  on(eventName: 'subscribed', listener: () => void): this;

  /**
   * Fires on unsubscription
   *
   * @param eventName 'unsubscribed'
   * @param listener
   */
  on(eventName: 'unsubscribed', listener: () => void): this;

  /**
   * Can be used to re-subscribe with the same parameters.
   */
  subscribe: () => Promise<void>;

  /**
   * Unsubscribes the subscription.
   */
  unsubscribe: () => Promise<void>;
}

type SubscriptionEvent = 'data' | 'subscribed' | 'unsubscribed';

/**
 * @category Provider
 */
export class ProviderNotFoundException extends Error {
  constructor() {
    super('Everscale provider was not found');
  }
}

/**
 * @category Provider
 */
export class ProviderNotInitializedException extends Error {
  constructor() {
    super('Everscale provider was not initialized yet');
  }
}

/**
 * @category Provider
 */
export type RawRpcMethod<P extends ProviderMethod> =
  RawProviderApiRequestParams<P> extends undefined
    ? () => Promise<RawProviderApiResponse<P>>
    : (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>>;

/**
 * @category Provider
 */
export type RawProviderApiMethods = {
  [P in ProviderMethod]: RawRpcMethod<P>;
};

/**
 * @category Provider
 */
export type GetExpectedAddressParams<Abi> = Abi extends { data: infer D }
  ? {
      /**
       * Base64 encoded TVC file
       */
      tvc: string;
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
      initParams: MergeInputObjectsArray<D>;
    }
  : never;

/**
 * @category Provider
 */
export type SetCodeSaltParams<P extends readonly ReadonlyAbiParam[]> = {
  /**
   * Base64 encoded contract code
   */
  code: string;
  /**
   * Base64 encoded salt (as BOC) or params of boc encoder
   */
  salt:
    | string
    | {
        /**
         * ABI version. 2.2 if not specified otherwise
         */
        abiVersion?: AbiVersion;
        /**
         * Cell structure
         */
        structure: P;
        /**
         * Cell data
         */
        data: MergeInputObjectsArray<P>;
      };
};

/**
 * @category Provider
 */
export type GetCodeSaltParams = {
  /**
   * Base64 encoded contract code
   */
  code: string;
};

/**
 * @category Provider
 */
export type AddAssetParams<T extends AssetType> = {
  /**
   * Owner's wallet address.
   * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
   */
  account: Address;
  /**
   * Which asset to add
   */
  type: T;
  /**
   * Asset parameters
   */
  params: AssetTypeParams<T>;
};

function foldSubscriptions(
  subscriptions: Iterable<ContractUpdatesSubscription>,
  except?: ContractUpdatesSubscription,
): { total: ContractUpdatesSubscription; withoutExcluded: ContractUpdatesSubscription } {
  const total = { state: false, transactions: false };
  const withoutExcluded = Object.assign({}, total);

  for (const item of subscriptions) {
    if (withoutExcluded.transactions && withoutExcluded.state) {
      break;
    }

    total.state ||= item.state;
    total.transactions ||= item.transactions;
    if (item !== except) {
      withoutExcluded.state ||= item.state;
      withoutExcluded.transactions ||= item.transactions;
    }
  }

  return { total, withoutExcluded };
}
