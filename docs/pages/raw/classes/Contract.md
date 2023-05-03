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

• `get` **methods**(): [`ContractMethods`](../contract.md#contractmethods)<`Abi`\>

#### Returns

[`ContractMethods`](../contract.md#contractmethods)<`Abi`\>

#### Defined in

[src/contract.ts:106](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L106)

---

### fields

• `get` **fields**(): [`ContractFields`](../contract.md#contractfields)<`Abi`\>

#### Returns

[`ContractFields`](../contract.md#contractfields)<`Abi`\>

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

▸ **getFields**(`args?`): `Promise`<{ `fields?`: [`DecodedAbiFields`](../models.md#decodedabifields)<`Abi`\> ; `state?`: [`FullContractState`](../interfaces/FullContractState.md) }\>

Unpacks all fields from the contract state using the specified ABI

---

Required permissions: `basic`

#### Parameters

| Name   | Type                                                                |
| :----- | :------------------------------------------------------------------ |
| `args` | [`GetContractFieldsParams`](../contract.md#getcontractfieldsparams) |

#### Returns

`Promise`<{ `fields?`: [`DecodedAbiFields`](../models.md#decodedabifields)<`Abi`\> ; `state?`: [`FullContractState`](../interfaces/FullContractState.md) }\>

#### Defined in

[src/contract.ts:141](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L141)

---

### transactions

▸ **transactions**(`subscriber`): [`Stream`](../interfaces/Stream.md)<`unknown`, [`Transaction`](../models.md#transaction)<[`Address`](Address.md)\>, `false`\>

Creates new contract transactions stream

#### Parameters

| Name         | Type                          |
| :----------- | :---------------------------- |
| `subscriber` | [`Subscriber`](Subscriber.md) |

#### Returns

[`Stream`](../interfaces/Stream.md)<`unknown`, [`Transaction`](../models.md#transaction)<[`Address`](Address.md)\>, `false`\>

#### Defined in

[src/contract.ts:163](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L163)

---

### events

▸ **events**(`subscriber`): [`Stream`](../interfaces/Stream.md)<`unknown`, [`DecodedEventWithTransaction`](../contract.md#decodedeventwithtransaction)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>, `false`\>

Creates new contract events stream

#### Parameters

| Name         | Type                          |
| :----------- | :---------------------------- |
| `subscriber` | [`Subscriber`](Subscriber.md) |

#### Returns

[`Stream`](../interfaces/Stream.md)<`unknown`, [`DecodedEventWithTransaction`](../contract.md#decodedeventwithtransaction)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>, `false`\>

#### Defined in

[src/contract.ts:172](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L172)

---

### waitForEvent

▸ **waitForEvent**<`E`\>(`args?`): `Promise`<`undefined` \| [`DecodedEvent`](../contract.md#decodedevent)<`Abi`, `E`\>\>

#### Type parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `E`  | extends `never` = [`AbiEventName`](../models.md#abieventname)<`Abi`\> |

#### Parameters

| Name   | Type                                                                   |
| :----- | :--------------------------------------------------------------------- |
| `args` | [`WaitForEventParams`](../contract.md#waitforeventparams)<`Abi`, `E`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedEvent`](../contract.md#decodedevent)<`Abi`, `E`\>\>

#### Defined in

[src/contract.ts:184](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L184)

---

### getPastEvents

▸ **getPastEvents**<`E`\>(`args`): `Promise`<[`EventsBatch`](../contract.md#eventsbatch)<`Abi`, `E`\>\>

#### Type parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `E`  | extends `never` = [`AbiEventName`](../models.md#abieventname)<`Abi`\> |

#### Parameters

| Name   | Type                                                                   |
| :----- | :--------------------------------------------------------------------- |
| `args` | [`GetPastEventParams`](../contract.md#getpasteventparams)<`Abi`, `E`\> |

#### Returns

`Promise`<[`EventsBatch`](../contract.md#eventsbatch)<`Abi`, `E`\>\>

#### Defined in

[src/contract.ts:232](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L232)

---

### decodeTransaction

▸ **decodeTransaction**(`args`): `Promise`<`undefined` \| [`DecodedTransaction`](../contract.md#decodedtransaction)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                                        |
| :----- | :-------------------------------------------------------------------------- |
| `args` | [`DecodeTransactionParams`](../contract.md#decodetransactionparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedTransaction`](../contract.md#decodedtransaction)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:307](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L307)

---

### decodeTransactionEvents

▸ **decodeTransactionEvents**(`args`): `Promise`<[`DecodedEvent`](../contract.md#decodedevent)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>[]\>

#### Parameters

| Name   | Type                                                                            |
| :----- | :------------------------------------------------------------------------------ |
| `args` | [`DecodeTransactionEventsParams`](../contract.md#decodetransactioneventsparams) |

#### Returns

`Promise`<[`DecodedEvent`](../contract.md#decodedevent)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>[]\>

#### Defined in

[src/contract.ts:335](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L335)

---

### decodeInputMessage

▸ **decodeInputMessage**(`args`): `Promise`<`undefined` \| [`DecodedInput`](../contract.md#decodedinput)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                            |
| :----- | :-------------------------------------------------------------- |
| `args` | [`DecodeInputParams`](../contract.md#decodeinputparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedInput`](../contract.md#decodedinput)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:362](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L362)

---

### decodeOutputMessage

▸ **decodeOutputMessage**(`args`): `Promise`<`undefined` \| [`DecodedOutput`](../contract.md#decodedoutput)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                              |
| :----- | :---------------------------------------------------------------- |
| `args` | [`DecodeOutputParams`](../contract.md#decodeoutputparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedOutput`](../contract.md#decodedoutput)<`Abi`, [`AbiFunctionName`](../models.md#abifunctionname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:390](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L390)

---

### decodeEvent

▸ **decodeEvent**(`args`): `Promise`<`undefined` \| [`DecodedEvent`](../contract.md#decodedevent)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>\>

#### Parameters

| Name   | Type                                                            |
| :----- | :-------------------------------------------------------------- |
| `args` | [`DecodeEventParams`](../contract.md#decodeeventparams)<`Abi`\> |

#### Returns

`Promise`<`undefined` \| [`DecodedEvent`](../contract.md#decodedevent)<`Abi`, [`AbiEventName`](../models.md#abieventname)<`Abi`\>\>\>

#### Defined in

[src/contract.ts:417](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L417)
