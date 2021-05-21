import { ProviderEvent, ProviderEventData } from './api';
import { Address, getUniqueId } from './utils';
import { ProviderRpcClient, ISubscription } from './index';

type SubscriptionWithAddress = Extract<ProviderEvent, 'transactionsFound' | 'contractStateChanged'>

type SubscriptionsWithAddress = {
  [K in SubscriptionWithAddress]?: {
    subscription: Promise<ISubscription<K>>
    handlers: {
      [id: number]: {
        onData: (event: ProviderEventData<K>) => void,
        onEnd: () => void
      }
    }
  }
};

/**
 * @category Stream
 */
export class Subscriber {
  private readonly subscriptions: { [address: string]: SubscriptionsWithAddress } = {};

  constructor(private readonly ton: ProviderRpcClient) {
  }

  public transactions(address: Address): Stream<ProviderEventData<'transactionsFound'>> {
    return this._addSubscription('transactionsFound', address);
  }

  public states(address: Address): Stream<ProviderEventData<'contractStateChanged'>> {
    return this._addSubscription('contractStateChanged', address);
  }

  public async unsubscribe(): Promise<void> {
    const subscriptions = Object.assign({}, this.subscriptions);
    for (const address of Object.keys(this.subscriptions)) {
      delete this.subscriptions[address];
    }

    await Promise.all(
      Object.values(subscriptions)
        .map((item: SubscriptionsWithAddress) => {
          const events = Object.assign({}, item);
          for (const event of Object.keys(events)) {
            delete item[event as unknown as SubscriptionWithAddress];
          }

          return Promise.all(
            Object.values(events).map((eventData) => {
              if (eventData == null) {
                return;
              }

              return eventData.subscription.then((item: ISubscription<SubscriptionWithAddress>) => {
                return item.unsubscribe();
              }).catch(() => {
                // ignore
              });
            })
          );
        })
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
          [id]: { onData, onEnd }
        } as EventData['handlers'];

        eventData = {
          subscription: (this.ton.subscribe as any)(event, {
            address
          }).then((subscription: ISubscription<T>) => {
            subscription.on('data', (data) => {
              Object.values(handlers).forEach(({ onData }) => {
                onData(data);
              });
            });
            subscription.on('unsubscribed', () => {
              Object.values(handlers).forEach(({ onEnd }) => {
                delete handlers[id];
                onEnd();
              });
            });
            return subscription;
          }).catch((e: Error) => {
            console.error(e);
            Object.values(handlers).forEach(({ onEnd }) => {
              delete handlers[id];
              onEnd();
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
        eventData.handlers[id] = { onData, onEnd } as EventData['handlers'][number];
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
          const subscription = eventData.subscription as Promise<ISubscription<T>>;
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

function identity<P>(event: P, handler: (item: P) => void): void {
  handler(event);
}

/**
 * @category Stream
 */
export interface Stream<P, T = P> {
  readonly makeProducer: (onData: (event: P) => void, onEnd: () => void) => void;
  readonly stopProducer: () => void;

  first(): Promise<T>

  on(handler: (item: T) => void): void

  merge(other: Stream<P, T>): Stream<P, T>;

  map<U>(f: (item: T) => U): Stream<P, U>;

  flatMap<U>(f: (item: T) => U[]): Stream<P, U>;

  filter(f: (item: T) => boolean): Stream<P, T>;

  filterMap<U>(f: (item: T) => (U | undefined)): Stream<P, U>;

  skip(n: number): Stream<P, T>;

  skipWhile(f: (item: T) => boolean): Stream<P, T>;
}

class StreamImpl<P, T> implements Stream<P, T> {
  constructor(
    readonly makeProducer: (onEvent: (event: P) => void, onEnd: () => void) => void,
    readonly stopProducer: () => void,
    readonly extractor: (event: P, handler: (item: T) => void) => void) {
  }

  public first(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.makeProducer((event) => {
        this.extractor(event, (item) => {
          this.stopProducer();
          resolve(item);
        });
      }, () => reject(new Error('Subscription closed')));
    });
  }

  public on(handler: (item: T) => void): void {
    this.makeProducer((event) => {
      this.extractor(event, handler);
    }, () => {
    });
  }

  public merge(other: Stream<P, T>): Stream<P, T> {
    return new StreamImpl<P, T>((onEvent, onEnd) => {
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

  public filter(f: (item: T) => boolean): Stream<P, T> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => {
      this.extractor(event, (item) => {
        if (f(item)) {
          handler(item);
        }
      });
    });
  }

  public filterMap<U>(f: (item: T) => (U | undefined)): Stream<P, U> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => {
      this.extractor(event, (item) => {
        const newItem = f(item);
        if (newItem !== undefined) {
          handler(newItem);
        }
      });
    });
  }

  public map<U>(f: (item: T) => U): Stream<P, U> {
    return this.filterMap(f);
  }

  public flatMap<U>(f: (item: T) => U[]): Stream<P, U> {
    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => {
      this.extractor(event, (item) => {
        const items = f(item);
        for (const newItem of items) {
          handler(newItem);
        }
      });
    });
  }

  public skip(n: number): Stream<P, T> {
    const state = {
      index: 0
    };

    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => {
      this.extractor(event, (item) => {
        if (state.index >= n) {
          handler(item);
        } else {
          ++state.index;
        }
      });
    });
  }

  public skipWhile(f: (item: T) => boolean): Stream<P, T> {
    const state = {
      shouldSkip: true
    };

    return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => {
      this.extractor(event, (item) => {
        if (!state.shouldSkip || !f(item)) {
          state.shouldSkip = false;
          handler(item);
        }
      });
    });
  }
}
