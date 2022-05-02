import { ProviderEvent, ProviderEventData } from './api';
import { Address, getUniqueId } from './utils';
import { TransactionId, TransactionsBatchInfo } from './models';
import { ProviderRpcClient, Subscription } from './index';

type SubscriptionWithAddress = Extract<ProviderEvent, 'transactionsFound' | 'contractStateChanged'>

type SubscriptionsWithAddress = {
  [K in SubscriptionWithAddress]?: {
    subscription: Promise<Subscription<K>>
    handlers: {
      [id: string]: {
        onData: (event: ProviderEventData<K>) => Promise<boolean>,
        onEnd: (eof: boolean) => void,
        queue: PromiseQueue
        state: { eof: boolean, finished: boolean },
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

  constructor(private readonly provider: ProviderRpcClient) {
  }

  /**
   * Returns stream of new transactions
   */
  public transactions(address: Address): IdentityStream<ProviderEventData<'transactionsFound'>> {
    return this._addSubscription('transactionsFound', address, false);
  }

  /**
   * Returns stream of old transactions
   */
  public oldTransactions(
    address: Address,
    filter?: { fromLt?: string, fromUtime?: number },
  ): IdentityStream<ProviderEventData<'transactionsFound'>, true> {
    const id = getUniqueId();

    return new StreamImpl(
      async (onData, onEnd) => {
        const scanner = new UnorderedTransactionsScanner(this.provider, {
          address,
          onData,
          onEnd,
          ...filter,
        });
        this.scanners[id] = scanner;
        await scanner.start();
      },
      async () => {
        const scanner = this.scanners[id];
        delete this.scanners[id];
        if (scanner != null) {
          await scanner.stop();
        }
      },
      identity,
      true,
    );
  }

  public states(address: Address): IdentityStream<ProviderEventData<'contractStateChanged'>> {
    return this._addSubscription('contractStateChanged', address, false);
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
            }),
          );
        }).concat(Object.values(scanners).map((item) => item.stop())),
    );
  }

  private _addSubscription<T extends keyof SubscriptionsWithAddress, F extends boolean>(
    event: T,
    address: Address,
    isFinite: F,
  ): IdentityStream<ProviderEventData<T>, F> {
    type EventData = Exclude<SubscriptionsWithAddress[T], undefined>;

    const rawAddress = address.toString();

    const stopProducer = (id: string) => {
      const subscriptions = this.subscriptions[rawAddress] as SubscriptionsWithAddress | undefined;
      if (subscriptions == null) {
        // No subscriptions for the address
        return;
      }

      const eventData = subscriptions[event] as EventData | undefined;
      if (eventData != null) {
        const handler = eventData.handlers[id] as EventData['handlers'][number] | undefined;
        if (handler != null) {
          // Remove event handler with the id
          delete eventData.handlers[id];

          const { queue, onEnd, state } = handler;
          if (!state.finished) {
            state.finished = true;
            queue.clear();
            queue.enqueue(async () => onEnd(state.eof));
          }
        }

        // Remove event data subscription if there are none of them
        if (Object.keys(eventData.handlers).length === 0) {
          const subscription = eventData.subscription as Promise<Subscription<T>>;
          delete subscriptions[event];

          subscription
            .then((subscription) => subscription.unsubscribe())
            .catch(console.debug);
        }
      }

      // Remove address subscriptions object if it is empty
      if (Object.keys(subscriptions).length === 0) {
        delete this.subscriptions[rawAddress];
      }
    };

    const id = getUniqueId().toString();

    return new StreamImpl(
      (onData, onEnd) => {
        let subscriptions = this.subscriptions[rawAddress] as SubscriptionsWithAddress | undefined;
        let eventData = subscriptions?.[event] as EventData | undefined;

        const state = { eof: false, finished: false };

        // Create handler object
        const handler = {
          onData,
          onEnd,
          queue: new PromiseQueue(),
          state,
        } as EventData['handlers'][number];

        if (eventData != null) {
          // Add handler if there is already a handler group
          eventData.handlers[id] = handler;
          return;
        }

        // Create handlers group
        const handlers = {
          [id]: handler,
        } as EventData['handlers'];

        // Create subscription
        const subscription = (this.provider.subscribe as any)(event, { address })
          .then((subscription: Subscription<T>) => {
            subscription.on('data', (data) => {
              Object.values(handlers).forEach(({ onData, queue, state }) => {
                // Skip closed streams
                if (state.eof || state.finished) {
                  return;
                }

                queue.enqueue(async () => {
                  if (!(await onData(data))) {
                    state.eof = true;
                    stopProducer(id);
                  }
                });
              });
            });
            subscription.on('unsubscribed', () => {
              Object.keys(handlers).forEach(stopProducer);
            });
            return subscription;
          }).catch((e: Error) => {
            console.error(e);
            Object.keys(handlers).forEach(stopProducer);
            throw e;
          });

        // Add event data to subscriptions
        eventData = { subscription, handlers } as EventData;
        if (subscriptions == null) {
          this.subscriptions[rawAddress] = { [event]: eventData };
        } else {
          subscriptions[event] = eventData;
        }
      },
      () => stopProducer(id),
      identity,
      isFinite,
    );
  }
}

async function identity<P>(item: P, handler: (item: P) => (Promise<boolean> | boolean)) {
  return handler(item);
}

/**
 * @category Stream
 */
export type BothFinite<F extends boolean, F1 extends boolean> =
  F extends true ? F1 extends true ? true : false : false;

/**
 * @category Stream
 */
export type IdentityStream<T, F extends boolean = false> = Stream<T, T, F>;

/**
 * @category Stream
 */
export interface Stream<P, T, F extends boolean = false> {
  readonly makeProducer: (onData: (data: P) => Promise<boolean>, onEnd: (eof: boolean) => void) => void;
  readonly stopProducer: () => void;
  readonly isFinite: F;

  /**
   * Waits for the first element or the end of the stream
   */
  first(): Promise<F extends true ? T | undefined : T>;

  /**
   * Folds every element into an accumulator by applying an operation, returning the final result
   */
  fold: F extends true ? <B>(init: B, f: (init: B, item: T) => (Promise<B> | B)) => Promise<B> : never;

  /**
   * Waits until the end of the stream
   */
  finished: F extends true ? () => Promise<undefined> : never;

  /**
   * Executes handler on each item
   */
  on(handler: (item: T) => (Promise<void> | void)): void;

  /**
   * Merges two streams
   */
  merge<F1 extends boolean>(other: Stream<P, T, F1>): Stream<P, T, BothFinite<F, F1>>;

  /**
   * Alias for the `.map((item) => { f(item); return item; })`
   */
  tap(handler: (item: T) => (Promise<void> | void)): Stream<P, T, F>;

  /**
   * Skip elements where `f(item) == false`
   */
  filter(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, F>;

  /**
   * Modifies items and skip all `undefined`
   */
  filterMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U, F>;

  /**
   * Modifies items
   */
  map<U>(f: (item: T) => (Promise<U> | U)): Stream<P, U, F>;

  /**
   * Creates an iterator that flattens nested structure
   */
  flatMap<U>(f: (item: T) => (Promise<U[]> | U[])): Stream<P, U, F>;

  /**
   * Creates an iterator that skips the first n elements
   */
  skip(n: number): Stream<P, T, F>;

  /**
   * Creates an iterator that skips elements based on a predicate
   */
  skipWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, F>;

  /**
   * Creates an iterator that yields the first n elements, or fewer if the underlying iterator ends sooner
   */
  take(n: number): Stream<P, T, true>;

  /**
   * Creates an iterator that yields elements based on a predicate
   */
  takeWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, true>;

  /**
   * Creates an iterator that yields mapped elements based on a predicate until first `undefined` is found
   */
  takeWhileMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U, true>;
}

class StreamImpl<P, T, F extends boolean> implements Stream<P, T, F> {
  constructor(
    readonly makeProducer: (onData: (data: P) => Promise<boolean>, onEnd: (eof: boolean) => void) => void,
    readonly stopProducer: () => void,
    readonly extractor: (data: P, handler: (item: T) => (Promise<boolean> | boolean)) => Promise<boolean>,
    readonly isFinite: F,
  ) {
  }

  public first(): Promise<F extends true ? T | undefined : T> {
    type R = F extends true ? T | undefined : T;

    let state: { found: false } | { found: true, result: T } = { found: false };

    return new Promise<R>(async (resolve: (value: R) => void, reject) => {
      this.makeProducer(
        // onData
        (data) => this.extractor(data, (item) => {
          Object.assign(state, { found: true, result: item });
          return false;
        }),
        // onEnd
        (eof) => {
          if (eof) {
            if (this.isFinite) {
              resolve((state.found ? state.result : undefined) as R);
            } else if (state.found) {
              resolve(state.result as R);
            } else {
              reject(new Error('Unexpected end of stream'));
            }
          } else {
            reject(new Error('Subscription closed'));
          }
        },
      );
    });
  }

  /**
   * Folds every element into an accumulator by applying an operation, returning the final result
   */
  public fold = this.onlyFinite(<B>(init: B, f: (init: B, item: T) => (Promise<B> | B)): Promise<B> => {
    let state = init;

    return new Promise<B>(async (resolve: (value: B) => void, reject) => {
      this.makeProducer(
        // onData
        (data) => this.extractor(data, async (item) => {
          state = await f(state, item);
          return true;
        }),
        // onEnd
        (eof) => {
          if (eof) {
            resolve(state);
          } else {
            reject(new Error('Subscription closed'));
          }
        },
      );
    });
  });

  /**
   * Waits until the end of the stream
   */
  public finished = this.onlyFinite((): Promise<undefined> => new Promise<undefined>(async (resolve, reject) => {
      this.makeProducer(
        // onData
        (data) => this.extractor(data, (_item) => true),
        // onEnd
        (eof) => {
          if (eof) {
            resolve(undefined);
          } else {
            reject(new Error('Subscription closed'));
          }
        },
      );
    }),
  );

  public on(handler: (item: T) => (Promise<void> | void)): void {
    this.makeProducer(
      (event) => this.extractor(event, async (item) => {
        await handler(item);
        return true;
      }),
      (_eof) => {
      });
  }

  public merge<F1 extends boolean>(other: Stream<P, T, F1>): Stream<P, T, BothFinite<F, F1>> {
    return new StreamImpl<P, T, BothFinite<F, F1>>(
      (onData, onEnd) => {
        const state = {
          stopped: false,
          counter: 0,
        };
        const checkEnd = (eof: boolean) => {
          if (state.stopped) {
            return;
          }

          if (++state.counter == 2 || !eof) {
            state.stopped = true;
            onEnd(eof);
          }
        };

        this.makeProducer(onData, checkEnd);
        other.makeProducer(onData, checkEnd);
      },
      () => {
        this.stopProducer();
        other.stopProducer();
      },
      this.extractor,
      (this.isFinite && other.isFinite) as BothFinite<F, F1>,
    );
  }

  public tap(f: (item: T) => (Promise<void> | void)): Stream<P, T, F> {
    return new StreamImpl<P, T, F>(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item: T) => {
          await f(item);
          return handler(item);
        }),
      this.isFinite,
    );
  }

  public filter(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, F> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item) => {
          if (await f(item)) {
            return handler(item);
          } else {
            return true;
          }
        }),
      this.isFinite,
    );
  }

  public filterMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U, F> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item: T) => {
          const newItem = await f(item);
          if (newItem !== undefined) {
            return handler(newItem);
          } else {
            return true;
          }
        }),
      this.isFinite,
    );
  }

  public map<U>(f: (item: T) => (Promise<U> | U)): Stream<P, U, F> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item: T) => {
          const newItem = await f(item);
          return handler(newItem);
        }),
      this.isFinite,
    );
  }

  public flatMap<U>(f: (item: T) => (Promise<U[]> | U[])): Stream<P, U, F> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item: T) => {
          const items = await f(item);
          for (const newItem of items) {
            if (!(await handler(newItem))) {
              return false;
            }
          }
          return true;
        }),
      this.isFinite,
    );
  }

  public skip(n: number): Stream<P, T, F> {
    const state = {
      index: 0,
    };

    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, (item) => {
          if (state.index >= n) {
            return handler(item);
          } else {
            ++state.index;
            return true;
          }
        }),
      this.isFinite,
    );
  }

  public skipWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, F> {
    const state = {
      shouldSkip: true,
    };

    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item) => {
          if (!state.shouldSkip || !(await f(item))) {
            state.shouldSkip = false;
            return handler(item);
          } else {
            return true;
          }
        }),
      this.isFinite,
    );
  }

  public take(n: number): Stream<P, T, true> {
    const state = {
      index: 0,
    };

    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, (item) => {
          if (state.index < n) {
            ++state.index;
            return handler(item);
          } else {
            return false;
          }
        }),
      true,
    );
  }

  public takeWhile(f: (item: T) => (Promise<boolean> | boolean)): Stream<P, T, true> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item) => {
          if (await f(item)) {
            return handler(item);
          } else {
            return false;
          }
        }),
      true,
    );
  }

  public takeWhileMap<U>(f: (item: T) => (Promise<(U | undefined)> | (U | undefined))): Stream<P, U, true> {
    return new StreamImpl(
      this.makeProducer,
      this.stopProducer,
      (event, handler) =>
        this.extractor(event, async (item: T) => {
          const newItem = await f(item);
          if (newItem !== undefined) {
            return handler(newItem);
          } else {
            return false;
          }
        }),
      true,
    );
  }

  private onlyFinite<C>(f: C): F extends true ? C : never {
    if (this.isFinite) {
      return f as any;
    } else {
      throw new Error('Expected finite stream');
    }
  }
}

type UnorderedTransactionsScannerParams = {
  address: Address;
  onData: (data: ProviderEventData<'transactionsFound'>) => Promise<boolean>;
  onEnd: (eof: boolean) => void;
  fromLt?: string;
  fromUtime?: number;
  toLt?: string;
  toUtime?: number;
};

class UnorderedTransactionsScanner {
  private readonly queue: PromiseQueue = new PromiseQueue();

  private continuation?: TransactionId;
  private promise?: Promise<void>;
  private isRunning: boolean = false;

  constructor(
    private readonly provider: ProviderRpcClient,
    private readonly params: UnorderedTransactionsScannerParams) {
  }

  public async start() {
    if (this.isRunning || this.promise != null) {
      return;
    }

    this.isRunning = true;
    this.promise = (async () => {
      const params = this.params;
      let state = {
        complete: false,
      };

      while (this.isRunning && !state.complete) {
        try {
          const { transactions, continuation } = await this.provider.getTransactions({
            address: this.params.address,
            continuation: this.continuation,
          });

          state.complete = !state.complete && transactions.length == null;
          if (!this.isRunning || state.complete) {
            break;
          }

          const fromFilteredTransactions = transactions.filter((item) => (
            (params.fromLt == null || item.id.lt > params.fromLt) &&
            (params.fromUtime == null || item.createdAt > params.fromUtime)
          ));

          if (fromFilteredTransactions.length == 0) {
            state.complete = true;
            break;
          }

          const toFilteredTransactions = fromFilteredTransactions.filter((item) => (
            (params.toLt == null || item.id.lt < params.toLt) &&
            (params.toUtime == null || item.createdAt < params.toUtime)
          ));

          if (toFilteredTransactions.length > 0) {
            const info = {
              maxLt: toFilteredTransactions[0].id.lt,
              minLt: toFilteredTransactions[toFilteredTransactions.length - 1].id.lt,
              batchType: 'old',
            } as TransactionsBatchInfo;

            this.queue.enqueue(async () => {
              const isRunning = this.params.onData({
                address: this.params.address,
                transactions: toFilteredTransactions,
                info,
              });
              if (!isRunning) {
                state.complete = true;
                this.isRunning = false;
              }
            });
          }

          if (continuation != null) {
            this.continuation = continuation;
          } else {
            state.complete = true;
            break;
          }
        } catch (e) {
          console.error(e);
        }
      }

      this.queue.enqueue(async () => this.params.onEnd(state.complete));
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
      this.params.onEnd(false);
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
