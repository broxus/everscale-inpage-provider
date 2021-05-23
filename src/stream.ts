import { ProviderEvent, ProviderEventData } from './api';
import { Address, getUniqueId } from './utils';
import { TransactionId, TransactionsBatchInfo } from './models';
import { ProviderRpcClient, Subscription } from './index';

type SubscriptionWithAddress = Extract<ProviderEvent, 'transactionsFound' | 'contractStateChanged'>

type SubscriptionsWithAddress = {
  [K in SubscriptionWithAddress]?: {
    subscription: Promise<Subscription<K>>
    handlers: {
      [id: number]: {
        onData: (event: ProviderEventData<K>) => Promise<void>,
        onEnd: () => void,
        queue: PromiseQueue
      }
    }
  }
};

/**
 * @category Stream
 */
export class Subscriber {
  private readonly subscriptions: { [address: string]: SubscriptionsWithAddress } = {};
  private readonly scanners: { [id: number]: UnorderedTransactionsScanner } = {};

  constructor(private readonly ton: ProviderRpcClient) {
  }

  /**
   * Returns stream of new transactions
   */
  public transactions(address: Address): Stream<ProviderEventData<'transactionsFound'>> {
    return this._addSubscription('transactionsFound', address);
  }

  /**
   * Returns stream of old transactions
   */
  public oldTransactions(address: Address, filter?: { fromLt?: string, fromUtime?: number }): Stream<ProviderEventData<'transactionsFound'>> {
    const id = getUniqueId();

    return new StreamImpl(async (onData, onEnd) => {
      const scanner = new UnorderedTransactionsScanner(this.ton, {
        address,
        onData,
        onEnd,
        ...filter
      });
      this.scanners[id] = scanner;
      await scanner.start();
    }, async () => {
      const scanner = this.scanners[id];
      delete this.scanners[id];
      if (scanner != null) {
        await scanner.stop();
      }
    }, identity);
  }

  public states(address: Address): Stream<ProviderEventData<'contractStateChanged'>> {
    return this._addSubscription('contractStateChanged', address);
  }

  public async unsubscribe(): Promise<void> {
    const subscriptions = Object.assign({}, this.subscriptions);
    for (const address of Object.keys(this.subscriptions)) {
      delete this.subscriptions[address];
    }

    const scanners = Object.assign({}, this.scanners);
    for (const id of Object.keys(this.scanners)) {
      delete this.scanners[id as any];
    }

    await Promise.all(
      Object.values(subscriptions)
        .map(async (item: SubscriptionsWithAddress) => {
          const events = Object.assign({}, item);
          for (const event of Object.keys(events)) {
            delete item[event as unknown as SubscriptionWithAddress];
          }

          await Promise.all(
            Object.values(events).map((eventData) => {
              if (eventData == null) {
                return;
              }

              return eventData.subscription.then((item: Subscription<SubscriptionWithAddress>) => {
                return item.unsubscribe();
              }).catch(() => {
                // ignore
              });
            })
          );
        }).concat(Object.values(scanners).map((item) => item.stop()))
    );
  }

  private _addSubscription<T extends keyof SubscriptionsWithAddress>(event: T, address: Address): Stream<ProviderEventData<T>> {
    type EventData = Required<SubscriptionsWithAddress>[T];

    const id = getUniqueId();

    return new StreamImpl((onData, onEnd) => {
      let subscriptions = this.subscriptions[address.toString()] as SubscriptionsWithAddress | undefined;
      let eventData = subscriptions?.[event] as EventData | undefined;
      if (eventData == null) {
        const handlers = {
          [id]: { onData, onEnd, queue: new PromiseQueue() }
        } as EventData['handlers'];

        eventData = {
          subscription: (this.ton.subscribe as any)(event, {
            address
          }).then((subscription: Subscription<T>) => {
            subscription.on('data', (data) => {
              Object.values(handlers).forEach(({ onData, queue }) => {
                queue.enqueue(() => onData(data));
              });
            });
            subscription.on('unsubscribed', () => {
              Object.values(handlers).forEach(({ onEnd, queue }) => {
                delete handlers[id];
                queue.clear();
                queue.enqueue(async () => onEnd());
              });
            });
            return subscription;
          }).catch((e: Error) => {
            console.error(e);
            Object.values(handlers).forEach(({ onEnd, queue }) => {
              delete handlers[id];
              queue.clear();
              queue.enqueue(() => onEnd());
            });
            throw e;
          }),
          handlers
        } as EventData;

        if (subscriptions == null) {
          subscriptions = {
            [event]: eventData
          };
          this.subscriptions[address.toString()] = subscriptions;
        } else {
          subscriptions[event] = eventData;
        }
      } else {
        eventData.handlers[id] = { onData, onEnd, queue: new PromiseQueue() } as EventData['handlers'][number];
      }
    }, () => {
      const subscriptions = this.subscriptions[address.toString()] as SubscriptionsWithAddress | undefined;
      if (subscriptions == null) {
        return;
      }

      const eventData = subscriptions[event] as EventData | undefined;
      if (eventData != null) {
        delete eventData.handlers[id];
        if (Object.keys(eventData.handlers).length === 0) {
          const subscription = eventData.subscription as Promise<Subscription<T>>;
          delete subscriptions[event];

          subscription
            .then((subscription) => subscription.unsubscribe())
            .catch(console.debug);
        }
      }

      if (Object.keys(subscriptions).length === 0) {
        delete this.subscriptions[address.toString()];
      }
    }, identity);
  }
}

async function identity<P>(event: P, handler: (item: P) => (Promise<void> | void)) {
  await handler(event);
}

/**
 * @category Stream
 */
export interface Stream<P, T = P> {
  readonly makeProducer: (onData: (event: P) => Promise<void>, onEnd: () => void) => void;
  readonly stopProducer: () => void;

  first(): Promise<T>

  on(handler: (item: T) => void): void

  merge(other: Stream<P, T>): Stream<P, T>;

  filter(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T>;

  filterMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U>;

  map<U>(f: (item: T) => (Promise<U> | U)): Stream<P, U>;

  flatMap<U>(f: (item: T) => (Promise<U[]> | U[])): Stream<P, U>;

  skip(n: number): Stream<P, T>;

  skipWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T>;
}

class StreamImpl<P, T> implements Stream<P, T> {
  constructor(
    readonly makeProducer: (onData: (event: P) => Promise<void>, onEnd: () => void) => void,
    readonly stopProducer: () => void,
    readonly extractor: (event: P, handler: (item: T) => (Promise<void> | void)) => Promise<void>) {
  }

  public first(): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      this.makeProducer(async (event) => {
        await this.extractor(event, (item) => {
          this.stopProducer();
          resolve(item);
        });
      }, () => reject(new Error('Subscription closed')));
    });
  }

  public on(handler: (item: T) => void): void {
    this.makeProducer(async (event) => {
      await this.extractor(event, handler);
    }, () => {
    });
  }

  public merge(other: Stream<P, T>): Stream<P, T> {
    return new StreamImpl<P, T>(async (onEvent, onEnd) => {
      const state = {
        counter: 0
      };
      const checkEnd = () => {
        if (++state.counter == 2) {
          onEnd();
        }
      };

      this.makeProducer(onEvent, checkEnd);
      other.makeProducer(onEvent, checkEnd);
    }, () => {
      this.stopProducer();
      other.stopProducer();
    }, this.extractor) as Stream<P, T>;
  }

  public filter(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) =>
      this.extractor(event, async (item) => {
        if (f(item)) {
          await handler(item);
        }
      })
    );
  }

  public filterMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) =>
      this.extractor(event, async (item: T) => {
        const newItem = await f(item);
        if (newItem !== undefined) {
          await handler(newItem);
        }
      })
    );
  }

  public map<U>(f: (item: T) => (Promise<U> | U)): Stream<P, U> {
    return this.filterMap(f);
  }

  public flatMap<U>(f: (item: T) => (Promise<U[]> | U[])): Stream<P, U> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) =>
      this.extractor(event, async (item: T) => {
        const items = await f(item);
        for (const newItem of items) {
          await handler(newItem);
        }
      })
    );
  }

  public skip(n: number): Stream<P, T> {
    const state = {
      index: 0
    };

    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) =>
      this.extractor(event, async (item) => {
        if (state.index >= n) {
          await handler(item);
        } else {
          ++state.index;
        }
      })
    );
  }

  public skipWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T> {
    const state = {
      shouldSkip: true
    };

    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) =>
      this.extractor(event, async (item) => {
        if (!state.shouldSkip || !(await f(item))) {
          state.shouldSkip = false;
          await handler(item);
        }
      })
    );
  }
}

type UnorderedTransactionsScannerParams = {
  address: Address;
  onData: (data: ProviderEventData<'transactionsFound'>) => Promise<void>;
  onEnd: () => void;
  fromLt?: string;
  fromUtime?: number;
};

class UnorderedTransactionsScanner {
  private readonly address: Address;
  private readonly onData: (data: ProviderEventData<'transactionsFound'>) => Promise<void>;
  private readonly onEnd: () => void;
  private readonly queue: PromiseQueue = new PromiseQueue();
  private readonly fromLt?: string;
  private readonly fromUtime?: number;
  private continuation?: TransactionId;
  private promise?: Promise<void>;
  private isRunning: boolean = false;

  constructor(private readonly ton: ProviderRpcClient, {
    address,
    onData,
    onEnd,
    fromLt,
    fromUtime
  }: UnorderedTransactionsScannerParams) {
    this.address = address;
    this.onData = onData;
    this.onEnd = onEnd;
    this.fromLt = fromLt;
    this.fromUtime = fromUtime;
  }

  public async start() {
    if (this.isRunning || this.promise != null) {
      return;
    }

    this.isRunning = true;
    this.promise = (async () => {
      while (this.isRunning) {
        try {
          const { transactions, continuation } = await this.ton.getTransactions({
            address: this.address,
            continuation: this.continuation
          });

          if (!this.isRunning || transactions.length == null) {
            break;
          }

          const filteredTransactions = transactions.filter((item) => (
            (this.fromLt == null || item.id.lt > this.fromLt) && (
              (this.fromUtime == null || item.createdAt > this.fromUtime)
            )
          ));

          console.log('Got transactions', filteredTransactions);

          if (filteredTransactions.length == 0) {
            break;
          }

          const info = {
            maxLt: filteredTransactions[0].id.lt,
            minLt: filteredTransactions[filteredTransactions.length - 1].id.lt,
            batchType: 'old'
          } as TransactionsBatchInfo;

          this.queue.enqueue(() => this.onData({
            address: this.address,
            transactions: filteredTransactions,
            info
          }));

          if (continuation != null) {
            this.continuation = continuation;
          } else {
            break;
          }
        } catch (e) {
          console.error(e);
        }
      }

      this.queue.enqueue(async () => this.onEnd());
      this.isRunning = false;
      this.continuation = undefined;
    })();
  }

  public async stop() {
    this.isRunning = false;
    this.queue.clear();
    if (this.promise != null) {
      await this.promise;
    } else {
      this.onEnd();
    }
  }
}

class PromiseQueue {
  private readonly queue: (() => Promise<void>)[] = [];
  private workingOnPromise: boolean = false;

  public enqueue(promise: () => Promise<void>) {
    this.queue.push(promise);
    this._dequeue().catch(() => {
    });
  }

  public clear() {
    this.queue.length = 0;
  }

  private async _dequeue() {
    if (this.workingOnPromise) {
      return;
    }

    const item = this.queue.shift();
    if (!item) {
      return;
    }

    this.workingOnPromise = true;
    item()
      .then(() => {
        this.workingOnPromise = false;
        this._dequeue();
      })
      .catch(() => {
        this.workingOnPromise = false;
        this._dequeue();
      });
  }
}
