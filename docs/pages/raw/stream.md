# Stream

## Class: Subscriber

### Table of contents

#### Constructors

- [constructor](classes/Subscriber.md#constructor)

#### Methods

- [transactions](classes/Subscriber.md#transactions)
- [trace](classes/Subscriber.md#trace)
- [oldTransactions](classes/Subscriber.md#oldtransactions)
- [states](classes/Subscriber.md#states)
- [unsubscribe](classes/Subscriber.md#unsubscribe)

## Constructors

### constructor

• **new Subscriber**(`provider`)

#### Parameters

| Name       | Type                                                |
| :--------- | :-------------------------------------------------- |
| `provider` | [`ProviderRpcClient`](classes/ProviderRpcClient.md) |

#### Defined in

[src/stream.ts:29](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L29)

## Methods

### transactions

▸ **transactions**(`address`): `IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `transactions`: [`Transaction`](../models.md#transaction)<[`Address`](classes/Address.md)\>[] ; `info`: [`TransactionsBatchInfo`](../models.md#tokenvalue) }, `false`\>

Returns a stream of new transactions

#### Parameters

| Name      | Type                            |
| :-------- | :------------------------------ |
| `address` | [`Address`](classes/Address.md) |

#### Returns

`IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `transactions`: [`Transaction`](../models.md#transaction)<[`Address`](classes/Address.md)\>[] ; `info`: [`TransactionsBatchInfo`](../models.md#tokenvalue) }, `false`\>

#### Defined in

[src/stream.ts:35](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L35)

---

### trace

▸ **trace**(`transaction`): `IdentityStream`<[`TransactionWithAccount`](../models.md#transactionwithaccount)<[`Address`](classes/Address.md)\>, `true`\>

Returns a finite stream of child transactions

#### Parameters

| Name          | Type                                                                        | Description      |
| :------------ | :-------------------------------------------------------------------------- | :--------------- |
| `transaction` | [`Transaction`](../models.md#transaction)<[`Address`](classes/Address.md)\> | root transaction |

#### Returns

`IdentityStream`<[`TransactionWithAccount`](../models.md#transactionwithaccount)<[`Address`](classes/Address.md)\>, `true`\>

#### Defined in

[src/stream.ts:43](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L43)

---

### oldTransactions

▸ **oldTransactions**(`address`, `filter?`): `IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `transactions`: [`Transaction`](../models.md#transaction)<[`Address`](classes/Address.md)\>[] ; `info`: [`TransactionsBatchInfo`](../models.md#tokenvalue) }, `true`\>

Returns a stream of old transactions

#### Parameters

| Name                | Type                            |
| :------------------ | :------------------------------ |
| `address`           | [`Address`](classes/Address.md) |
| `filter?`           | `Object`                        |
| `filter.fromLt?`    | `string`                        |
| `filter.fromUtime?` | `number`                        |

#### Returns

`IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `transactions`: [`Transaction`](../models.md#transaction)<[`Address`](classes/Address.md)\>[] ; `info`: [`TransactionsBatchInfo`](../models.md#tokenvalue) }, `true`\>

#### Defined in

[src/stream.ts:77](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L77)

---

### states

▸ **states**(`address`): `IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `state`: [`ContractState`](./interfaces/ContractState.md) }, `false`\>

#### Parameters

| Name      | Type                            |
| :-------- | :------------------------------ |
| `address` | [`Address`](classes/Address.md) |

#### Returns

`IdentityStream`<{ `address`: [`Address`](classes/Address.md) ; `state`: [`ContractState`](./interfaces/ContractState.md) }, `false`\>

#### Defined in

[src/stream.ts:112](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L112)

---

### unsubscribe

▸ **unsubscribe**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[src/stream.ts:116](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L116)
