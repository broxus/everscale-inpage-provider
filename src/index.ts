import {
  ProviderEvent,
  ProviderEventData,
  ProviderMethod,
  ProviderApiResponse,
  RawProviderEventData,
  RawProviderRequest,
  RawProviderApiRequestParams,
  RawProviderApiResponse,
  ProviderApiRequestParams
} from './api';

import {
  AbiParam,
  ContractUpdatesSubscription,
  MergeInputObjectsArray,
  MergeOutputObjectsArray,
  parsePermissions,
  parseTokensObject,
  parseTransaction,
  serializeTokensObject, ReadonlyAbiParam
} from './models';

import {
  Address,
  AddressLiteral,
  getUniqueId
} from './utils';

import { Subscriber } from './stream';

import { Contract } from './contract';

export * from './api';
export * from './models';
export { Contract, TvmException, ContractMethod } from './contract';
export { Stream, Subscriber } from './stream';
export { Address, AddressLiteral, mergeTransactions } from './utils';

/**
 * @category Provider
 */
export interface Provider {
  request<T extends ProviderMethod>(data: RawProviderRequest<T>): Promise<RawProviderApiResponse<T>>

  addListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void

  removeListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void

  on<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void

  once<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void

  prependListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void

  prependOnceListener<T extends ProviderEvent>(eventName: T, listener: (data: RawProviderEventData<T>) => void): void
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

/**
 * @category Provider
 */
export async function hasTonProvider(): Promise<boolean> {
  await ensurePageLoaded;
  return (window as Record<string, any>).hasTonProvider === true;
}

/**
 * @category Provider
 */
export class ProviderRpcClient {
  private readonly _api: RawProviderApiMethods;
  private readonly _initializationPromise: Promise<void>;
  private readonly _subscriptions: { [K in ProviderEvent]?: { [id: number]: (data: ProviderEventData<K>) => void } } = {};
  private readonly _contractSubscriptions: { [address: string]: { [id: number]: ContractUpdatesSubscription } } = {};
  private _ton?: Provider;

  constructor() {
    this._api = new Proxy({}, {
      get: <K extends ProviderMethod>(
        _object: ProviderRpcClient,
        method: K
      ) => (params?: RawProviderApiRequestParams<K>) => this._ton!.request({ method, params: params! })
    }) as unknown as RawProviderApiMethods;

    this._ton = (window as any).ton;
    if (this._ton != null) {
      this._initializationPromise = Promise.resolve();
    } else {
      this._initializationPromise = hasTonProvider().then((hasTonProvider) => new Promise((resolve, reject) => {
        if (!hasTonProvider) {
          reject(new ProviderNotFoundException());
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

    this._initializationPromise.then(() => {
      if (this._ton == null) {
        return;
      }

      const knownEvents: { [K in ProviderEvent]: (data: RawProviderEventData<K>) => ProviderEventData<K> } = {
        'disconnected': (data) => data,
        'transactionsFound': (data) => ({
          address: new Address(data.address),
          transactions: data.transactions.map(parseTransaction),
          info: data.info
        }),
        'contractStateChanged': (data) => ({
          address: new Address(data.address),
          state: data.state
        }),
        'networkChanged': data => data,
        'permissionsChanged': (data) => ({
          permissions: parsePermissions(data.permissions)
        }),
        'loggedOut': data => data
      };

      for (const [eventName, extractor] of Object.entries(knownEvents)) {
        this._ton.addListener(eventName as ProviderEvent, (data) => {
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
    });
  }

  /**
   * Checks whether ton provider exists.
   */
  public async hasProvider(): Promise<boolean> {
    return hasTonProvider();
  }

  /**
   * Waits until provider api will be available.
   *
   * @throws ProviderNotFoundException when no provider found
   */
  public async ensureInitialized(): Promise<void> {
    await this._initializationPromise;
  }

  /**
   * Whether provider api is ready
   */
  public get isInitialized(): boolean {
    return this._ton != null;
  }

  /**
   * Raw provider
   */
  public get raw(): Provider {
    return this._ton!;
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
   */
  public createContract<Abi>(abi: Abi, address: Address): Contract<Abi> {
    return new Contract<Abi>(abi, address);
  }

  /**
   * Creates subscriptions group
   */
  public createSubscriber(): Subscriber {
    return new Subscriber(this);
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
      permissions: args.permissions
    });
    return parsePermissions(result);
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
        ['unsubscribed']: []
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
            transactions: eventName == 'transactionsFound'
          };

          const {
            total,
            withoutExcluded
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
      permissions: parsePermissions(state.permissions)
    } as ProviderApiResponse<'getProviderState'>;
  }

  /**
   * Requests contract data
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async getFullContractState(args: ProviderApiRequestParams<'getFullContractState'>): Promise<ProviderApiResponse<'getFullContractState'>> {
    return await this._api.getFullContractState({
      address: args.address.toString()
    }) as ProviderApiResponse<'getFullContractState'>;
  }

  /**
   * Requests contract transactions
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async getTransactions(args: ProviderApiRequestParams<'getTransactions'>): Promise<ProviderApiResponse<'getTransactions'>> {
    const { transactions, continuation } = await this._api.getTransactions({
      ...args,
      address: args.address.toString()
    });
    return {
      transactions: transactions.map(parseTransaction),
      continuation
    } as ProviderApiResponse<'getTransactions'>;
  }

  /**
   * Calculates contract address from code and init params
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async getExpectedAddress<Abi>(abi: Abi, args: GetExpectedAddressParams<Abi>): Promise<Address> {
    const { address } = await this._api.getExpectedAddress({
      abi: JSON.stringify(abi),
      ...args,
      initParams: serializeTokensObject(args.initParams)
    });
    return new Address(address);
  }

  /**
   * Creates base64 encoded BOC
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async packIntoCell<P extends readonly ReadonlyAbiParam[]>(args: { structure: P, data: MergeInputObjectsArray<P> }): Promise<ProviderApiResponse<'packIntoCell'>> {
    return await this._api.packIntoCell({
      structure: args.structure as unknown as AbiParam[],
      data: serializeTokensObject(args.data)
    }) as ProviderApiResponse<'packIntoCell'>;
  }

  /**
   * Decodes base64 encoded BOC
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async unpackFromCell<P extends readonly ReadonlyAbiParam[]>(args: { structure: P, boc: string, allowPartial: boolean }): Promise<{ data: MergeOutputObjectsArray<P> }> {
    const { data } = await this._api.unpackFromCell({
      ...args,
      structure: args.structure as unknown as AbiParam[]
    });
    return {
      data: parseTokensObject(args.structure as unknown as AbiParam[], data) as MergeOutputObjectsArray<P>
    };
  }

  /**
   * Extracts public key from raw account state
   *
   * NOTE: can only be used on contracts which are deployed and has `pubkey` header
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async extractPublicKey(boc: string): Promise<string> {
    const { publicKey } = await this._api.extractPublicKey({
      boc
    });
    return publicKey;
  }

  /**
   * Converts base64 encoded contract code into tvc with default init data
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async codeToTvc(code: string): Promise<string> {
    const { tvc } = await this._api.codeToTvc({
      code
    });
    return tvc;
  }

  /**
   * Splits base64 encoded state init into code and data
   *
   * ---
   * Required permissions: `tonClient`
   */
  public async splitTvc(tvc: string): Promise<ProviderApiResponse<'splitTvc'>> {
    return await this._api.splitTvc({
      tvc
    });
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
        params: serializeTokensObject(args.payload.params)
      }) : undefined
    });
    return {
      transaction: parseTransaction(transaction)
    };
  }

  private _getEventSubscriptions<T extends ProviderEvent>(
    eventName: T
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
  unsubscribe(): Promise<void>
}

type SubscriptionEvent = 'data' | 'subscribed' | 'unsubscribed';

/**
 * @category Provider
 */
export class ProviderNotFoundException extends Error {
  constructor() {
    super('TON provider was not found');
  }
}

/**
 * @category Provider
 */
export type RawRpcMethod<P extends ProviderMethod> = RawProviderApiRequestParams<P> extends {}
  ? (args: RawProviderApiRequestParams<P>) => Promise<RawProviderApiResponse<P>>
  : () => Promise<RawProviderApiResponse<P>>

type RawProviderApiMethods = {
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

function foldSubscriptions(
  subscriptions: Iterable<ContractUpdatesSubscription>,
  except: ContractUpdatesSubscription
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

const provider = new ProviderRpcClient();

/**
 * @category Provider
 */
export default provider;
