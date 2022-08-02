import {
  Address,
  UniqueArray,
  LT_COLLATOR,
} from './utils';
import {
  AbiParam,
  FullContractState,
  RawTokensObject,
  TokensObject,
  Transaction,
  Message,
  AbiFunctionName,
  AbiEventName,
  AbiFunctionInputs,
  DecodedAbiFunctionOutputs,
  DecodedAbiFunctionInputs,
  DecodedAbiEventData,
  TransactionId,
  serializeTokensObject,
  parseTransaction,
  parseTokensObject,
  serializeTransaction,
} from './models';
import { Stream, Subscriber } from './stream';
import { ProviderRpcClient } from './index';

/**
 * @category Contract
 */
export class Contract<Abi> {
  private readonly _provider: ProviderRpcClient;
  private readonly _abi: string;
  private readonly _functions: { [name: string]: { inputs: AbiParam[], outputs: AbiParam[] } };
  private readonly _events: { [name: string]: { inputs: AbiParam[] } };
  private readonly _address: Address;
  private readonly _methods: ContractMethods<Abi>;

  constructor(provider: ProviderRpcClient, abi: Abi, address: Address) {
    if (!Array.isArray((abi as any).functions)) {
      throw new Error('Invalid abi. Functions array required');
    }
    if (!Array.isArray((abi as any).events)) {
      throw new Error('Invalid abi. Events array required');
    }

    this._provider = provider;
    this._abi = JSON.stringify(abi);
    this._functions = ((abi as any).functions as ContractFunction[]).reduce((functions, item) => {
      functions[item.name] = { inputs: item.inputs || [], outputs: item.outputs || [] };
      return functions;
    }, {} as typeof Contract.prototype._functions);

    this._events = ((abi as any).events as ContractFunction[]).reduce((events, item) => {
      events[item.name] = { inputs: item.inputs || [] };
      return events;
    }, {} as typeof Contract.prototype._events);

    this._address = address;

    this._methods = new Proxy({}, {
      get: <K extends AbiFunctionName<Abi>>(_object: Record<string, unknown>, method: K) => {
        const rawAbi = this._functions[method];
        return (params: AbiFunctionInputs<Abi, K>) => new ContractMethodImpl(
          this._provider, rawAbi, this._abi, this._address, method, params,
        );
      },
    }) as unknown as ContractMethods<Abi>;
  }

  public get methods(): ContractMethods<Abi> {
    return this._methods;
  }

  public get address(): Address {
    return this._address;
  }

  public get abi(): string {
    return this._abi;
  }

  /**
   * Creates new contract transactions stream
   *
   * @param subscriber
   */
  public transactions(subscriber: Subscriber): Stream<unknown, Transaction> {
    return subscriber.transactions(this._address)
      .flatMap(({ transactions }) => transactions);
  }

  /**
   * Creates new contract events stream
   *
   * @param subscriber
   */
  public events(subscriber: Subscriber): Stream<unknown, DecodedEventWithTransaction<Abi, AbiEventName<Abi>>> {
    return subscriber.transactions(this._address)
      .flatMap(({ transactions }) => transactions)
      .flatMap((tx) => this.decodeTransactionEvents({ transaction: tx }).then((events) => {
        events.forEach((event) => (event as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>).transaction = tx);
        return events as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>[];
      }));
  }

  public async waitForEvent(args: WaitForEventParams<Abi> = {}): Promise<DecodedEvent<Abi, AbiEventName<Abi>> | undefined> {
    const { range, filter } = args;

    let subscriber = args.subscriber;
    const hasTempSubscriber = subscriber == null;
    if (subscriber == null) {
      subscriber = new this._provider.Subscriber();
    }

    const event = await (
      (range?.fromLt != null || range?.fromUtime != null)
        ? subscriber.oldTransactions(this._address, range)
          .merge(subscriber.transactions(this._address))
        : subscriber.transactions(this.address)
    ).flatMap(item => item.transactions)
      .takeWhile(item => range == null ||
        (range.fromLt == null || LT_COLLATOR.compare(item.id.lt, range.fromLt) > 0) &&
        (range.fromUtime == null || item.createdAt > range.fromUtime) &&
        (range.toLt == null || LT_COLLATOR.compare(item.id.lt, range.toLt) < 0) &&
        (range.toUtime == null || item.createdAt < range.toUtime),
      )
      .flatMap(tx => this.decodeTransactionEvents({ transaction: tx })
        .then((events) => {
          events.forEach((event) => (event as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>).transaction = tx);
          return events as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>[];
        }))
      .filterMap(async event => {
        if (filter == null || (await filter(event))) {
          return event;
        } else {
          return undefined;
        }
      })
      .first();

    hasTempSubscriber && (await subscriber.unsubscribe());

    return event;
  }

  public async getPastEvents(args: GetPastEventParams<Abi>): Promise<EventsBatch<Abi>> {
    const { range, filter, limit } = args;

    const result: DecodedEventWithTransaction<Abi, AbiEventName<Abi>>[] = [];
    let currentContinuation = args?.continuation;

    outer: while (true) {
      const { transactions, continuation } = await this._provider.getTransactions({
        address: this._address,
        continuation: currentContinuation,
      });
      if (transactions.length === null) {
        break;
      }

      const filteredTransactions = transactions.filter((item) => (
        (range?.fromLt == null || LT_COLLATOR.compare(item.id.lt, range.fromLt) > 0) &&
        (range?.fromUtime == null || item.createdAt > range.fromUtime) &&
        (range?.toLt == null || LT_COLLATOR.compare(item.id.lt, range.toLt) < 0) &&
        (range?.toUtime == null || item.createdAt < range.toUtime)
      ));

      if (filteredTransactions.length > 0) {
        const parsedEvents = await Promise.all(filteredTransactions.map(async tx => {
          return {
            tx, events: await this.decodeTransactionEvents({ transaction: tx }).then((events) => {
              events.forEach((event) => (event as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>).transaction = tx);
              return events as DecodedEventWithTransaction<Abi, AbiEventName<Abi>>[];
            }),
          };
        }));

        for (let { tx, events } of parsedEvents) {
          if (filter != null) {
            events = await Promise.all(
              events.map(async event =>
                (await filter(event)) ? event : undefined,
              ),
            ).then(events =>
              events.filter((event): event is Awaited<DecodedEventWithTransaction<Abi, AbiEventName<Abi>>> =>
                event != null),
            );
          }

          currentContinuation = tx.id; // update continuation in case of early break

          for (const event of events) {
            if (limit != null && result.length >= limit) {
              break outer;
            }
            result.push(event);
          }

          if (limit != null && result.length >= limit) {
            break outer;
          }
        }
      }

      currentContinuation = continuation;
      if (currentContinuation == null) {
        break;
      }
    }

    return { events: result, continuation: currentContinuation };
  }

  public async decodeTransaction(args: DecodeTransactionParams<Abi>): Promise<DecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined> {
    await this._provider.ensureInitialized();
    try {
      const result = await this._provider.rawApi.decodeTransaction({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi,
        method: args.methods,
      });
      if (result == null) {
        return undefined;
      }

      const { method, input, output } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {},
        output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {},
      } as DecodedTransaction<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeTransactionEvents(args: DecodeTransactionEventsParams): Promise<DecodedEvent<Abi, AbiEventName<Abi>>[]> {
    await this._provider.ensureInitialized();
    try {
      const { events } = await this._provider.rawApi.decodeTransactionEvents({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi,
      });

      const result: DecodedEvent<Abi, AbiEventName<Abi>>[] = [];

      for (const { event, data } of events) {
        const rawAbi = this._events[event];

        result.push({
          event,
          data: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, data) : {},
        } as DecodedEvent<Abi, AbiEventName<Abi>>);
      }

      return result;
    } catch (_) {
      return [];
    }
  }

  public async decodeInputMessage(args: DecodeInputParams<Abi>): Promise<DecodedInput<Abi, AbiFunctionName<Abi>> | undefined> {
    await this._provider.ensureInitialized();
    try {
      const result = await this._provider.rawApi.decodeInput({
        abi: this._abi,
        body: args.body,
        internal: args.internal,
        method: args.methods,
      });
      if (result == null) {
        return undefined;
      }

      const { method, input } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {},
      } as DecodedInput<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeOutputMessage(args: DecodeOutputParams<Abi>): Promise<DecodedOutput<Abi, AbiFunctionName<Abi>> | undefined> {
    await this._provider.ensureInitialized();
    try {
      const result = await this._provider.rawApi.decodeOutput({
        abi: this._abi,
        body: args.body,
        method: args.methods,
      });
      if (result == null) {
        return undefined;
      }

      const { method, output } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {},
      } as DecodedOutput<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeEvent(args: DecodeEventParams<Abi>): Promise<DecodedEvent<Abi, AbiEventName<Abi>> | undefined> {
    await this._provider.ensureInitialized();
    try {
      const result = await this._provider.rawApi.decodeEvent({
        abi: this.abi,
        body: args.body,
        event: args.events,
      });
      if (result == null) {
        return undefined;
      }

      const { event, data } = result;

      const rawAbi = this._events[event];

      return {
        event,
        data: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, data) : {},
      } as DecodedEvent<Abi, AbiEventName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }
}

/**
 * @category Contract
 */
export class TvmException extends Error {
  constructor(public readonly code: number) {
    super(`TvmException: ${code}`);
  }
}

/**
 * @category Contract
 */
export class MessageExpiredException extends Error {
  constructor(public readonly address: Address, public readonly hash: string) {
    super('Message expired');
  }
}

/**
 * @category Contract
 */
export type DelayedMessageExecution = {
  /**
   * External message hash
   */
  messageHash: string;
  /**
   * Message expiration timestamp
   */
  expireAt: number;
  /**
   * Transaction promise (it will be rejected if the message has expired)
   */
  transaction: Promise<Transaction>;
};

/**
 * @category Contract
 */
export type ContractMethods<C> = {
  [K in AbiFunctionName<C>]: (params: AbiFunctionInputs<C, K>) => ContractMethod<AbiFunctionInputs<C, K>, DecodedAbiFunctionOutputs<C, K>>;
}

/**
 * @category Contract
 */
export interface ContractMethod<I, O> {
  /**
   * Target contract address
   */
  readonly address: Address;
  readonly abi: string;
  readonly method: string;
  readonly params: I;

  /**
   * Sends internal message and returns wallet transaction
   *
   * @param args
   */
  send(args: SendInternalParams): Promise<Transaction>;

  /**
   * Sends internal message without waiting for the transaction
   *
   * @param args
   */
  sendDelayed(args: SendInternalParams): Promise<DelayedMessageExecution>;

  /**
   * Sends internal message and waits for the new transaction on target address
   *
   * @param args
   */
  sendWithResult(args: SendInternalParams): Promise<{ parentTransaction: Transaction, childTransaction: Transaction, output?: O }>;

  /**
   * Estimates wallet fee for calling this method as an internal message
   *
   * @param args
   */
  estimateFees(args: SendInternalParams): Promise<string>;

  /**
   * Sends external message and returns contract transaction with parsed output
   *
   * @param args
   */
  sendExternal(args: SendExternalParams): Promise<{ transaction: Transaction, output?: O }>;

  /**
   * Sends external message without waiting for the transaction
   *
   * @param args
   */
  sendExternalDelayed(args: SendExternalDelayedParams): Promise<DelayedMessageExecution>;

  /**
   * Runs message locally
   *
   * @param args
   */
  call(args?: CallParams): Promise<O>;

  /**
   * Encodes method call as BOC
   */
  encodeInternal(): Promise<string>;
}

class ContractMethodImpl implements ContractMethod<any, any> {
  readonly params: RawTokensObject;

  constructor(readonly provider: ProviderRpcClient,
              readonly functionAbi: { inputs: AbiParam[], outputs: AbiParam[] },
              readonly abi: string,
              readonly address: Address,
              readonly method: string,
              params: TokensObject) {
    this.params = serializeTokensObject(params);
  }

  async send(args: SendInternalParams): Promise<Transaction> {
    await this.provider.ensureInitialized();
    const { transaction } = await this.provider.rawApi.sendMessage({
      sender: args.from.toString(),
      recipient: this.address.toString(),
      amount: args.amount,
      bounce: args.bounce == null ? true : args.bounce,
      payload: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
    });
    return parseTransaction(transaction);
  }

  async sendDelayed(args: SendInternalParams): Promise<DelayedMessageExecution> {
    await this.provider.ensureInitialized();

    const transactions = new DelayedTransactions;

    const subscription = await this.provider.subscribe('messageStatusUpdated');
    subscription.on('data', (data) => {
      if (!data.address.equals(args.from)) {
        return;
      }
      transactions.fillTransaction(data.hash, data.transaction);
    });

    const { message } = await this.provider.rawApi.sendMessageDelayed({
      sender: args.from.toString(),
      recipient: this.address.toString(),
      amount: args.amount,
      bounce: args.bounce == null ? true : args.bounce,
      payload: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
    }).catch(e => {
      subscription.unsubscribe().catch(console.error);
      throw e;
    });

    const transaction = transactions
      .waitTransaction(this.address, message.hash)
      .finally(() => subscription.unsubscribe().catch(console.error));

    return {
      messageHash: message.hash,
      expireAt: message.expireAt,
      transaction,
    };
  }

  async sendWithResult(args: SendInternalWithResultParams): Promise<{ parentTransaction: Transaction, childTransaction: Transaction, output?: any }> {
    await this.provider.ensureInitialized();
    let subscriber = args.subscriber;
    const hasTempSubscriber = subscriber == null;
    if (subscriber == null) {
      subscriber = new this.provider.Subscriber();
    }

    try {
      // Parent transaction from wallet
      let parentTransaction: { transaction: Transaction, possibleMessages: Message[] } | undefined = undefined;

      // Child transaction promise
      let resolveChildTransactionPromise: ((transaction: Transaction) => void) | undefined;
      const childTransactionPromise = new Promise<Transaction>((resolve) => {
        resolveChildTransactionPromise = (tx) => resolve(tx);
      });

      // Array for collecting transactions on target before parent transaction promise resolution
      const possibleChildren: Transaction[] = [];

      // Subscribe to this account
      subscriber.transactions(this.address)
        .flatMap(batch => batch.transactions)
        // Listen only messages from sender
        .filter(item => item.inMessage.src?.equals(args.from) || false)
        .on((tx) => {
          if (parentTransaction == null) {
            // If we don't known whether the message was sent just collect all transactions from the sender
            possibleChildren.push(tx);
          } else if (parentTransaction.possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0) {
            // Resolve promise if transaction was found
            resolveChildTransactionPromise?.(tx);
          }
        });

      // Send message
      const transaction = await this.send(args);
      // Extract all outgoing messages from the parent transaction to this contract
      const possibleMessages = transaction.outMessages.filter(msg => msg.dst?.equals(this.address) || false);

      // Update stream state
      parentTransaction = {
        transaction,
        possibleMessages,
      };

      // Check whether child transaction was already found
      const alreadyReceived = possibleChildren.find((tx) => {
        return possibleMessages.findIndex((msg) => msg.hash == tx.inMessage.hash) >= 0;
      });
      if (alreadyReceived != null) {
        resolveChildTransactionPromise?.(alreadyReceived);
      }

      const childTransaction = await childTransactionPromise;

      // Parse output
      let output: any = undefined;
      try {
        const result = await this.provider.rawApi.decodeTransaction({
          transaction: serializeTransaction(childTransaction),
          abi: this.abi,
          method: this.method,
        });
        if (result != null) {
          output = this.functionAbi.outputs != null
            ? parseTokensObject(this.functionAbi.outputs, result.output)
            : {};
        }
      } catch (e) {
        console.error(e);
      }

      // Done
      return {
        parentTransaction: parentTransaction.transaction,
        childTransaction,
        output,
      };
    } finally {
      hasTempSubscriber && (await subscriber.unsubscribe());
    }
  }

  async estimateFees(args: SendInternalParams): Promise<string> {
    await this.provider.ensureInitialized();
    const { fees } = await this.provider.rawApi.estimateFees({
      sender: args.from.toString(),
      recipient: this.address.toString(),
      amount: args.amount,
      payload: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
    });
    return fees;
  }

  async sendExternal(args: SendExternalParams): Promise<{ transaction: Transaction, output?: any }> {
    await this.provider.ensureInitialized();
    const method = args.withoutSignature === true
      ? this.provider.rawApi.sendUnsignedExternalMessage
      : this.provider.rawApi.sendExternalMessage;

    const { transaction, output } = await method({
      publicKey: args.publicKey,
      recipient: this.address.toString(),
      stateInit: args.stateInit,
      payload: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
      local: args.local,
    });

    return {
      transaction: parseTransaction(transaction),
      output: output != null ? parseTokensObject(this.functionAbi.outputs, output) : undefined,
    };
  }

  async sendExternalDelayed(args: SendExternalDelayedParams): Promise<DelayedMessageExecution> {
    await this.provider.ensureInitialized();

    const transactions = new DelayedTransactions;

    const subscription = await this.provider.subscribe('messageStatusUpdated');
    subscription.on('data', (data) => {
      if (!data.address.equals(this.address)) {
        return;
      }
      transactions.fillTransaction(data.hash, data.transaction);
    });

    const { message } = await this.provider.rawApi.sendExternalMessageDelayed({
      publicKey: args.publicKey,
      recipient: this.address.toString(),
      stateInit: args.stateInit,
      payload: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
    }).catch(e => {
      subscription.unsubscribe().catch(console.error);
      throw e;
    });

    const transaction = transactions
      .waitTransaction(this.address, message.hash)
      .finally(() => subscription.unsubscribe().catch(console.error));

    return {
      messageHash: message.hash,
      expireAt: message.expireAt,
      transaction,
    };
  }

  async call(args: CallParams = {}): Promise<any> {
    await this.provider.ensureInitialized();
    const { output, code } = await this.provider.rawApi.runLocal({
      address: this.address.toString(),
      cachedState: args.cachedState,
      responsible: args.responsible,
      functionCall: {
        abi: this.abi,
        method: this.method,
        params: this.params,
      },
    });

    if (output == null || code != 0) {
      throw new TvmException(code);
    } else {
      return parseTokensObject(this.functionAbi.outputs, output);
    }
  }

  async encodeInternal(): Promise<string> {
    await this.provider.ensureInitialized();
    const { boc } = await this.provider.rawApi.encodeInternalInput({
      abi: this.abi,
      method: this.method,
      params: this.params,
    });
    return boc;
  }
}

class DelayedTransactions {
  private readonly transactions: Map<string, {
    promise: Promise<Transaction | undefined>,
    resolve: (transaction?: Transaction) => void,
    reject: () => void,
  }> = new Map();

  public async waitTransaction(address: Address, hash: string): Promise<Transaction> {
    let transaction = this.transactions.get(hash)?.promise;
    if (transaction == null) {
      let resolve: (transaction?: Transaction) => void;
      let reject: () => void;
      transaction = new Promise<Transaction | undefined>((promiseResolve, promiseReject) => {
        resolve = (tx) => promiseResolve(tx);
        reject = () => promiseReject();
      });
      this.transactions.set(hash, {
        promise: transaction,
        resolve: resolve!,
        reject: reject!,
      });
    }

    const tx = await transaction;
    if (tx == null) {
      throw new MessageExpiredException(address, hash);
    }
    return tx;
  }

  public fillTransaction(hash: string, transaction?: Transaction) {
    const pendingTransaction = this.transactions.get(hash);
    if (pendingTransaction != null) {
      pendingTransaction.resolve(transaction);
    } else {
      this.transactions.set(hash, {
        promise: Promise.resolve(transaction),
        resolve: () => { /* do nothing */
        },
        reject: () => { /* do nothing */
        },
      });
    }
  }
}

/**
 * @category Contract
 */
export type ContractFunction = { name: string, inputs?: AbiParam[], outputs?: AbiParam[] };

/**
 * @category Contract
 */
export type SendInternalParams = {
  from: Address;
  amount: string;
  /**
   * @default true
   */
  bounce?: boolean;
};

/**
 * @category Contract
 */
export type SendInternalWithResultParams = SendInternalParams & {
  /**
   * Existing subscriber
   */
  subscriber?: Subscriber;
};

/**
 * @category Contract
 */
export type SendExternalParams = {
  publicKey: string;
  stateInit?: string;
  /**
   * Whether to run this message locally. Default: false
   */
  local?: boolean;
  /**
   * Whether to prepare this message without signature. Default: false
   */
  withoutSignature?: boolean;
};

/**
 * @category Contract
 */
export type SendExternalDelayedParams = {
  publicKey: string;
  stateInit?: string;
};

/**
 * @category Contract
 */
export type CallParams = {
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
};

/**
 * @category Contract
 */
export type GetPastEventParams<Abi> = {
  filter?: EventsFilter<Abi, AbiEventName<Abi>>,
  range?: EventsRange,
  limit?: number,
  continuation?: TransactionId
}

/**
 * @category Contract
 */
export type WaitForEventParams<Abi> = {
  filter?: EventsFilter<Abi, AbiEventName<Abi>>,
  range?: EventsRange,
  subscriber?: Subscriber,
};

/**
 * @category Contract
 */
export type EventsBatch<Abi> = {
  events: DecodedEventWithTransaction<Abi, AbiEventName<Abi>>[],
  continuation?: TransactionId
}

/**
 * @category Contract
 */
export type EventsFilter<Abi, E extends AbiEventName<Abi> =
  AbiEventName<Abi>> = (event: DecodedEventWithTransaction<Abi, E>) => (Promise<boolean> | boolean);

/**
 * @category Contract
 */
export type DecodedEventWithTransaction<Abi, E extends AbiEventName<Abi>> =
  DecodedEvent<Abi, E> & { transaction: Transaction };

/**
 * @category Contract
 */
export type EventsRange = {
  fromLt?: string,
  fromUtime?: number,
  toLt?: string,
  toUtime?: number
}

/**
 * @category Contract
 */
export type DecodeTransactionParams<Abi> = {
  transaction: Transaction;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
};

/**
 * @category Contract
 */
export type DecodedTransaction<Abi, T> = T extends AbiFunctionName<Abi> ?
  { method: T, input: DecodedAbiFunctionInputs<Abi, T>, output: DecodedAbiFunctionOutputs<Abi, T> } : never;

/**
 * @category Contract
 */
export type DecodeInputParams<Abi> = {
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
  internal: boolean;
};

/**
 * @category Contract
 */
export type DecodedInput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, input: DecodedAbiFunctionInputs<Abi, T> } : never;

/**
 * @category Contract
 */
export type DecodeOutputParams<Abi> = {
  /**
   * Base64 encoded message body BOC
   */
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
};

/**
 * @category Contract
 */
export type DecodeEventParams<Abi> = {
  /**
   * Base64 encoded message body BOC
   */
  body: string;
  events: UniqueArray<AbiEventName<Abi>[]>;
}

/**
 * @category Contract
 */
export type DecodedOutput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, output: DecodedAbiFunctionOutputs<Abi, T> } : never;

/**
 * @category Contract
 */
export type DecodeTransactionEventsParams = {
  transaction: Transaction;
};

/**
 * @category Contract
 */
export type DecodedEvent<Abi, T> = T extends AbiEventName<Abi> ? { event: T, data: DecodedAbiEventData<Abi, T> } : never;
