import {
  AbiEventName, AbiEventParams,
  AbiFunctionName,
  AbiFunctionOutput,
  AbiFunctionParams,
  AbiParam,
  Address,
  ParsedTokensObject,
  UniqueArray,
  transformToParsedObject,
  transformToSerializedObject
} from './utils';
import { FullContractState, TokensObject, Transaction } from './models';

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
      readonly params: TokensObject;

      constructor(private readonly functionAbi: { inputs: AbiParam[], outputs: AbiParam[] }, readonly abi: string, readonly address: Address, readonly method: string, params: any) {
        this.params = transformToSerializedObject(params);
      }

      async send(args: ISendInternal): Promise<Transaction> {
        const { transaction } = await provider.api.sendMessage({
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
        return transaction;
      }

      async sendExternal(args: ISendExternal): Promise<{ transaction: Transaction, output?: any }> {
        let { transaction, output } = await provider.api.sendExternalMessage({
          publicKey: args.publicKey,
          recipient: this.address.toString(),
          stateInit: args.stateInit,
          payload: {
            abi: this.abi,
            method: this.method,
            params: this.params
          }
        });

        if (output != null) {
          (output as ParsedTokensObject) = transformToParsedObject(this.functionAbi.outputs, output);
        }

        return { transaction, output };
      }

      async call(args: ICall = {}): Promise<any> {
        let { output, code } = await provider.api.runLocal({
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
          (output as ParsedTokensObject) = transformToParsedObject(this.functionAbi.outputs, output);
          return output;
        }
      }
    }

    this._methods = new Proxy({}, {
      get: <K extends AbiFunctionName<Abi>>(_object: {}, method: K) => {
        const rawAbi = (this._functions as any)[method];
        return (params: AbiFunctionParams<Abi, K>) => new ContractMethod(rawAbi, this._abi, this._address, method, params);
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
      const result = await provider.api.decodeTransaction({
        transaction: args.transaction,
        abi: this._abi,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, input, output } = result;

      const rawAbi = (this._functions as any)[method];
      if (rawAbi.inputs != null) {
        (input as ParsedTokensObject) = transformToParsedObject(rawAbi.inputs, input);
      } else {
        (input as ParsedTokensObject) = {};
      }
      if (rawAbi.outputs != null) {
        (output as ParsedTokensObject) = transformToParsedObject(rawAbi.outputs, output);
      } else {
        (output as ParsedTokensObject) = {};
      }

      return { method, input, output } as any;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeTransactionEvents(args: IDecodeTransactionEvents): Promise<IDecodedEvent<Abi, AbiEventName<Abi>>[]> {
    try {
      const { events } = await provider.api.decodeTransactionEvents({
        transaction: args.transaction,
        abi: this._abi
      });

      for (let item of events) {
        let { event, data } = item;

        const rawAbi = (this._events as any)[event];
        if (rawAbi.inputs != null) {
          (item.data as ParsedTokensObject) = transformToParsedObject(rawAbi.inputs, data);
        } else {
          (item.data as ParsedTokensObject) = {};
        }
      }

      return events as any;
    } catch (e) {
      console.debug(e);
      return [];
    }
  }

  public async decodeInputMessage(args: IDecodeInput<Abi>): Promise<IDecodedInput<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await provider.api.decodeInput({
        abi: this._abi,
        body: args.body,
        internal: args.internal,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, input } = result;

      const rawAbi = (this._functions as any)[method];
      if (rawAbi.inputs != null) {
        (input as ParsedTokensObject) = transformToParsedObject(rawAbi.inputs, input);
      } else {
        (input as ParsedTokensObject) = {};
      }

      return { method, input } as any;
    } catch (_) {
      return undefined;
    }
  }

  public async decodeOutputMessage(args: IDecodeOutput<Abi>): Promise<IDecodedOutput<Abi, AbiFunctionName<Abi>> | undefined> {
    try {
      const result = await provider.api.decodeOutput({
        abi: this._abi,
        body: args.body,
        method: args.methods
      });
      if (result == null) {
        return undefined;
      }

      let { method, output } = result;

      const rawAbi = (this._functions as any)[method];
      if (rawAbi.outputs != null) {
        (output as ParsedTokensObject) = transformToParsedObject(rawAbi.outputs, output);
      } else {
        (output as ParsedTokensObject) = {};
      }

      return { method, output } as any;
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
  [K in AbiFunctionName<C>]: (params: AbiFunctionParams<C, K>) => IContractMethod<AbiFunctionParams<C, K>, AbiFunctionOutput<C, K>>
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

type IDecodedTransaction<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, input: AbiFunctionParams<Abi, T>, output: AbiFunctionOutput<Abi, T> } : never

interface IDecodeInput<Abi> {
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
  internal: boolean;
}

type IDecodedInput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, input: AbiFunctionParams<Abi, T> } : never

interface IDecodeOutput<Abi> {
  body: string;
  methods: UniqueArray<AbiFunctionName<Abi>[]>;
}

type IDecodedOutput<Abi, T> = T extends AbiFunctionName<Abi> ? { method: T, output: AbiFunctionOutput<Abi, T> } : never

interface IDecodeTransactionEvents {
  transaction: Transaction;
}

type IDecodedEvent<Abi, T> = T extends AbiEventName<Abi> ? { event: T, data: AbiEventParams<Abi, T> } : never
