import { ProviderEvent, ProviderEventData } from './api';
import { Address } from './utils';
import { ProviderRpcClient, ISubscription } from './index';

export class SubscriptionStream {
  constructor(private readonly ton: ProviderRpcClient) {
  }

  public async transactions(address: Address): Promise<Stream<ProviderEventData<'transactionsFound'>>> {
    const subscription = await this.ton.subscribe('transactionsFound', {
      address
    });
    return new StreamImpl((extractor: (event: ProviderEventData<'transactionsFound'>) => void) => {
      subscription.on('data', extractor);
    }, identity);
  }

  public async states(address: Address): Promise<Stream<ProviderEventData<'contractStateChanged'>>> {
    const subscription = await this.ton.subscribe('contractStateChanged', {
      address
    });
    return new StreamImpl((extractor: (event: ProviderEventData<'contractStateChanged'>) => void) => {
      subscription.on('data', extractor);
    }, identity);
  }
}

function identity<T>(data: T) {
  return data;
}

export interface Stream<P, T = P> {
  readonly makeProducer: (handler: (event: P) => void, unsubscribed: () => void) => void

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
    readonly extractor: (event: P, handler: (item: T) => void) => void) {
  }

  public first(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.makeProducer((event) => {
        this.extractor(event, resolve);
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
    }, this.extractor) as Stream<P, T>;
  }

  public filter(f: (item: T) => boolean): Stream<P, T> {
    return new StreamImpl(this.makeProducer, (event, handler) => {
      this.extractor(event, (item) => {
        if (f(item)) {
          handler(item);
        }
      });
    });
  }

  public filterMap<U>(f: (item: T) => (U | undefined)): Stream<P, U> {
    return new StreamImpl(this.makeProducer, (event, handler) => {
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
    return new StreamImpl(this.makeProducer, (event, handler) => {
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

    return new StreamImpl(this.makeProducer, (event, handler) => {
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

    return new StreamImpl(this.makeProducer, (event, handler) => {
      this.extractor(event, (item) => {
        if (!state.shouldSkip || !f(item)) {
          state.shouldSkip = false;
          handler(item);
        }
      });
    });
  }
}
