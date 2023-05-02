---
outline: deep
---

## Contract

### DelayedMessageExecution

Ƭ **DelayedMessageExecution**: `Object`

#### Type declaration

| Name          | Type                                               | Description                                                          |
| :------------ | :------------------------------------------------- | :------------------------------------------------------------------- |
| `messageHash` | `string`                                           | External message hash                                                |
| `expireAt`    | `number`                                           | Message expiration timestamp                                         |
| `transaction` | `Promise`<[`Transaction`](README.md#transaction)\> | Transaction promise (it will be rejected if the message has expired) |

**Defined in:**

[src/contract.ts:455](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L455)

---

### ContractMethods

Ƭ **ContractMethods**<`C`\>: { [K in AbiFunctionName<C\>]: Function }

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/contract.ts:473](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L473)

---

### ContractFields

Ƭ **ContractFields**<`C`\>: { [K in AbiFieldName<C\>]: Function }

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/contract.ts:482](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L482)

---

### GetContractFieldsParams

Ƭ **GetContractFieldsParams**: `Object`

#### Type declaration

| Name            | Type                                                   | Description                                               |
| :-------------- | :----------------------------------------------------- | :-------------------------------------------------------- |
| `cachedState?`  | [`FullContractState`](interfaces/FullContractState.md) | Cached contract state                                     |
| `allowPartial?` | `boolean`                                              | Don't fail if something is left in a cell after unpacking |

**Defined in:**

[src/contract.ts:917](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L917)

---

### ContractFunction

Ƭ **ContractFunction**: `Object`

#### Type declaration

| Name       | Type                               |
| :--------- | :--------------------------------- |
| `name`     | `string`                           |
| `inputs?`  | [`AbiParam`](README.md#abiparam)[] |
| `outputs?` | [`AbiParam`](README.md#abiparam)[] |

**Defined in:**

[src/contract.ts:931](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L931)

---

### SendInternalParams

Ƭ **SendInternalParams**: `Object`

#### Type declaration

| Name         | Type                            | Description                                                                                                                       |
| :----------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `from`       | [`Address`](classes/Address.md) | Preferred wallet address. It is the same address as the `accountInteraction.address`, but it must be explicitly provided          |
| `amount`     | `string`                        | Amount of nano EVER to send                                                                                                       |
| `bounce?`    | `boolean`                       | **`Default`** `ts true `                                                                                                          |
| `stateInit?` | `string`                        | Optional base64 encoded TVC NOTE: If the selected contract do not support stateInit in the internal message, an error is returned |

**Defined in:**

[src/contract.ts:936](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L936)

---

### SendInternalWithResultParams

Ƭ **SendInternalWithResultParams**: [`SendInternalParams`](README.md#sendinternalparams) & { `subscriber?`: [`Subscriber`](classes/Subscriber.md) }

**Defined in:**

[src/contract.ts:962](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L962)

---

### SendExternalParams

Ƭ **SendExternalParams**: `Object`

#### Type declaration

| Name                                    | Type                                                                               | Description                                                                                                                                 |
| :-------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `publicKey`                             | `string`                                                                           | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided |
| `stateInit?`                            | `string`                                                                           | Optional base64 encoded TVC                                                                                                                 |
| `local?`                                | `boolean`                                                                          | Whether to run this message locally. Default: false                                                                                         |
| `executorParams?`                       | { `disableSignatureCheck?`: `boolean` ; `overrideBalance?`: `string` \| `number` } | Optional executor parameters used during local contract execution                                                                           |
| `executorParams.disableSignatureCheck?` | `boolean`                                                                          | If `true`, signature verification always succeds                                                                                            |
| `executorParams.overrideBalance?`       | `string` \| `number`                                                               | Explicit account balance in nano EVER                                                                                                       |
| `withoutSignature?`                     | `boolean`                                                                          | Whether to prepare this message without signature. Default: false                                                                           |

**Defined in:**

[src/contract.ts:972](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L972)

---

### SendExternalDelayedParams

Ƭ **SendExternalDelayedParams**: `Object`

#### Type declaration

| Name         | Type     | Description                                                                                                                                 |
| :----------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `publicKey`  | `string` | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided |
| `stateInit?` | `string` | Optional base64 encoded TVC                                                                                                                 |

**Defined in:**

[src/contract.ts:1008](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1008)

---

### CallParams

Ƭ **CallParams**: `Object`

#### Type declaration

| Name           | Type                                                   | Description                                                                                                      |
| :------------- | :----------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `cachedState?` | [`FullContractState`](interfaces/FullContractState.md) | Cached contract state                                                                                            |
| `responsible?` | `boolean`                                              | Whether to run the method locally as responsible. This will use internal message with unlimited account balance. |

**Defined in:**

[src/contract.ts:1023](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1023)

---

### ExecuteExternalParams

Ƭ **ExecuteExternalParams**: `Object`

#### Type declaration

| Name                                    | Type                                                                               | Description                                                       |
| :-------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `cachedState?`                          | [`FullContractState`](interfaces/FullContractState.md)                             | Cached contract state                                             |
| `publicKey`                             | `string`                                                                           | The public key of the signer.                                     |
| `stateInit?`                            | `string`                                                                           | Optional base64 encoded TVC                                       |
| `executorParams?`                       | { `disableSignatureCheck?`: `boolean` ; `overrideBalance?`: `string` \| `number` } | Optional executor parameters used during local contract execution |
| `executorParams.disableSignatureCheck?` | `boolean`                                                                          | If `true`, signature verification always succeeds                 |
| `executorParams.overrideBalance?`       | `string` \| `number`                                                               | Explicit account balance in nano EVER                             |
| `withoutSignature?`                     | `boolean`                                                                          | Whether to prepare this message without signature. Default: false |

**Defined in:**

[src/contract.ts:1039](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1039)

---

### ExecuteInternalParams

Ƭ **ExecuteInternalParams**: `Object`

#### Type declaration

| Name                                    | Type                                                                               | Description                                                       |
| :-------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `cachedState?`                          | [`FullContractState`](interfaces/FullContractState.md)                             | Cached contract state                                             |
| `stateInit?`                            | `string`                                                                           | Optional base64 encoded TVC                                       |
| `sender`                                | [`Address`](classes/Address.md)                                                    | Message source address                                            |
| `amount`                                | `string`                                                                           | Amount of nano EVER to attach to the message                      |
| `bounce?`                               | `boolean`                                                                          | Whether to bounce message back on error. Default: false           |
| `bounced?`                              | `boolean`                                                                          | Whether the constructed message is bounced. Default: false        |
| `executorParams?`                       | { `disableSignatureCheck?`: `boolean` ; `overrideBalance?`: `string` \| `number` } | Optional executor parameters used during local contract execution |
| `executorParams.disableSignatureCheck?` | `boolean`                                                                          | If `true`, signature verification always succeeds                 |
| `executorParams.overrideBalance?`       | `string` \| `number`                                                               | Explicit account balance in nano EVER                             |

**Defined in:**

[src/contract.ts:1074](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1074)

---

### GetPastEventParams

Ƭ **GetPastEventParams**<`Abi`, `E`\>: `Object`

#### Type parameters

| Name  | Type                                                     |
| :---- | :------------------------------------------------------- |
| `Abi` | `Abi`                                                    |
| `E`   | extends [`AbiEventName`](README.md#abieventname)<`Abi`\> |

#### Type declaration

| Name            | Type                                                                                                      |
| :-------------- | :-------------------------------------------------------------------------------------------------------- |
| `filter?`       | `E` \| [`EventsFilter`](README.md#eventsfilter)<`Abi`, [`AbiEventName`](README.md#abieventname)<`Abi`\>\> |
| `range?`        | [`EventsRange`](README.md#eventsrange)                                                                    |
| `limit?`        | `number`                                                                                                  |
| `continuation?` | [`TransactionId`](README.md#transactionid)                                                                |

**Defined in:**

[src/contract.ts:1117](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1117)

---

### WaitForEventParams

Ƭ **WaitForEventParams**<`Abi`, `E`\>: `Object`

#### Type parameters

| Name  | Type                                                     |
| :---- | :------------------------------------------------------- |
| `Abi` | `Abi`                                                    |
| `E`   | extends [`AbiEventName`](README.md#abieventname)<`Abi`\> |

#### Type declaration

| Name          | Type                                                         |
| :------------ | :----------------------------------------------------------- |
| `filter?`     | `E` \| [`EventsFilter`](README.md#eventsfilter)<`Abi`, `E`\> |
| `range?`      | [`EventsRange`](README.md#eventsrange)                       |
| `subscriber?` | [`Subscriber`](classes/Subscriber.md)                        |

**Defined in:**

[src/contract.ts:1127](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1127)

---

### EventsBatch

Ƭ **EventsBatch**<`Abi`, `E`\>: `Object`

#### Type parameters

| Name  | Type                                                     |
| :---- | :------------------------------------------------------- |
| `Abi` | `Abi`                                                    |
| `E`   | extends [`AbiEventName`](README.md#abieventname)<`Abi`\> |

#### Type declaration

| Name            | Type                                                                                  |
| :-------------- | :------------------------------------------------------------------------------------ |
| `events`        | [`DecodedEventWithTransaction`](README.md#decodedeventwithtransaction)<`Abi`, `E`\>[] |
| `continuation?` | [`TransactionId`](README.md#transactionid)                                            |

**Defined in:**

[src/contract.ts:1136](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1136)

---

### EventsFilter

Ƭ **EventsFilter**<`Abi`, `E`\>: (`event`: [`DecodedEventWithTransaction`](README.md#decodedeventwithtransaction)<`Abi`, `E`\>) => `Promise`<`boolean`\> \| `boolean`

#### Type parameters

| Name  | Type                                                                                                        |
| :---- | :---------------------------------------------------------------------------------------------------------- |
| `Abi` | `Abi`                                                                                                       |
| `E`   | extends [`AbiEventName`](README.md#abieventname)<`Abi`\> = [`AbiEventName`](README.md#abieventname)<`Abi`\> |

#### Type declaration

▸ (`event`): `Promise`<`boolean`\> \| `boolean`

##### Parameters

| Name    | Type                                                                                |
| :------ | :---------------------------------------------------------------------------------- |
| `event` | [`DecodedEventWithTransaction`](README.md#decodedeventwithtransaction)<`Abi`, `E`\> |

##### Returns

`Promise`<`boolean`\> \| `boolean`

**Defined in:**

[src/contract.ts:1144](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1144)

---

### DecodedEventWithTransaction

Ƭ **DecodedEventWithTransaction**<`Abi`, `E`\>: [`DecodedEvent`](README.md#decodedevent)<`Abi`, `E`\> & { `transaction`: [`Transaction`](README.md#transaction) }

#### Type parameters

| Name  | Type                                                     |
| :---- | :------------------------------------------------------- |
| `Abi` | `Abi`                                                    |
| `E`   | extends [`AbiEventName`](README.md#abieventname)<`Abi`\> |

**Defined in:**

[src/contract.ts:1151](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1151)

---

### EventsRange

Ƭ **EventsRange**: `Object`

#### Type declaration

| Name         | Type     |
| :----------- | :------- |
| `fromLt?`    | `string` |
| `fromUtime?` | `number` |
| `toLt?`      | `string` |
| `toUtime?`   | `number` |

**Defined in:**

[src/contract.ts:1158](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1158)

---

### DecodeTransactionParams

Ƭ **DecodeTransactionParams**<`Abi`\>: `Object`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Type declaration

| Name          | Type                                                                                              |
| :------------ | :------------------------------------------------------------------------------------------------ |
| `transaction` | [`Transaction`](README.md#transaction)                                                            |
| `methods`     | [`UniqueArray`](README.md#uniquearray)<[`AbiFunctionName`](README.md#abifunctionname)<`Abi`\>[]\> |

**Defined in:**

[src/contract.ts:1168](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1168)

---

### DecodedTransaction

Ƭ **DecodedTransaction**<`Abi`, `T`\>: `T` extends [`AbiFunctionName`](README.md#abifunctionname)<`Abi`\> ? { `method`: `T` ; `input`: [`DecodedAbiFunctionInputs`](README.md#decodedabifunctioninputs)<`Abi`, `T`\> ; `output`: [`DecodedAbiFunctionOutputs`](README.md#decodedabifunctionoutputs)<`Abi`, `T`\> } : `never`

#### Type parameters

| Name  |
| :---- |
| `Abi` |
| `T`   |

**Defined in:**

[src/contract.ts:1176](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1176)

---

### DecodeInputParams

Ƭ **DecodeInputParams**<`Abi`\>: `Object`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Type declaration

| Name       | Type                                                                                              |
| :--------- | :------------------------------------------------------------------------------------------------ |
| `body`     | `string`                                                                                          |
| `methods`  | [`UniqueArray`](README.md#uniquearray)<[`AbiFunctionName`](README.md#abifunctionname)<`Abi`\>[]\> |
| `internal` | `boolean`                                                                                         |

**Defined in:**

[src/contract.ts:1183](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1183)

---

### DecodedInput

Ƭ **DecodedInput**<`Abi`, `T`\>: `T` extends [`AbiFunctionName`](README.md#abifunctionname)<`Abi`\> ? { `method`: `T` ; `input`: [`DecodedAbiFunctionInputs`](README.md#decodedabifunctioninputs)<`Abi`, `T`\> } : `never`

#### Type parameters

| Name  |
| :---- |
| `Abi` |
| `T`   |

**Defined in:**

[src/contract.ts:1192](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1192)

---

### DecodeOutputParams

Ƭ **DecodeOutputParams**<`Abi`\>: `Object`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Type declaration

| Name      | Type                                                                                              | Description                     |
| :-------- | :------------------------------------------------------------------------------------------------ | :------------------------------ |
| `body`    | `string`                                                                                          | Base64 encoded message body BOC |
| `methods` | [`UniqueArray`](README.md#uniquearray)<[`AbiFunctionName`](README.md#abifunctionname)<`Abi`\>[]\> | -                               |

**Defined in:**

[src/contract.ts:1199](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1199)

---

### DecodeEventParams

Ƭ **DecodeEventParams**<`Abi`\>: `Object`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Type declaration

| Name     | Type                                                                                        | Description                     |
| :------- | :------------------------------------------------------------------------------------------ | :------------------------------ |
| `body`   | `string`                                                                                    | Base64 encoded message body BOC |
| `events` | [`UniqueArray`](README.md#uniquearray)<[`AbiEventName`](README.md#abieventname)<`Abi`\>[]\> | -                               |

**Defined in:**

[src/contract.ts:1210](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1210)

---

### DecodedOutput

Ƭ **DecodedOutput**<`Abi`, `T`\>: `T` extends [`AbiFunctionName`](README.md#abifunctionname)<`Abi`\> ? { `method`: `T` ; `output`: [`DecodedAbiFunctionOutputs`](README.md#decodedabifunctionoutputs)<`Abi`, `T`\> } : `never`

#### Type parameters

| Name  |
| :---- |
| `Abi` |
| `T`   |

**Defined in:**

[src/contract.ts:1221](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1221)

---

### DecodeTransactionEventsParams

Ƭ **DecodeTransactionEventsParams**: `Object`

#### Type declaration

| Name          | Type                                   |
| :------------ | :------------------------------------- |
| `transaction` | [`Transaction`](README.md#transaction) |

**Defined in:**

[src/contract.ts:1228](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1228)

---

### DecodedEvent

Ƭ **DecodedEvent**<`Abi`, `T`\>: `T` extends [`AbiEventName`](README.md#abieventname)<`Abi`\> ? { `event`: `T` ; `data`: [`DecodedAbiEventData`](README.md#decodedabieventdata)<`Abi`, `T`\> } : `never`

#### Type parameters

| Name  |
| :---- |
| `Abi` |
| `T`   |

**Defined in:**

[src/contract.ts:1235](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1235)

---

### ExecutorOutput

Ƭ **ExecutorOutput**<`O`\>: `Object`

#### Type parameters

| Name |
| :--- |
| `O`  |

#### Type declaration

| Name          | Type                                                                  | Description                                   |
| :------------ | :-------------------------------------------------------------------- | :-------------------------------------------- |
| `transaction` | [`Transaction`](README.md#transaction)                                | Executed transaction                          |
| `newState`    | [`FullContractState`](interfaces/FullContractState.md) \| `undefined` | Contract state after the executed transaction |
| `output`      | `O` \| `undefined`                                                    | Parsed function call output                   |

**Defined in:**

[src/contract.ts:1242](https://github.com/Cyace84/everscale-inpage-provider/blob/14e397c/src/contract.ts#L1242)
