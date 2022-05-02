import {
  Address,
  UniqueArray,
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
  MergeOutputObjectsArray,
  TransactionId,
  serializeTokensObject,
  parseTransaction,
  parseTokensObject,
  serializeTransaction,
} from './models';
import { Subscriber } from './stream';
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

      async sendWithResult(args: SendInternalWithResultParams): Promise<{ parentTransaction: Transaction, childTransaction: Transaction, output?: any }> {
        let subscriber = args.subscriber;
        const hasTempSubscriber = subscriber == null;
        if (subscriber == null) {
          subscriber = new this.provider.Subscriber();
        }

        try {
          // Parent transaction from wallet
          let parentTransaction: { transaction: Transaction, possibleMessages: Message[] } | undefined;

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
        let method = args.withoutSignature === true
          ? this.provider.rawApi.sendUnsignedExternalMessage
          : this.provider.rawApi.sendExternalMessage;

        let { transaction, output } = await method({
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

      async call(args: CallParams = {}): Promise<any> {
        let { output, code } = await this.provider.rawApi.runLocal({
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
    }

    this._methods = new Proxy({}, {
      get: <K extends AbiFunctionName<Abi>>(_object: {}, method: K) => {
        const rawAbi = (this._functions as any)[method];
        return (params: AbiFunctionInputs<Abi, K>) => new ContractMethodImpl(
          this._provider, rawAbi, this._abi, this._address, method, params,
        );
      },
    }) as unknown as ContractMethods<Abi>;
  }

  public get methods() {
    return this._methods;
  }

  public get address() {
    return this._address;
  }

  public get abi(): string {
    return this._abi;
  }

  public async waitForEvent(args: WaitForEventParams<Abi> = {}): Promise<DecodedEvent<Abi, AbiEventName<Abi>> | undefined> {
    const { options, filter } = args;

    let subscriber = args.subscriber;
    const hasTempSubscriber = subscriber == null;
    if (subscriber == null) {
      subscriber = new this._provider.Subscriber();
    }

    const event = await (
      (options?.fromLt != null || options?.fromUtime != null)
        ? subscriber.oldTransactions(this._address, options)
          .merge(subscriber.transactions(this._address))
        : subscriber.transactions(this.address)
    ).flatMap(item => item.transactions)
      .takeWhile(item => options == null ||
        (options.fromLt == null || item.id.lt > options.fromLt) &&
        (options.fromUtime == null || item.createdAt > options.fromUtime) &&
        (options.toLt == null || item.id.lt < options.toLt) &&
        (options.toUtime == null || item.createdAt < options.toUtime),
      )
      .flatMap(tx => this.decodeTransactionEvents({ transaction: tx }))
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

  public async getPastEvents(args: GetPastEventParams<Abi>): Promise<EventsPaginatedResponse<Abi>> {
    let res_events: DecodedEvent<Abi, AbiEventName<Abi>>[] = [];
    let new_offset: TransactionId | undefined;
    let cur_offset = args?.offset;
    let continue_iteration = true;
    while (continue_iteration) {
      const { transactions, continuation } = await this._provider.getTransactions({
        address: this._address,
        continuation: cur_offset,
      });

      if (transactions.length === null) {
        break;
      }

      const fromFilteredTransactions = transactions.filter((item) => (
        (args?.options?.fromLt == null || item.id.lt > args?.options?.fromLt) &&
        (args?.options?.fromUtime == null || item.createdAt > args?.options?.fromUtime)
      ));

      if (fromFilteredTransactions.length == 0) {
        break;
      }

      const toFilteredTransactions = fromFilteredTransactions.filter((item) => (
        (args?.options?.toLt == null || item.id.lt < args?.options?.toLt) &&
        (args?.options?.toUtime == null || item.createdAt < args?.options?.toUtime)
      ));

      if (toFilteredTransactions.length > 0) {
        const events_tx_list = await Promise.all(toFilteredTransactions.map(async tx => {
          const _events = await this.decodeTransactionEvents({ transaction: tx });
          return { tx: tx, events: _events };
        }));

        for (const { tx, events } of events_tx_list) {
          const filtered_events = events.filter(event => {
            if (args?.filters) {
              let matched = false;
              for (const filter of args.filters) {
                let filter_match = true;
                if (filter.name !== event.event) {
                  continue;
                }
                if (filter?.params) {
                  for (const [key, value] of Object.entries(filter.params)) {
                    const event_param_name = key as keyof MergeOutputObjectsArray<any>;
                    if (event.data[event_param_name] != value) {
                      filter_match = false;
                      break;
                    }
                  }
                }
                matched = matched || filter_match;
              }
              return matched;
            }
            return true;
          });

          for (const event of filtered_events) {
            if (args?.limit && res_events.length === args.limit) {
              continue_iteration = false;
              break;
            }
            res_events.push(event);
          }

          if (!continue_iteration) {
            new_offset = tx.id;
            break;
          }
        }
      }

      if (continuation != null) {
        cur_offset = continuation;
      } else {
        break;
      }
    }

    return { events: res_events, offset: new_offset };
  }

  public async decodeTransaction(args: DecodeTransactionParams<Abi>): Promise<DecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await this._provider.rawApi.decodeTransaction({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi,
        method: args.methods,
      });
      if (result == null) {
        return undefined;
      }

      let { method, input, output } = result;

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

      let { method, input } = result;

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
    try {
      const result = await this._provider.rawApi.decodeOutput({
        abi: this._abi,
        body: args.body,
        method: args.methods,
      });
      if (result == null) {
        return undefined;
      }

      let { method, output } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {},
      } as DecodedOutput<Abi, AbiFunctionName<Abi>>;
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
export interface ContractMethod<I, O> {
  /**
   * Target contract address
   */
  readonly address: Address;
  readonly abi: string;
  readonly method: string;
  readonly params: I;

  /**
   * Sends internal message and returns wallet transactions
   *
   * @param args
   */
  send(args: SendInternalParams): Promise<Transaction>;

  /**
   * Sends internal message and waits for the new transaction on target address
   *
   * @param args
   */
  sendWithResult(args: SendInternalParams): Promise<{ parentTransaction: Transaction, childTransaction: Transaction, output?: O }>;

  /**
   * Estimates wallet fee for calling this method as an internal message
   */
  estimateFees(args: SendInternalParams): Promise<string>;

  /**
   * Sends external message and returns contract transaction with parsed output
   *
   * @param args
   */
  sendExternal(args: SendExternalParams): Promise<{ transaction: Transaction, output?: O }>;

  /**
   * Runs message locally
   */
  call(args?: CallParams): Promise<O>;
}

/**
 * @category Contract
 */
export type ContractMethods<C> = {
  [K in AbiFunctionName<C>]: (params: AbiFunctionInputs<C, K>) => ContractMethod<AbiFunctionInputs<C, K>, DecodedAbiFunctionOutputs<C, K>>;
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
export type EventsFilter<Abi, E extends AbiEventName<Abi> =
  AbiEventName<Abi>> = (event: DecodedEvent<Abi, E>) => (Promise<boolean> | boolean);

/**
 * @category Contract
 */
export type EventFilterOptions = {
  fromLt?: string,
  fromUtime?: number,
  toLt?: string,
  toUtime?: number
}

/**
 * @category Contract
 */
export type GetPastEventParams<Abi> = {
  filters?: EventsFilter<Abi, AbiEventName<Abi>>[],
  options?: EventFilterOptions,
  limit?: number,
  continuation?: TransactionId
}

/**
 * @category Contract
 */
export type EventsPaginatedResponse<Abi> = {
  events: DecodedEvent<Abi, AbiEventName<Abi>>[],
  continuation?: TransactionId
}

/**
 * @category Contract
 */
export type WaitForEventParams<Abi> = {
  filter?: EventsFilter<Abi>,
  options?: EventFilterOptions,
  subscriber?: Subscriber,
};

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
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
};

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
