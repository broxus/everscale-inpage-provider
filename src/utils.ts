import { AbiToken, TokensObject } from './models';

export type UniqueArray<T> = T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? ['Encountered value with duplicates:', X]
    : readonly [X, ...UniqueArray<Rest>]
  : T

export type InArray<T, X> = T extends readonly [X, ...infer _Rest]
  ? true
  : T extends readonly [X]
    ? true
    : T extends readonly [infer _, ...infer Rest]
      ? InArray<Rest, X>
      : false

type ArrayItemType<T extends readonly unknown[]> = T extends readonly (infer Ts)[] ? Ts : never;

type TokenValueUint = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256'
type TokenValueInt = 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'int256'
type TokenValueTuple = 'tuple'
type TokenValueBool = 'bool'
type TokenValueCell = 'cell'
type TokenValueAddress = 'address'
type TokenValueBytes = 'bytes'
type TokenValueGram = 'gram'
type TokenValueTime = 'time'
type TokenValueExpire = 'expire'
type TokenValuePublicKey = 'pubkey'

type TokenValue<T, C> =
  T extends TokenValueUint | TokenValueInt | TokenValueGram | TokenValueTime | TokenValueExpire ? string | number
    : T extends TokenValueBool ? boolean
    : T extends TokenValueCell | TokenValueBytes | TokenValuePublicKey ? string
      : T extends TokenValueAddress ? Address
        : T extends TokenValueTuple ? MergeObjectsArray<C>
          : T extends `${infer K}[]` ? TokenValue<K, C>[]
            : T extends `map(${infer K},${infer V})` ? (readonly [TokenValue<K, undefined>, TokenValue<V, C>])[]
              : never

type TokenObject<O> = O extends { name: infer K, type: infer T, components?: infer C } ? K extends string ? { [P in K]: TokenValue<T, C> } : never : never
type MergeObjectsArray<A> =
  A extends readonly [infer T, ...infer Ts]
    ? (TokenObject<T> & MergeObjectsArray<[...Ts]>)
    : A extends readonly [infer T] ? TokenObject<T> : A extends readonly [] ? {} : never

type AbiFunction<C> = C extends { functions: infer F } ? F extends readonly unknown[] ? ArrayItemType<F> : never : never
export type AbiFunctionName<C> = AbiFunction<C>['name']

type PickFunction<C, T extends AbiFunctionName<C>> = Extract<AbiFunction<C>, { name: T }>
export type AbiFunctionParams<C, T extends AbiFunctionName<C>> = MergeObjectsArray<PickFunction<C, T>['inputs']>
export type AbiFunctionOutput<C, T extends AbiFunctionName<C>> = MergeObjectsArray<PickFunction<C, T>['outputs']>

type AbiEvent<C> = C extends { events: infer E } ? E extends readonly unknown[] ? ArrayItemType<E> : never : never
export type AbiEventName<C> = AbiEvent<C>['name']

type PickEvent<C, T extends AbiEventName<C>> = Extract<AbiEvent<C>, { name: T }>
export type AbiEventParams<C, T extends AbiEventName<C>> = MergeObjectsArray<PickEvent<C, T>['inputs']>

export class Address {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  public toString(): string {
    return this._address;
  }
}

export class AddressLiteral<T extends string> extends Address {
  constructor(address: CheckAddress<T>) {
    super(address);
  }
}

type CheckAddress<T extends string> = AddressImpl<T, Lowercase<T>>;

type AddressPrefix = '0:' | '-1:'
type AddressImpl<T, Tl extends string> = Tl extends `${AddressPrefix}${infer Hash}`
  ? true extends IsHexString<Hash, []>
    ? T : never
  : never;

type HexSymbol = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
type HexByte = `${HexSymbol}${HexSymbol}`
type IsHexString<T extends string, L extends readonly number[]> =
  T extends `${HexByte}${infer Tail}`
    ? IsHexString<Tail, [...L, 0]>
    : T extends '' ? L['length'] extends 32 ? true : never : never

type AbiParamKind =
  | TokenValueUint
  | TokenValueInt
  | TokenValueTuple
  | TokenValueBool
  | TokenValueCell
  | TokenValueAddress
  | TokenValueBytes
  | TokenValueGram
  | TokenValueTime
  | TokenValueExpire
  | TokenValuePublicKey

type AbiParamArray = `${AbiParamKind}[]`

type AbiParamMapping = `map(${TokenValueUint | TokenValueInt | TokenValueAddress},${AbiParamKind | `${AbiParamKind}[]`})`

export type AbiParam = {
  name: string,
  type: AbiParamKind | AbiParamArray | AbiParamMapping,
  components?: AbiParam[]
}

export type ParsedAbiToken =
  | boolean
  | string
  | number
  | Address
  | { [K in string]: ParsedAbiToken }
  | ParsedAbiToken[]
  | (readonly [ParsedAbiToken, ParsedAbiToken])[];

export type ParsedTokensObject = { [K in string]: ParsedAbiToken }

export function transformToParsedObject(params: AbiParam[], object: TokensObject): ParsedTokensObject {
  params.forEach((param) => {
    (object as ParsedTokensObject)[param.name] = parseToken(param, object[param.name]);
  });
  return object;
}

function parseToken(param: AbiParam, token: AbiToken): ParsedAbiToken {
  if (param.type.startsWith('map')) {
    let [keyType, valueType] = param.type.split(',');
    keyType = keyType.slice(4);
    valueType = valueType.slice(0, -1);

    (token as (readonly [AbiToken, AbiToken])[]).forEach(([key, value], i) => {
      (token as (readonly [ParsedAbiToken, ParsedAbiToken])[])[i] = [parseToken({
        name: '',
        type: keyType as AbiParamKind
      }, key), parseToken({
        name: '',
        type: valueType as AbiParamKind,
        components: param.components
      }, value)];
    });

    return token as ParsedAbiToken;
  } else {
    const rawType = param.type.endsWith('[]') ? param.type.slice(0, -2) : param.type;
    const isArray = rawType != param.type;

    if (isArray) {
      const rawParam = { name: param.name, type: rawType, components: param.components } as AbiParam;

      (token as AbiToken[]).forEach((item, i) => {
        (token as ParsedAbiToken[])[i] = parseToken(rawParam, item);
      });

      return token as ParsedAbiToken;
    } else if (rawType == 'tuple') {
      param.components?.forEach((itemParam) => {
        const tupleItem = (token as { [K in string]: AbiToken })[itemParam.name];
        (token as { [K in string]: ParsedAbiToken })[itemParam.name] = parseToken(itemParam, tupleItem);
      });

      return token as ParsedAbiToken;
    } else if (rawType == 'address') {
      return new Address(token as string);
    } else {
      return token as ParsedAbiToken;
    }
  }
}

export function transformToSerializedObject(object: ParsedTokensObject): TokensObject {
  return serializeToken(object) as TokensObject;
}

function serializeToken(token: ParsedAbiToken): AbiToken {
  // custom types go first
  if (token instanceof Address) {
    return token.toString();
  }

  if (Array.isArray(token)) {
    (token as ParsedAbiToken[]).forEach((value, i) => {
      (token as AbiToken[])[i] = serializeToken(value);
    });
    return token as AbiToken;
  } else if (typeof token === 'object') {
    Object.keys(token).forEach((key) => {
      token[key] = serializeToken(token[key]);
    });
    return token as AbiToken;
  } else {
    return token as AbiToken;
  }
}

const MAX = 4294967295;

let idCounter = Math.floor(Math.random() * MAX);

export function getUniqueId(): number {
  idCounter = (idCounter + 1) % MAX;
  return idCounter;
}
