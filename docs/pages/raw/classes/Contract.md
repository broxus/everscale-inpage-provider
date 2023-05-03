[everscale-inpage-provider - v0.3.57](../README.md) / Contract

# Class: Contract<Abi\>

## Type parameters

| Name  |
| :---- |
| `Abi` |

## Table of contents

### Constructors

- [constructor](Contract.md#constructor)

### Accessors

- [methods](Contract.md#methods)
- [fields](Contract.md#fields)
- [address](Contract.md#address)
- [abi](Contract.md#abi)

### Methods

- [getFullState](Contract.md#getfullstate)
- [getFields](Contract.md#getfields)
- [transactions](Contract.md#transactions)
- [events](Contract.md#events)
- [waitForEvent](Contract.md#waitforevent)
- [getPastEvents](Contract.md#getpastevents)
- [decodeTransaction](Contract.md#decodetransaction)
- [decodeTransactionEvents](Contract.md#decodetransactionevents)
- [decodeInputMessage](Contract.md#decodeinputmessage)
- [decodeOutputMessage](Contract.md#decodeoutputmessage)
- [decodeEvent](Contract.md#decodeevent)

## Constructors

### constructor

• **new Contract**<`Abi`\>(`provider`, `abi`, `address`)

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Parameters

| Name       | Type                                        |
| :--------- | :------------------------------------------ |
| `provider` | [`ProviderRpcClient`](ProviderRpcClient.md) |
| `abi`      | `Abi`                                       |
| `address`  | [`Address`](Address.md)                     |

#### Defined in

[src/contract.ts:40](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L40)

## Accessors

### methods

• `get` **methods**(): [`ContractMethods`](../README.md#contractmethods)<`Abi`\>

#### Returns

[`ContractMethods`](../README.md#contractmethods)<`Abi`\>

#### Defined in

[src/contract.ts:106](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L106)

---

### fields

• `get` **fields**(): [`ContractFields`](../README.md#contractfields)<`Abi`\>

#### Returns

[`ContractFields`](../README.md#contractfields)<`Abi`\>

#### Defined in

[src/contract.ts:110](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L110)

---

### address

• `get` **address**(): [`Address`](Address.md)

#### Returns

[`Address`](Address.md)

#### Defined in

[src/contract.ts:114](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L114)

---

### abi

• `get` **abi**(): `string`

#### Returns

`string`

#### Defined in

[src/contract.ts:118](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L118)

## Methods

### getFullState

▸ **getFullState**(): `Promise`<{ `state`: `undefined` \| [`FullContractState`](../interfaces/FullContractState.md) }\>

Requests contract data

---

Required permissions: `basic`

#### Returns

`Promise`<{ `state`: `undefined` \| [`FullContractState`](../interfaces/FullContractState.md) }\>

#### Defined in

[src/contract.ts:128](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L128)

---

### getFields

▸ **getFields**(`args?`): `Promise`<{ `fields?`: [`DecodedAbiFields`](../README.md#decodedabifields)<`Abi`\> ; `state?`: [`FullContractState`](../interfaces/FullContractState.md) }\>

Unpacks all fields from the contract state using the specified ABI

---

Required permissions: `basic`

#### Parameters

| Name   | Type                                                              |
| :----- | :---------------------------------------------------------------- |
| `args` | [`GetContractFieldsParams`](../README.md#getcontractfieldsparams) |

#### Returns

`Promise`<{ `fields?`: [`DecodedAbiFields`](../README.md#decodedabifields)<`Abi`\> ; `state?`: [`FullContractState`](../interfaces/FullContractState.md) }\>

#### Defined in

[src/contract.ts:141](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L141)

---

### transactions

▸ **transactions**(`subscriber`): [`Stream`](../interfaces/Stream.md)<`unknown`, [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\>, `false`\>

Creates new contract transactions stream

#### Parameters

| Name         | Type                          |
| :----------- | :---------------------------- |
| `subscriber` | [`Subscriber`](Subscriber.md) |

#### Returns

[`Stream`](../interfaces/Stream.md)<`unknown`, [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\>, `false`\>

#### Defined in

[src/contract.ts:163](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L163)

---

### events

▸ **events**(`subscriber`): [`Stream`](../interfaces/Stream.md)<`unknown`, [`DecodedEventWithTransaction`](../README.md#decodedeventwithtransaction)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>, `false`\>

Creates new contract events stream

#### Parameters

| Name         | Type                          |
| :----------- | :---------------------------- |
| `subscriber` | [`Subscriber`](Subscriber.md) |

#### Returns

[`Stream`](../interfaces/Stream.md)<`unknown`, [`DecodedEventWithTransaction`](../README.md#decodedeventwithtransaction)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>, `false`\>

#### Defined in

[src/contract.ts:172](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L172)

---

### waitForEvent

▸ **waitForEvent**<`E`\>(`args?`): `Promise`<`undefined` \| [`DecodedEvent`](../README.md#decodedevent)<`Abi`, `E`\>\>

#### Type parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `E`  | extends `never` = [`AbiEventName`](../README.md#abieventname)<`Abi`\> |

#### Parameters

| Name   | Type                                                                 |
| :----- | :------------------------------------------------------------------- |
| `args` | [`WaitForEventParams`](../README.md#waitforeventparams)<`Abi`, `E`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedEvent`](../README.md#decodedevent)<`Abi`, `E`\>\>

#### Defined in

[src/contract.ts:184](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L184)

---

### getPastEvents

▸ **getPastEvents**<`E`\>(`args`): `Promise`<[`EventsBatch`](../README.md#eventsbatch)<`Abi`, `E`\>\>

#### Type parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `E`  | extends `never` = [`AbiEventName`](../README.md#abieventname)<`Abi`\> |

#### Parameters

| Name   | Type                                                                 |
| :----- | :------------------------------------------------------------------- |
| `args` | [`GetPastEventParams`](../README.md#getpasteventparams)<`Abi`, `E`\> |

#### Returns

`Promise`<[`EventsBatch`](../README.md#eventsbatch)<`Abi`, `E`\>\>

#### Defined in

[src/contract.ts:232](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L232)

---

### decodeTransaction

▸ **decodeTransaction**(`args`): `Promise`<`undefined` \| [`DecodedTransaction`](../README.md#decodedtransaction)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                                      |
| :----- | :------------------------------------------------------------------------ |
| `args` | [`DecodeTransactionParams`](../README.md#decodetransactionparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedTransaction`](../README.md#decodedtransaction)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:307](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L307)

---

### decodeTransactionEvents

▸ **decodeTransactionEvents**(`args`): `Promise`<[`DecodedEvent`](../README.md#decodedevent)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>[]\>

#### Parameters

| Name   | Type                                                                          |
| :----- | :---------------------------------------------------------------------------- |
| `args` | [`DecodeTransactionEventsParams`](../README.md#decodetransactioneventsparams) |

#### Returns

`Promise`<[`DecodedEvent`](../README.md#decodedevent)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>[]\>

#### Defined in

[src/contract.ts:335](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L335)

---

### decodeInputMessage

▸ **decodeInputMessage**(`args`): `Promise`<`undefined` \| [`DecodedInput`](../README.md#decodedinput)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                          |
| :----- | :------------------------------------------------------------ |
| `args` | [`DecodeInputParams`](../README.md#decodeinputparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedInput`](../README.md#decodedinput)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:362](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L362)

---

### decodeOutputMessage

▸ **decodeOutputMessage**(`args`): `Promise`<`undefined` \| [`DecodedOutput`](../README.md#decodedoutput)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                            |
| :----- | :-------------------------------------------------------------- |
| `args` | [`DecodeOutputParams`](../README.md#decodeoutputparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedOutput`](../README.md#decodedoutput)<`Abi`, [`AbiFunctionName`](../README.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:390](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L390)

---

### decodeEvent

▸ **decodeEvent**(`args`): `Promise`<`undefined` \| [`DecodedEvent`](../README.md#decodedevent)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                          |
| :----- | :------------------------------------------------------------ |
| `args` | [`DecodeEventParams`](../README.md#decodeeventparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedEvent`](../README.md#decodedevent)<`Abi`, [`AbiEventName`](../README.md#abieventname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:417](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L417)
