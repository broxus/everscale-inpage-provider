import {
  Address,
  UniqueArray
} from './utils';
import {
  AbiParam,
  FullContractState,
  RawTokensObject,
  TokensObject,
  Transaction,
  AbiFunctionName,
  AbiEventName,
  AbiFunctionInputs,
  DecodedAbiFunctionOutputs,
  DecodedAbiFunctionInputs,
  DecodedAbiEventData,
  serializeTokensObject,
  parseTransaction,
  parseTokensObject,
  serializeTransaction
} from './models';

import provider from './index';

/**
 * @category Contract
 */
export class Contract<Abi> {
  private readonly _abi: string;
  private readonly _functions: { [name: string]: { inputs: AbiParam[], outputs: AbiParam[] } };
  private readonly _events: { [name: string]: { inputs: AbiParam[] } };
  private readonly _address: Address;
  private readonly _methods: ContractMethods<Abi>;

  constructor(abi: Abi, address: Address) {
    if (!Array.isArray((abi as any).functions)) {
      throw new Error('Invalid abi. Functions array required');
    }
    if (!Array.isArray((abi as any).events)) {
      throw new Error('Invalid abi. Events array required');
    }

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

      constructor(private readonly functionAbi: { inputs: AbiParam[], outputs: AbiParam[] }, readonly abi: string, readonly address: Address, readonly method: string, params: TokensObject) {
        this.params = serializeTokensObject(params);
      }

      async send(args: SendInternalParams): Promise<Transaction> {
        const { transaction } = await provider.rawApi.sendMessage({
          sender: args.from.toString(),
          recipient: this.address.toString(),
          amount: args.amount,
          bounce: args.bounce == null ? true : args.bounce,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });
        return parseTransaction(transaction);
      }

      async estimateFees(args: SendInternalParams): Promise<string> {
        const { fees } = await provider.rawApi.estimateFees({
          sender: args.from.toString(),
          recipient: this.address.toString(),
          amount: args.amount,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });
        return fees;
      }

      async sendExternal(args: SendExternalParams): Promise<{ transaction: Transaction, output?: any }> {
        let method = args.withoutSignature === true ? provider.rawApi.sendUnsignedExternalMessage : provider.rawApi.sendExternalMessage

        let { transaction, output } = await method({
          publicKey: args.publicKey,
          recipient: this.address.toString(),
          stateInit: args.stateInit,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          },
          local: args.local
        });

        return {
          transaction: parseTransaction(transaction),
          output: output != null ? parseTokensObject(this.functionAbi.outputs, output) : undefined
        };
      }

      async call(args: CallParams = {}): Promise<any> {
        let { output, code } = await provider.rawApi.runLocal({
          address: this.address.toString(),
          cachedState: args.cachedState,
          functionCall: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
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
        return (params: AbiFunctionInputs<Abi, K>) => new ContractMethodImpl(rawAbi, this._abi, this._address, method, params);
      }
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

  public async decodeTransaction(args: DecodeTransactionParams<Abi>): Promise<DecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await provider.rawApi.decodeTransaction({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, input, output } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {},
        output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {}
      } as DecodedTransaction<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeTransactionEvents(args: DecodeTransactionEventsParams): Promise<DecodedEvent<Abi, AbiEventName<Abi>>[]> {
    try {
      const { events } = await provider.rawApi.decodeTransactionEvents({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi
      });

      const result: DecodedEvent<Abi, AbiEventName<Abi>>[] = [];

      for (const { event, data } of events) {
        const rawAbi = this._events[event];

        result.push({
          event,
          data: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, data) : {}
        } as DecodedEvent<Abi, AbiEventName<Abi>>);
      }

      return result;
    } catch (_) {
      return [];
    }
  }

  public async decodeInputMessage(args: DecodeInputParams<Abi>): Promise<DecodedInput<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await provider.rawApi.decodeInput({
        abi: this._abi,
        body: args.body,
        internal: args.internal,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, input } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {}
      } as DecodedInput<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeOutputMessage(args: DecodeOutputParams<Abi>): Promise<DecodedOutput<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await provider.rawApi.decodeOutput({
        abi: this._abi,
        body: args.body,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, output } = result;

      const rawAbi = this._functions[method];

      return {
        method,
        output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {}
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
  cachedState?: FullContractState;
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
