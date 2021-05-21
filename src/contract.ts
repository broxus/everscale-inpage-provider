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

export class Contract<Abi> {
  private readonly _abi: string;
  private readonly _functions: { [name: string]: { inputs: AbiParam[], outputs: AbiParam[] } };
  private readonly _events: { [name: string]: { inputs: AbiParam[] } };
  private readonly _address: Address;
  private readonly _methods: IContractMethods<Abi>;

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

    class ContractMethod implements IContractMethod<any, any> {
      readonly params: RawTokensObject;

      constructor(private readonly functionAbi: { inputs: AbiParam[], outputs: AbiParam[] }, readonly abi: string, readonly address: Address, readonly method: string, params: TokensObject) {
        this.params = serializeTokensObject(params);
      }

      async send(args: ISendInternal): Promise<Transaction> {
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

      async sendExternal(args: ISendExternal): Promise<{ transaction: Transaction, output?: any }> {
        let { transaction, output } = await provider.rawApi.sendExternalMessage({
          publicKey: args.publicKey,
          recipient: this.address.toString(),
          stateInit: args.stateInit,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });

        return {
          transaction: parseTransaction(transaction),
          output: output != null ? parseTokensObject(this.functionAbi.outputs, output) : undefined
        };
      }

      async call(args: ICall = {}): Promise<any> {
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
        return (params: AbiFunctionInputs<Abi, K>) => new ContractMethod(rawAbi, this._abi, this._address, method, params);
      }
    }) as unknown as IContractMethods<Abi>;
  }

  public get methods() {
    return this._methods;
  }

  public get address() {
    return this._address;
  }

  public async decodeTransaction(args: IDecodeTransaction<Abi>): Promise<IDecodedTransaction<Abi, AbiFunctionName<Abi>> | undefined> {
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
      } as IDecodedTransaction<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeTransactionEvents(args: IDecodeTransactionEvents): Promise<IDecodedEvent<Abi, AbiEventName<Abi>>[]> {
    try {
      const { events } = await provider.rawApi.decodeTransactionEvents({
        transaction: serializeTransaction(args.transaction),
        abi: this._abi
      });

      const result: IDecodedEvent<Abi, AbiEventName<Abi>>[] = [];

      for (const { event, data } of events) {
        const rawAbi = this._events[event];

        result.push({
          event,
          data: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, data) : {}
        } as IDecodedEvent<Abi, AbiEventName<Abi>>);
      }

      return result;
    } catch (_) {
      return [];
    }
  }

  public async decodeInputMessage(args: IDecodeInput<Abi>): Promise<IDecodedInput<Abi, AbiFunctionName<Abi>> | undefined> {
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
      } as IDecodedInput<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeOutputMessage(args: IDecodeOutput<Abi>): Promise<IDecodedOutput<Abi, AbiFunctionName<Abi>> | undefined> {
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
      } as IDecodedOutput<Abi, AbiFunctionName<Abi>>;
    } catch (_) {
      return undefined;
    }
  }
}

export class TvmException extends Error {
  constructor(public readonly code: number) {
    super(`TvmException: ${code}`);
  }
}

interface IContractMethod<I, O> {
  /**
   * Target contract address
   */
  readonly address: Address
  readonly abi: string
  readonly method: string
  readonly params: I

  /**
   * Sends internal message and returns wallet transactions
   *
   * @param args
   */
  send(args: ISendInternal): Promise<Transaction>

  /**
   * Sends external message and returns contract transaction with parsed output
   *
   * @param args
   */
  sendExternal(args: ISendExternal): Promise<{ transaction: Transaction, output?: O }>

  /**
   * Runs message locally
   */
  call(args?: ICall): Promise<O>
}

type IContractMethods<C> = {
  [K in AbiFunctionName<C>]: (params: AbiFunctionInputs<C, K>) => IContractMethod<AbiFunctionInputs<C, K>, DecodedAbiFunctionOutputs<C, K>>
}

type ContractFunction = { name: string, inputs?: AbiParam[], outputs?: AbiParam[] }

interface ISendInternal {
  from: Address,
  amount: string,
  /**
   * @default true
   */
  bounce?: boolean,
}

interface ISendExternal {
  publicKey: string,
  stateInit?: string,
}

interface ICall {
  cachedState?: FullContractState;
}

interface IDecodeTransaction<Abi> {
  transaction: Transaction;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
}

type IDecodedTransaction<Abi, T> = T extends AbiFunctionName<Abi> ?
  { method: T, input: DecodedAbiFunctionInputs<Abi, T>, output: DecodedAbiFunctionOutputs<Abi, T> } : never;

interface IDecodeInput<Abi> {
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
  internal: boolean;
}

type IDecodedInput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, input: DecodedAbiFunctionInputs<Abi, T> } : never

interface IDecodeOutput<Abi> {
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
}

type IDecodedOutput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, output: DecodedAbiFunctionOutputs<Abi, T> } : never

interface IDecodeTransactionEvents {
  transaction: Transaction;
}

type IDecodedEvent<Abi, T> = T extends AbiEventName<Abi> ? { event: T, data: DecodedAbiEventData<Abi, T> } : never
