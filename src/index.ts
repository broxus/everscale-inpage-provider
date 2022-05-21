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
  AbiParam,
  AssetType,
  AssetTypeParams,
  ContractUpdatesSubscription,
  EncryptedData,
  MergeInputObjectsArray,
  MergeOutputObjectsArray,
  ReadonlyAbiParam,
  parsePermissions,
  parseTokensObject,
  parseTransaction,
  serializeTokensObject,
} from './models';
import {
  Address,
  AddressLiteral,
  getUniqueId,
} from './utils';
import * as subscriber from './stream';
import * as contract from './contract';

export * from './api';
export * from './models';
export * from './contract';
export { Stream, Subscriber } from './stream';
export { Address, AddressLiteral, UniqueArray, mergeTransactions } from './utils';

/**
 * @category Provider
 */
export interface Provider {
  request<T extends ProviderMethod>(data: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>;

  addListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;

  removeListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;

  on<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;

  once<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void;
}

const getProvider = (): Provider | undefined => (window as any).__ever || (window as any).ton;

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

/**
 * @category Provider
 */
export async function hasEverscaleProvider(): Promise<boolean> {
  await ensurePageLoaded;
  return (window as Record<string, any>).__hasEverscaleProvider === true ||
    (window as Record<string, any>).hasTonProvider === true;
}

/**
 * @category Provider
 */
export class ProviderRpcClient {
  private readonly _api: RawProviderApiMethods;
  private readonly _initializationPromise: Promise<void>;
  private readonly _subscriptions: { [K in ProviderEvent]?: { [id: number]: (data: ProviderEventData<K>) => void } } = {};
  private readonly _contractSubscriptions: { [address: string]: { [id: number]: ContractUpdatesSubscription } } = {};
  private _provider?: Provider;

  public Contract: new <Abi>(abi: Abi, address: Address) => contract.Contract<Abi>;
  public Subscriber: new () => subscriber.Subscriber;

  constructor(properties: ProviderProperties = {}) {
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
    this._api = new Proxy({}, {
      get: <K extends ProviderMethod>(
        _object: ProviderRpcClient,
        method: K,
      ) => (params?: RawProviderApiRequestParams<K>) => {
        if (this._provider != null) {
          return this._provider.request({ method, params: params! });
        } else {
          throw new ProviderNotInitializedException();
        }
      },
    }) as unknown as RawProviderApiMethods;

    if (properties.forceUseFallback === true) {
      this._initializationPromise = properties.fallback != null
        ? properties.fallback()
          .then((provider) => {
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
          .then((hasProvider) => new Promise<void>((resolve) => {
            if (!hasProvider) {
              // Fully loaded page doesn't even contain provider flag
              return resolve();
            }

            // Wait injected provider initialization otherwise
            this._provider = getProvider();
            if (this._provider != null) {
              resolve();
            } else {
              const eventName = (window as Record<string, any>).__hasEverscaleProvider === true ? 'ever#initialized' : 'ton#initialized';
              window.addEventListener(eventName, (_data) => {
                this._provider = getProvider();
                resolve();
              });
            }
          }))
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
   * Checks whether this page has injected Everscale provider
   */
  public async hasProvider(): Promise<boolean> {
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
  public async requestPermissions(args: ProviderApiRequestParams<'requestPermissions'>): Promise<ProviderApiResponse<'requestPermissions'>> {
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
    await this._api.changeAccount();
  }

  /**
   * Removes all permissions for current origin and stops all subscriptions
   */
  public async disconnect(): Promise<void> {
    await this._api.disconnect();
  }

  /**
   * Called every time contract state changes
   */
  public subscribe(eventName: 'contractStateChanged', params: { address: Address }): Promise<Subscription<'contractStateChanged'>>;

  /**
   * Called on each new transactions batch, received on subscription
   */
  public subscribe(eventName: 'transactionsFound', params: { address: Address }): Promise<Subscription<'transactionsFound'>>;

  /**
   * Called every time when provider connection is established
   */
  public subscribe(eventName: 'connected'): Promise<Subscription<'connected'>>;

  /**
   * Called when inpage provider disconnects from extension
   */
  public subscribe(eventName: 'disconnected'): Promise<Subscription<'disconnected'>>;

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

  public async subscribe<T extends ProviderEvent>(eventName: T, params?: { address: Address }): Promise<Subscription<T>> {
    class SubscriptionImpl<T extends ProviderEvent> implements Subscription<T> {
      private readonly _listeners: { [K in SubscriptionEvent]: ((data?: any) => void)[] } = {
        ['data']: [],
        ['subscribed']: [],
        ['unsubscribed']: [],
      };

      constructor(
        private readonly _subscribe: (s: SubscriptionImpl<T>) => Promise<void>,
        private readonly _unsubscribe: () => Promise<void>) {
      }

      on(eventName: 'data', listener: (data: ProviderEventData<T>) => void): this;
      on(eventName: 'subscribed', listener: () => void): this;
      on(eventName: 'unsubscribed', listener: () => void): this;
      on(eventName: SubscriptionEvent, listener: ((data: ProviderEventData<T>) => void) | (() => void)): this {
        this._listeners[eventName].push(listener);
        return this;
      }

      async subscribe(): Promise<void> {
        await this._subscribe(this);
        for (const handler of this._listeners['subscribed']) {
          handler();
        }
      }

      async unsubscribe(): Promise<void> {
        await this._unsubscribe();
        for (const handler of this._listeners['unsubscribed']) {
          handler();
        }
      }

      notify(data: ProviderEventData<T>) {
        for (const handler of this._listeners['data']) {
          handler(data);
        }
      }
    }

    let existingSubscriptions = this._getEventSubscriptions(eventName);

    const id = getUniqueId();

    switch (eventName) {
      case 'connected':
      case 'disconnected':
      case 'networkChanged':
      case 'permissionsChanged':
      case 'loggedOut': {
        const subscription = new SubscriptionImpl<T>(async (subscription) => {
          if (existingSubscriptions[id] != null) {
            return;
          }
          existingSubscriptions[id] = (data) => {
            subscription.notify(data);
          };
        }, async () => {
          delete existingSubscriptions[id];
        });
        await subscription.subscribe();
        return subscription;
      }
      case 'transactionsFound':
      case 'contractStateChanged': {
        const address = params!.address.toString();

        const subscription = new SubscriptionImpl<T>(async (subscription) => {
          if (existingSubscriptions[id] != null) {
            return;
          }
          existingSubscriptions[id] = ((data: ProviderEventData<'transactionsFound' | 'contractStateChanged'>) => {
            if (data.address.toString() == address) {
              subscription.notify(data as ProviderEventData<T>);
            }
          }) as (data: ProviderEventData<T>) => void;

          let contractSubscriptions = this._contractSubscriptions[address];
          if (contractSubscriptions == null) {
            contractSubscriptions = {};
            this._contractSubscriptions[address] = contractSubscriptions;
          }

          contractSubscriptions[id] = {
            state: eventName == 'contractStateChanged',
            transactions: eventName == 'transactionsFound',
          };

          const {
            total,
            withoutExcluded,
          } = foldSubscriptions(Object.values(contractSubscriptions), contractSubscriptions[id]);

          try {
            if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
              await this.rawApi.subscribe({ address, subscriptions: total });
            }
          } catch (e) {
            delete existingSubscriptions[id];
            delete contractSubscriptions[id];
            throw e;
          }
        }, async () => {
          delete existingSubscriptions[id];

          const contractSubscriptions = this._contractSubscriptions[address];
          if (contractSubscriptions == null) {
            return;
          }
          const updates = contractSubscriptions[id];

          const { total, withoutExcluded } = foldSubscriptions(Object.values(contractSubscriptions), updates);
          delete contractSubscriptions[id];

          if (!withoutExcluded.transactions && !withoutExcluded.state) {
            await this.rawApi.unsubscribe({ address });
          } else if (total.transactions != withoutExcluded.transactions || total.state != withoutExcluded.state) {
            await this.rawApi.subscribe({ address, subscriptions: withoutExcluded });
          }
        });
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
    const state = await this._api.getProviderState();
    return {
      ...state,
      permissions: parsePermissions(state.permissions),
    } as ProviderApiResponse<'getProviderState'>;
  }

  /**
   * Requests contract data
   *
   * ---
   * Required permissions: `basic`
   */
  public async getFullContractState(args: ProviderApiRequestParams<'getFullContractState'>): Promise<ProviderApiResponse<'getFullContractState'>> {
    return await this._api.getFullContractState({
      address: args.address.toString(),
    }) as ProviderApiResponse<'getFullContractState'>;
  }

  /**
   * Requests accounts with specified code hash
   *
   * ---
   * Required permissions: `basic`
   */
  public async getAccountsByCodeHash(args: ProviderApiRequestParams<'getAccountsByCodeHash'>): Promise<ProviderApiResponse<'getAccountsByCodeHash'>> {
    const { accounts, continuation } = await this._api.getAccountsByCodeHash({
      ...args,
    });
    return {
      accounts: accounts.map((address) => new Address(address)),
      continuation,
    } as ProviderApiResponse<'getAccountsByCodeHash'>;
  }

  /**
   * Requests contract transactions
   *
   * ---
   * Required permissions: `basic`
   */
  public async getTransactions(args: ProviderApiRequestParams<'getTransactions'>): Promise<ProviderApiResponse<'getTransactions'>> {
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
  public async getTransaction(args: ProviderApiRequestParams<'getTransaction'>): Promise<ProviderApiResponse<'getTransaction'>> {
    const { transaction } = await this._api.getTransaction({
      ...args,
    });
    return {
      transaction: transaction ? parseTransaction(transaction) : undefined,
    } as ProviderApiResponse<'getTransaction'>;
  }

  /**
   * Calculates contract address from code and init params
   *
   * ---
   * Required permissions: `basic`
   */
  public async getExpectedAddress<Abi>(abi: Abi, args: GetExpectedAddressParams<Abi>): Promise<Address> {
    const { address } = await this._api.getExpectedAddress({
      abi: JSON.stringify(abi),
      ...args,
      initParams: serializeTokensObject(args.initParams),
    });
    return new Address(address);
  }

  /**
   * Computes hash of base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async getBocHash(boc: string): Promise<string> {
    return await this._api.getBocHash({
      boc,
    }).then(({ hash }) => hash);
  }

  /**
   * Creates base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async packIntoCell<P extends readonly ReadonlyAbiParam[]>(args: { structure: P, data: MergeInputObjectsArray<P> }): Promise<ProviderApiResponse<'packIntoCell'>> {
    return await this._api.packIntoCell({
      structure: args.structure as unknown as AbiParam[],
      data: serializeTokensObject(args.data),
    }) as ProviderApiResponse<'packIntoCell'>;
  }

  /**
   * Decodes base64 encoded BOC
   *
   * ---
   * Required permissions: `basic`
   */
  public async unpackFromCell<P extends readonly ReadonlyAbiParam[]>(args: { structure: P, boc: string, allowPartial: boolean }): Promise<{ data: MergeOutputObjectsArray<P> }> {
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
    const { tvc } = await this._api.codeToTvc({
      code,
    });
    return tvc;
  }

  /**
   * Splits base64 encoded state init into code and data
   *
   * ---
   * Required permissions: `basic`
   */
  public async splitTvc(tvc: string): Promise<ProviderApiResponse<'splitTvc'>> {
    return await this._api.splitTvc({
      tvc,
    });
  }

  /**
   * Adds asset to the selected account
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async addAsset<T extends AssetType>(args: AddAssetParams<T>): Promise<ProviderApiResponse<'addAsset'>> {
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

  public async verifySignature(args: ProviderApiRequestParams<'verifySignature'>): Promise<ProviderApiResponse<'verifySignature'>> {
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
    return await this._api.signData(args);
  }

  /**
   * Signs arbitrary data without hashing it
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async signDataRaw(args: ProviderApiRequestParams<'signDataRaw'>): Promise<ProviderApiResponse<'signDataRaw'>> {
    return await this._api.signDataRaw(args);
  }

  /**
   * Encrypts arbitrary data with specified algorithm for each specified recipient
   *
   * ---
   * Requires permissions: `accountInteraction`
   */
  public async encryptData(args: ProviderApiRequestParams<'encryptData'>): Promise<EncryptedData[]> {
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
    const { data } = await this._api.decryptData({ encryptedData });
    return data;
  }

  /**
   * Sends internal message from user account.
   * Shows an approval window to the user.
   *
   * ---
   * Required permissions: `accountInteraction`
   */
  public async sendMessage(args: ProviderApiRequestParams<'sendMessage'>): Promise<ProviderApiResponse<'sendMessage'>> {
    const { transaction } = await this._api.sendMessage({
      ...args,
      sender: args.sender.toString(),
      recipient: args.recipient.toString(),
      payload: args.payload ? ({
        abi: args.payload.abi,
        method: args.payload.method,
        params: serializeTokensObject(args.payload.params),
      }) : undefined,
    });
    return {
      transaction: parseTransaction(transaction),
    };
  }

  private _registerEventHandlers(provider: Provider) {
    const knownEvents: { [K in ProviderEvent]: (data: RawProviderEventData<K>) => ProviderEventData<K> } = {
      'connected': (data) => data,
      'disconnected': (data) => data,
      'transactionsFound': (data) => ({
        address: new Address(data.address),
        transactions: data.transactions.map(parseTransaction),
        info: data.info,
      }),
      'contractStateChanged': (data) => ({
        address: new Address(data.address),
        state: data.state,
      }),
      'networkChanged': data => data,
      'permissionsChanged': (data) => ({
        permissions: parsePermissions(data.permissions),
      }),
      'loggedOut': data => data,
    };

    for (const [eventName, extractor] of Object.entries(knownEvents)) {
      provider.addListener(eventName as ProviderEvent, (data) => {
        const handlers = this._subscriptions[eventName as ProviderEvent];
        if (handlers == null) {
          return;
        }
        const parsed = (extractor as any)(data);
        for (const handler of Object.values(handlers)) {
          handler(parsed);
        }
      });
    }
  }

  private _getEventSubscriptions<T extends ProviderEvent>(
    eventName: T,
  ): ({ [id: number]: (data: ProviderEventData<T>) => void }) {
    let existingSubscriptions = this._subscriptions[eventName];
    if (existingSubscriptions == null) {
      existingSubscriptions = {};
      this._subscriptions[eventName] = existingSubscriptions;
    }

    return existingSubscriptions as { [id: number]: (data: ProviderEventData<T>) => void };
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
  subscribe(): Promise<void>;

  /**
   * Unsubscribes the subscription.
   */
  unsubscribe(): Promise<void>;
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
export type RawRpcMethod<P extends ProviderMethod> = RawProviderApiRequestParams<P> extends {}
  ? (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>>
  : () => Promise<RawProviderApiResponse<P>>

/**
 * @category Provider
 */
export type RawProviderApiMethods = {
  [P in ProviderMethod]: RawRpcMethod<P>
}

/**
 * @category Provider
 */
export type GetExpectedAddressParams<Abi> = Abi extends { data: infer D } ?
  {
    /**
     * Base64 encoded TVC file
     */
    tvc: string,
    /**
     * Contract workchain. 0 by default
     */
    workchain?: number,
    /**
     * Public key, which will be injected into the contract. 0 by default
     */
    publicKey?: string;
    /**
     * State init params
     */
    initParams: MergeInputObjectsArray<D>;
  } : never;

/**
 * @category Provider
 */
export type AddAssetParams<T extends AssetType> = {
  /**
   * Owner's wallet address.
   * It is the same address as the `accountInteraction.address`, but it must be explicitly provided
   */
  account: Address,
  /**
   * Which asset to add
   */
  type: T,
  /**
   * Asset parameters
   */
  params: AssetTypeParams<T>,
};

function foldSubscriptions(
  subscriptions: Iterable<ContractUpdatesSubscription>,
  except: ContractUpdatesSubscription,
): { total: ContractUpdatesSubscription, withoutExcluded: ContractUpdatesSubscription } {
  const total = { state: false, transactions: false };
  const withoutExcluded = Object.assign({}, total);

  for (const item of subscriptions) {
    if (withoutExcluded.transactions && withoutExcluded.state) {
      break;
    }

    total.state ||= item.state;
    total.transactions ||= item.transactions;
    if (item != except) {
      withoutExcluded.state ||= item.state;
      withoutExcluded.transactions ||= item.transactions;
    }
  }

  return { total, withoutExcluded };
}
