import { Address, ArrayItemType } from './utils';

/* Account stuff */

/**
 * @category Models
 */
export interface ContractState {
  balance: string;
  genTimings: GenTimings;
  lastTransactionId?: LastTransactionId;
  isDeployed: boolean;
}

/**
 * @category Models
 */
export interface FullContractState extends ContractState {
  boc: string;
}

/**
 * @category Models
 */
export type GenTimings = {
  genLt: string;
  genUtime: number;
};

/**
 * @category Models
 */
export type WalletContractType =
  | 'SafeMultisigWallet'
  | 'SafeMultisigWallet24h'
  | 'SetcodeMultisigWallet'
  | 'SurfWallet'
  | 'WalletV3';

/**
 * @category Models
 */
export type ContractUpdatesSubscription = {
  /**
   * Whether to listen contract state updates
   */
  state: boolean;
  /**
   * Whether to listen new contract transactions
   */
  transactions: boolean;
};

/**
 * @category Models
 */
export type TransactionsBatchInfo = {
  minLt: string;
  maxLt: string;
  batchType: TransactionsBatchType;
};

/**
 * @category Models
 */
export type TransactionsBatchType = 'old' | 'new';

/**
 * @category Models
 */
export type Transaction<Addr = Address> = {
  id: TransactionId;
  prevTransactionId?: TransactionId;
  createdAt: number;
  aborted: boolean;
  exitCode?: number;
  origStatus: AccountStatus;
  endStatus: AccountStatus;
  totalFees: string;
  inMessage: Message<Addr>;
  outMessages: Message<Addr>[];
};

/**
 * @category Models
 */
export type RawTransaction = Transaction<string>;

/**
 * @category Models
 */
export function serializeTransaction(transaction: Transaction): RawTransaction {
  return {
    ...transaction,
    inMessage: serializeMessage(transaction.inMessage),
    outMessages: transaction.outMessages.map(serializeMessage)
  };
}

/**
 * @category Models
 */
export function parseTransaction(transaction: RawTransaction): Transaction {
  return {
    ...transaction,
    inMessage: parseMessage(transaction.inMessage),
    outMessages: transaction.outMessages.map(parseMessage)
  };
}

/**
 * @category Models
 */
export type Message<Addr = Address> = {
  src?: Addr;
  dst?: Addr;
  value: string;
  bounce: boolean;
  bounced: boolean;
  body?: string;
  bodyHash?: string;
};

/**
 * @category Models
 */
export type RawMessage = Message<string>;

/**
 * @category Models
 */
export function serializeMessage(message: Message): RawMessage {
  return {
    ...message,
    src: message.src ? message.src.toString() : undefined,
    dst: message.dst ? message.dst.toString() : undefined
  };
}

/**
 * @category Models
 */
export function parseMessage(message: RawMessage): Message {
  return {
    ...message,
    src: message.src ? new Address(message.src) : undefined,
    dst: message.dst ? new Address(message.dst) : undefined
  };
}

/**
 * @category Models
 */
export type AccountStatus = 'uninit' | 'frozen' | 'active' | 'nonexist';

/**
 * @category Models
 */
export type LastTransactionId = {
  isExact: boolean;
  lt: string;
  hash?: string;
};

/**
 * @category Models
 */
export type TransactionId = {
  lt: string;
  hash: string;
};

/* Permissions stuff */

/**
 * @category Models
 */
export type Permissions<Addr = Address> = {
  tonClient: true;
  accountInteraction: {
    address: Addr;
    publicKey: string;
    contractType: WalletContractType;
  }
};

/**
 * @category Models
 */
export type RawPermissions = Permissions<string>;

/**
 * @category Models
 */
export function parsePermissions(permissions: Partial<RawPermissions>): Partial<Permissions> {
  return {
    ...permissions,
    accountInteraction: permissions.accountInteraction ? parseAccountInteraction(permissions.accountInteraction) : undefined
  };
}

/**
 * @category Models
 */
export function parseAccountInteraction(accountInteraction: Required<RawPermissions>['accountInteraction']): Required<Permissions>['accountInteraction'] {
  return {
    ...accountInteraction,
    address: new Address(accountInteraction.address)
  };
}

/**
 * @category Models
 */
export type Permission = keyof Permissions;

/**
 * @category Models
 */
export type PermissionData<T extends Permission, Addr = Address> = Permissions<Addr>[T];

/* ABI stuff */

/**
 * @category Models
 */
export type SignedMessage = {
  bodyHash: string;
  expireAt: number;
  boc: string;
};

/**
 * @category Models
 */
export type TokenValue<Addr = Address> =
  | boolean
  | string
  | number
  | Addr
  | { [K in string]: TokenValue<Addr> }
  | TokenValue<Addr>[]
  | (readonly [TokenValue<Addr>, TokenValue<Addr>])[];

/**
 * @category Models
 */
export type RawTokenValue = TokenValue<string>;

/**
 * @category Models
 */
export type TokensObject<Addr = Address> = { [K in string]: TokenValue<Addr> };

/**
 * @category Models
 */
export type RawTokensObject = TokensObject<string>;

/**
 * @category Models
 */
export type FunctionCall<Addr = Address> = {
  /**
   * Contract ABI
   */
  abi: string;
  /**
   * Specific method from specified contract ABI
   */
  method: string;
  /**
   * Method arguments
   */
  params: TokensObject<Addr>;
}

/**
 * @category Models
 */
export type RawFunctionCall = FunctionCall<string>;

type AbiParamKindUint = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint160' | 'uint256';
type AbiParamKindInt = 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'int160' | 'int256';
type AbiParamKindTuple = 'tuple';
type AbiParamKindBool = 'bool';
type AbiParamKindCell = 'cell';
type AbiParamKindAddress = 'address';
type AbiParamKindBytes = 'bytes';
type AbiParamKindString = 'string';
type AbiParamKindGram = 'gram';
type AbiParamKindTime = 'time';
type AbiParamKindExpire = 'expire';
type AbiParamKindPublicKey = 'pubkey';
type AbiParamKindArray = `${AbiParamKind}[]`;

type AbiParamKindMap = `map(${AbiParamKindInt | AbiParamKindUint | AbiParamKindAddress},${AbiParamKind | `${AbiParamKind}[]`})`;

/**
 * @category Models
 */
export type AbiParamKind =
  | AbiParamKindUint
  | AbiParamKindInt
  | AbiParamKindTuple
  | AbiParamKindBool
  | AbiParamKindCell
  | AbiParamKindAddress
  | AbiParamKindBytes
  | AbiParamKindString
  | AbiParamKindGram
  | AbiParamKindTime
  | AbiParamKindExpire
  | AbiParamKindPublicKey;

/**
 * @category Models
 */
export type AbiParam = {
  name: string;
  type: AbiParamKind | AbiParamKindMap | AbiParamKindArray;
  components?: AbiParam[];
};

/**
 * @category Models
 */
export type ReadonlyAbiParam = {
  name: string;
  type: AbiParamKind | AbiParamKindMap | AbiParamKindArray;
  components?: readonly ReadonlyAbiParam[];
}

/**
 * @category Models
 */
export function serializeTokensObject(object: TokensObject): RawTokensObject {
  return serializeTokenValue(object as TokenValue) as RawTokensObject;
}

function serializeTokenValue(token: TokenValue): RawTokenValue {
  if (token instanceof Address) {
    return token.toString();
  }

  if (Array.isArray(token)) {
    const result: RawTokenValue[] = [];
    for (const item of token as TokenValue[]) {
      result.push(serializeTokenValue(item));
    }
    return result;
  } else if (typeof token === 'object') {
    const result: { [name: string]: RawTokenValue } = {};
    for (const [key, value] of Object.entries(token)) {
      result[key] = serializeTokenValue(value);
    }
    return result;
  } else {
    return token;
  }
}

/**
 * @category Models
 */
export function parseTokensObject(params: AbiParam[], object: RawTokensObject): TokensObject {
  const result: TokensObject = {};
  for (const param of params) {
    result[param.name] = parseTokenValue(param, object[param.name]);
  }
  return result;
}

function parseTokenValue(param: AbiParam, token: RawTokenValue): TokenValue {
  if (!param.type.startsWith('map')) {
    const rawType = (param.type.endsWith('[]') ? param.type.slice(0, -2) : param.type) as AbiParamKind;
    const isArray = rawType != param.type;

    if (isArray) {
      const rawParam = { name: param.name, type: rawType, components: param.components } as AbiParam;

      const result: TokenValue[] = [];
      for (const item of token as TokenValue<string>[]) {
        result.push(parseTokenValue(rawParam, item));
      }
      return result;
    } else if (rawType == 'tuple') {
      type TokenValueTuple<Addr> = { [K in string]: TokenValue<Addr> };

      const result: TokenValueTuple<Address> = {};
      if (param.components != null) {
        for (const component of param.components) {
          result[component.name] = parseTokenValue(component, (token as TokenValueTuple<string>)[component.name]);
        }
      }
      return result;
    } else if (rawType == 'address') {
      return new Address(token as string) as TokenValue;
    } else {
      return token;
    }
  } else {
    type TokenValueMap<Addr> = (readonly [TokenValue<Addr>, TokenValue<Addr>])[];

    let [keyType, valueType] = param.type.split(',');
    keyType = keyType.slice(4);
    valueType = valueType.slice(0, -1);

    const result: TokenValueMap<Address> = [];
    for (const [key, value] of token as unknown as TokenValueMap<string>) {
      result.push([parseTokenValue({
        name: '',
        type: keyType as AbiParamKind
      }, key), parseTokenValue({
        name: '',
        type: valueType as AbiParamKind
      }, value)]);
    }
    return result;
  }
}

/**
 * @category Models
 */
export type HeadersObject = {
  pubkey?: string;
  expire?: string | number;
  time?: string | number;
};

type InputTokenValue<T, C> =
  T extends AbiParamKindUint | AbiParamKindInt | AbiParamKindGram | AbiParamKindTime | AbiParamKindExpire ? string | number
    : T extends AbiParamKindBool ? boolean
      : T extends AbiParamKindCell | AbiParamKindBytes | AbiParamKindString | AbiParamKindPublicKey ? string
        : T extends AbiParamKindAddress ? Address
          : T extends AbiParamKindTuple ? MergeInputObjectsArray<C>
            : T extends `${infer K}[]` ? InputTokenValue<K, C>[]
              : T extends `map(${infer K},${infer V})` ? (readonly [InputTokenValue<K, undefined>, InputTokenValue<V, C>])[]
                : never;

type OutputTokenValue<T, C> =
  T extends AbiParamKindUint | AbiParamKindInt | AbiParamKindGram | AbiParamKindTime | AbiParamKindCell | AbiParamKindBytes | AbiParamKindString | AbiParamKindPublicKey ? string
    : T extends AbiParamKindExpire ? number
      : T extends AbiParamKindBool ? boolean
        : T extends AbiParamKindAddress ? Address
          : T extends AbiParamKindTuple ? MergeOutputObjectsArray<C>
            : T extends `${infer K}[]` ? OutputTokenValue<K, C>[]
              : T extends `map(${infer K},${infer V})` ? (readonly [OutputTokenValue<K, undefined>, OutputTokenValue<V, C>])[]
                : never;

/**
 * @category Models
 */
export type InputTokenObject<O> = O extends { name: infer K, type: infer T, components?: infer C } ?
  K extends string ? { [P in K]: InputTokenValue<T, C> } : never : never;

/**
 * @category Models
 */
export type OutputTokenObject<O> = O extends { name: infer K, type: infer T, components?: infer C } ?
  K extends string ? { [P in K]: OutputTokenValue<T, C> } : never : never;

/**
 * @category Models
 */
export type MergeInputObjectsArray<A> =
  A extends readonly [infer T, ...infer Ts]
    ? (InputTokenObject<T> & MergeInputObjectsArray<[...Ts]>)
    : A extends readonly [infer T] ? InputTokenObject<T> : A extends readonly [] ? {} : never;

/**
 * @category Models
 */
export type MergeOutputObjectsArray<A> =
  A extends readonly [infer T, ...infer Ts]
    ? (OutputTokenObject<T> & MergeOutputObjectsArray<[...Ts]>)
    : A extends readonly [infer T] ? OutputTokenObject<T> : A extends readonly [] ? {} : never;

type AbiFunction<C> = C extends { functions: infer F } ? F extends readonly unknown[] ? ArrayItemType<F> : never : never;
type AbiEvent<C> = C extends { events: infer E } ? E extends readonly unknown[] ? ArrayItemType<E> : never : never;

/**
 * @category Models
 */
export type AbiFunctionName<C> = AbiFunction<C>['name'];
/**
 * @category Models
 */
export type AbiEventName<C> = AbiEvent<C>['name'];

type PickFunction<C, T extends AbiFunctionName<C>> = Extract<AbiFunction<C>, { name: T }>;
type PickEvent<C, T extends AbiEventName<C>> = Extract<AbiEvent<C>, { name: T }>;

/**
 * @category Models
 */
export type AbiFunctionInputs<C, T extends AbiFunctionName<C>> = MergeInputObjectsArray<PickFunction<C, T>['inputs']>;

/**
 * @category Models
 */
export type DecodedAbiFunctionInputs<C, T extends AbiFunctionName<C>> = MergeOutputObjectsArray<PickFunction<C, T>['inputs']>;
/**
 * @category Models
 */
export type DecodedAbiFunctionOutputs<C, T extends AbiFunctionName<C>> = MergeOutputObjectsArray<PickFunction<C, T>['outputs']>;
/**
 * @category Models
 */
export type DecodedAbiEventData<C, T extends AbiEventName<C>> = MergeOutputObjectsArray<PickEvent<C, T>['inputs']>;
