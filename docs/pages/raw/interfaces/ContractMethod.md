[everscale-inpage-provider - v0.3.57](../README.md) / ContractMethod

# Interface: ContractMethod<I, O\>

## Type parameters

| Name |
| :--- |
| `I`  |
| `O`  |

## Table of contents

### Properties

- [address](ContractMethod.md#address)
- [abi](ContractMethod.md#abi)
- [method](ContractMethod.md#method)
- [params](ContractMethod.md#params)

### Methods

- [send](ContractMethod.md#send)
- [sendDelayed](ContractMethod.md#senddelayed)
- [sendWithResult](ContractMethod.md#sendwithresult)
- [estimateFees](ContractMethod.md#estimatefees)
- [sendExternal](ContractMethod.md#sendexternal)
- [sendExternalDelayed](ContractMethod.md#sendexternaldelayed)
- [call](ContractMethod.md#call)
- [executeExternal](ContractMethod.md#executeexternal)
- [executeInternal](ContractMethod.md#executeinternal)
- [encodeInternal](ContractMethod.md#encodeinternal)

## Properties

### address

• `Readonly` **address**: [`Address`](../classes/Address.md)

Target contract address

#### Defined in

[src/contract.ts:495](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L495)

---

### abi

• `Readonly` **abi**: `string`

#### Defined in

[src/contract.ts:496](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L496)

---

### method

• `Readonly` **method**: `string`

#### Defined in

[src/contract.ts:497](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L497)

---

### params

• `Readonly` **params**: `I`

#### Defined in

[src/contract.ts:498](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L498)

## Methods

### send

▸ **send**(`args`): `Promise`<[`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\>\>

Sends internal message and returns wallet transaction

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `args` | [`SendInternalParams`](../README.md#sendinternalparams) |

#### Returns

`Promise`<[`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\>\>

#### Defined in

[src/contract.ts:505](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L505)

---

### sendDelayed

▸ **sendDelayed**(`args`): `Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

Sends internal message without waiting for the transaction

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `args` | [`SendInternalParams`](../README.md#sendinternalparams) |

#### Returns

`Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

#### Defined in

[src/contract.ts:512](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L512)

---

### sendWithResult

▸ **sendWithResult**(`args`): `Promise`<{ `parentTransaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `childTransaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `output?`: `O` }\>

Sends internal message and waits for the new transaction on target address

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `args` | [`SendInternalParams`](../README.md#sendinternalparams) |

#### Returns

`Promise`<{ `parentTransaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `childTransaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `output?`: `O` }\>

#### Defined in

[src/contract.ts:519](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L519)

---

### estimateFees

▸ **estimateFees**(`args`): `Promise`<`string`\>

Estimates wallet fee for calling this method as an internal message

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `args` | [`SendInternalParams`](../README.md#sendinternalparams) |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/contract.ts:528](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L528)

---

### sendExternal

▸ **sendExternal**(`args`): `Promise`<{ `transaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `output?`: `O` }\>

Sends external message and returns contract transaction with parsed output

#### Parameters

| Name   | Type                                                    |
| :----- | :------------------------------------------------------ |
| `args` | [`SendExternalParams`](../README.md#sendexternalparams) |

#### Returns

`Promise`<{ `transaction`: [`Transaction`](../README.md#transaction)<[`Address`](../classes/Address.md)\> ; `output?`: `O` }\>

#### Defined in

[src/contract.ts:535](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L535)

---

### sendExternalDelayed

▸ **sendExternalDelayed**(`args`): `Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

Sends external message without waiting for the transaction

#### Parameters

| Name   | Type                                                                  |
| :----- | :-------------------------------------------------------------------- |
| `args` | [`SendExternalDelayedParams`](../README.md#sendexternaldelayedparams) |

#### Returns

`Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

#### Defined in

[src/contract.ts:542](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L542)

---

### call

▸ **call**(`args?`): `Promise`<`O`\>

Executes only a compute phase locally

#### Parameters

| Name    | Type                                    |
| :------ | :-------------------------------------- |
| `args?` | [`CallParams`](../README.md#callparams) |

#### Returns

`Promise`<`O`\>

#### Defined in

[src/contract.ts:549](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L549)

---

### executeExternal

▸ **executeExternal**(`args`): `Promise`<[`ExecutorOutput`](../README.md#executoroutput)<`O`\>\>

Encodes this method as an external message and
executes all transaction phases locally, producing a new state

#### Parameters

| Name   | Type                                                          |
| :----- | :------------------------------------------------------------ |
| `args` | [`ExecuteExternalParams`](../README.md#executeexternalparams) |

#### Returns

`Promise`<[`ExecutorOutput`](../README.md#executoroutput)<`O`\>\>

#### Defined in

[src/contract.ts:555](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L555)

---

### executeInternal

▸ **executeInternal**(`args`): `Promise`<[`ExecutorOutput`](../README.md#executoroutput)<`O`\>\>

Encodes this method as an internal message and
executes all transaction phases locally, producing a new state

#### Parameters

| Name   | Type                                                          |
| :----- | :------------------------------------------------------------ |
| `args` | [`ExecuteInternalParams`](../README.md#executeinternalparams) |

#### Returns

`Promise`<[`ExecutorOutput`](../README.md#executoroutput)<`O`\>\>

#### Defined in

[src/contract.ts:561](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L561)

---

### encodeInternal

▸ **encodeInternal**(): `Promise`<`string`\>

Encodes method call as BOC

#### Returns

`Promise`<`string`\>

#### Defined in

[src/contract.ts:566](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/contract.ts#L566)
