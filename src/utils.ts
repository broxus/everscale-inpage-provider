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
    : T extends TokenValueCell | TokenValueAddress | TokenValueBytes | TokenValuePublicKey ? string
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
type PickFunction<C, T extends AbiFunctionName<C>> = Extract<AbiFunction<C>, { name: T }>

export type AbiFunctionName<C> = AbiFunction<C>['name']
export type AbiFunctionParams<C, T extends AbiFunctionName<C>> = MergeObjectsArray<PickFunction<C, T>['inputs']>
export type AbiFunctionOutput<C, T extends AbiFunctionName<C>> = MergeObjectsArray<PickFunction<C, T>['outputs']>

export type IContract<C> = {
  [K in AbiFunctionName<C>]: (params: AbiFunctionParams<C, K>) => Promise<AbiFunctionOutput<C, K>>
}
