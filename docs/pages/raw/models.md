---
outline: deep
---

## Models

### GenTimings

Ƭ **GenTimings**: `Object`

#### Type declaration

| Name       | Type     |
| :--------- | :------- |
| `genLt`    | `string` |
| `genUtime` | `number` |

**Defined in:**

[src/models.ts:26](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L26)

---

### ContractUpdatesSubscription

Ƭ **ContractUpdatesSubscription**: `Object`

#### Type declaration

| Name           | Type      | Description                                 |
| :------------- | :-------- | :------------------------------------------ |
| `state`        | `boolean` | Whether to listen contract state updates    |
| `transactions` | `boolean` | Whether to listen new contract transactions |

**Defined in:**

[src/models.ts:34](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L34)

---

### TransactionsBatchInfo

Ƭ **TransactionsBatchInfo**: `Object`

#### Type declaration

| Name        | Type                                                       |
| :---------- | :--------------------------------------------------------- |
| `minLt`     | `string`                                                   |
| `maxLt`     | `string`                                                   |
| `batchType` | [`TransactionsBatchType`](models.md#transactionsbatchtype) |

**Defined in:**

[src/models.ts:48](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L48)

---

### TransactionsBatchType

Ƭ **TransactionsBatchType**: `"old"` \| `"new"`

**Defined in:**

[src/models.ts:57](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L57)

---

### Transaction

Ƭ **Transaction**<`Addr`\>: `Object`

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

#### Type declaration

| Name                 | Type                                       |
| :------------------- | :----------------------------------------- |
| `id`                 | [`TransactionId`](models.md#transactionid) |
| `prevTransactionId?` | [`TransactionId`](models.md#transactionid) |
| `createdAt`          | `number`                                   |
| `aborted`            | `boolean`                                  |
| `exitCode?`          | `number`                                   |
| `resultCode?`        | `number`                                   |
| `origStatus`         | [`AccountStatus`](models.md#accountstatus) |
| `endStatus`          | [`AccountStatus`](models.md#accountstatus) |
| `totalFees`          | `string`                                   |
| `inMessage`          | [`Message`](models.md#message)<`Addr`\>    |
| `outMessages`        | [`Message`](models.md#message)<`Addr`\>[]  |

**Defined in:**

[src/models.ts:62](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L62)

---

### TransactionWithAccount

Ƭ **TransactionWithAccount**<`Addr`\>: [`Transaction`](models.md#transaction)<`Addr`\> & { `account`: `Addr` }

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

**Defined in:**

[src/models.ts:79](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L79)

---

### RawTransaction

Ƭ **RawTransaction**: [`Transaction`](models.md#transaction)<`string`\>

**Defined in:**

[src/models.ts:84](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L84)

---

### serializeTransaction

▸ **serializeTransaction**(`transaction`): [`RawTransaction`](models.md#rawtransaction)

#### Parameters

| Name          | Type                                                                     |
| :------------ | :----------------------------------------------------------------------- |
| `transaction` | [`Transaction`](models.md#transaction)<[`Address`](classes/Address.md)\> |

#### Returns

[`RawTransaction`](models.md#rawtransaction)

**Defined in:**

[src/models.ts:89](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L89)

---

### parseTransaction

▸ **parseTransaction**(`transaction`): [`Transaction`](models.md#transaction)

#### Parameters

| Name          | Type                                         |
| :------------ | :------------------------------------------- |
| `transaction` | [`RawTransaction`](models.md#rawtransaction) |

#### Returns

[`Transaction`](models.md#transaction)

**Defined in:**

[src/models.ts:118](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L118)

---

### Message

Ƭ **Message**<`Addr`\>: `Object`

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

#### Type declaration

| Name        | Type      |
| :---------- | :-------- |
| `hash`      | `string`  |
| `src?`      | `Addr`    |
| `dst?`      | `Addr`    |
| `value`     | `string`  |
| `bounce`    | `boolean` |
| `bounced`   | `boolean` |
| `body?`     | `string`  |
| `bodyHash?` | `string`  |

**Defined in:**

[src/models.ts:129](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L129)

---

### RawMessage

Ƭ **RawMessage**: [`Message`](models.md#message)<`string`\>

**Defined in:**

[src/models.ts:143](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L143)

---

### serializeMessage

▸ **serializeMessage**(`message`): [`RawMessage`](models.md#rawmessage)

#### Parameters

| Name      | Type                                                             |
| :-------- | :--------------------------------------------------------------- |
| `message` | [`Message`](models.md#message)<[`Address`](classes/Address.md)\> |

#### Returns

[`RawMessage`](models.md#rawmessage)

**Defined in:**

[src/models.ts:148](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L148)

---

### parseMessage

▸ **parseMessage**(`message`): [`Message`](models.md#message)

#### Parameters

| Name      | Type                                 |
| :-------- | :----------------------------------- |
| `message` | [`RawMessage`](models.md#rawmessage) |

#### Returns

[`Message`](models.md#message)

**Defined in:**

[src/models.ts:165](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L165)

---

### DelayedMessage

Ƭ **DelayedMessage**<`Addr`\>: `Object`

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

#### Type declaration

| Name       | Type     | Description                                                                                                   |
| :--------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| `hash`     | `string` | External message hash                                                                                         |
| `account`  | `Addr`   | Destination account address (`sender` for `sendMessageDelayed`, `recipient` for `sendExternalMessageDelayed`) |
| `expireAt` | `number` | Message expiration timestamp                                                                                  |

**Defined in:**

[src/models.ts:176](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L176)

---

### AccountStatus

Ƭ **AccountStatus**: `"uninit"` \| `"frozen"` \| `"active"` \| `"nonexist"`

**Defined in:**

[src/models.ts:194](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L194)

---

### LastTransactionId

Ƭ **LastTransactionId**: `Object`

#### Type declaration

| Name      | Type      |
| :-------- | :-------- |
| `isExact` | `boolean` |
| `lt`      | `string`  |
| `hash?`   | `string`  |

**Defined in:**

[src/models.ts:199](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L199)

---

### TransactionId

Ƭ **TransactionId**: `Object`

#### Type declaration

| Name   | Type     |
| :----- | :------- |
| `lt`   | `string` |
| `hash` | `string` |

**Defined in:**

[src/models.ts:208](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L208)

---

### Permissions

Ƭ **Permissions**<`Addr`\>: `Object`

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

#### Type declaration

| Name                              | Type                                                                     |
| :-------------------------------- | :----------------------------------------------------------------------- |
| `basic`                           | `true`                                                                   |
| `accountInteraction`              | { `address`: `Addr` ; `publicKey`: `string` ; `contractType`: `string` } |
| `accountInteraction.address`      | `Addr`                                                                   |
| `accountInteraction.publicKey`    | `string`                                                                 |
| `accountInteraction.contractType` | `string`                                                                 |

**Defined in:**

[src/models.ts:218](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L218)

---

### RawPermissions

Ƭ **RawPermissions**: [`Permissions`](models.md#permissions)<`string`\>

**Defined in:**

[src/models.ts:230](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L230)

---

### parsePermissions

▸ **parsePermissions**(`permissions`): `Partial`<[`Permissions`](models.md#permissions)\>

#### Parameters

| Name          | Type                                                     |
| :------------ | :------------------------------------------------------- |
| `permissions` | `Partial`<[`RawPermissions`](models.md#rawpermissions)\> |

#### Returns

`Partial`<[`Permissions`](models.md#permissions)\>

**Defined in:**

[src/models.ts:235](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L235)

---

### parseAccountInteraction

▸ **parseAccountInteraction**(`accountInteraction`): `Required`<[`Permissions`](models.md#permissions)\>[``"accountInteraction"``]

#### Parameters

| Name                              | Type     |
| :-------------------------------- | :------- |
| `accountInteraction`              | `Object` |
| `accountInteraction.address`      | `string` |
| `accountInteraction.publicKey`    | `string` |
| `accountInteraction.contractType` | `string` |

#### Returns

`Required`<[`Permissions`](models.md#permissions)\>[``"accountInteraction"``]

**Defined in:**

[src/models.ts:247](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L247)

---

### Permission

Ƭ **Permission**: keyof [`Permissions`](models.md#permissions)

**Defined in:**

[src/models.ts:259](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L259)

---

### PermissionData

Ƭ **PermissionData**<`T`, `Addr`\>: [`Permissions`](models.md#permissions)<`Addr`\>[`T`]

#### Type parameters

| Name   | Type                                         |
| :----- | :------------------------------------------- |
| `T`    | extends [`Permission`](models.md#permission) |
| `Addr` | [`Address`](classes/Address.md)              |

**Defined in:**

[src/models.ts:264](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L264)

---

### AssetType

Ƭ **AssetType**: `"tip3_token"`

**Defined in:**

[src/models.ts:271](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L271)

---

### AssetTypeParams

Ƭ **AssetTypeParams**<`T`, `Addr`\>: `T` extends `"tip3_token"` ? { `rootContract`: `Addr` } : `never`

#### Type parameters

| Name   | Type                                       |
| :----- | :----------------------------------------- |
| `T`    | extends [`AssetType`](models.md#assettype) |
| `Addr` | [`Address`](classes/Address.md)            |

**Defined in:**

[src/models.ts:276](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L276)

---

### EncryptionAlgorithm

Ƭ **EncryptionAlgorithm**: `"ChaCha20Poly1305"`

**Defined in:**

[src/models.ts:285](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L285)

---

### EncryptedData

Ƭ **EncryptedData**: `Object`

#### Type declaration

| Name                 | Type                                                   | Description                        |
| :------------------- | :----------------------------------------------------- | :--------------------------------- |
| `algorithm`          | [`EncryptionAlgorithm`](models.md#encryptionalgorithm) | -                                  |
| `sourcePublicKey`    | `string`                                               | Hex encoded encryptor's public key |
| `recipientPublicKey` | `string`                                               | Hex encoded recipient public key   |
| `data`               | `string`                                               | Base64 encoded data                |
| `nonce`              | `string`                                               | Base64 encoded nonce               |

**Defined in:**

[src/models.ts:290](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L290)

---

### AbiVersion

Ƭ **AbiVersion**: `"1.0"` \| `"2.0"` \| `"2.1"` \| `"2.2"` \| `"2.3"`

**Defined in:**

[src/models.ts:315](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L315)

---

### TokenValue

Ƭ **TokenValue**<`Addr`\>: `null` \| `boolean` \| `string` \| `number` \| `Addr` \| { [K in string]: TokenValue<Addr\> } \| [`TokenValue`](models.md#tokenvalue)<`Addr`\>[] \| readonly [[`TokenValue`](models.md#tokenvalue)<`Addr`\>, [`TokenValue`](models.md#tokenvalue)<`Addr`\>][]

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

**Defined in:**

[src/models.ts:320](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L320)

---

### RawTokenValue

Ƭ **RawTokenValue**: [`TokenValue`](models.md#tokenvalue)<`string`\>

**Defined in:**

[src/models.ts:333](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L333)

---

### TokensObject

Ƭ **TokensObject**<`Addr`\>: { [K in string]: TokenValue<Addr\> }

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

**Defined in:**

[src/models.ts:338](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L338)

---

### RawTokensObject

Ƭ **RawTokensObject**: [`TokensObject`](models.md#tokensobject)<`string`\>

**Defined in:**

[src/models.ts:343](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L343)

---

### FunctionCall

Ƭ **FunctionCall**<`Addr`\>: `Object`

#### Type parameters

| Name   | Type                            |
| :----- | :------------------------------ |
| `Addr` | [`Address`](classes/Address.md) |

#### Type declaration

| Name     | Type                                              | Description                                 |
| :------- | :------------------------------------------------ | :------------------------------------------ |
| `abi`    | `string`                                          | Contract ABI                                |
| `method` | `string`                                          | Specific method from specified contract ABI |
| `params` | [`TokensObject`](models.md#tokensobject)<`Addr`\> | Method arguments                            |

**Defined in:**

[src/models.ts:348](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L348)

---

### AbiParamKind

Ƭ **AbiParamKind**: `AbiParamKindUint` \| `AbiParamKindInt` \| `AbiParamKindVarUint` \| `AbiParamKindVarInt` \| `AbiParamKindTuple` \| `AbiParamKindBool` \| `AbiParamKindCell` \| `AbiParamKindAddress` \| `AbiParamKindBytes` \| `AbiParamKindFixedBytes` \| `AbiParamKindString` \| `AbiParamKindGram` \| `AbiParamKindTime` \| `AbiParamKindExpire` \| `AbiParamKindPublicKey`

**Defined in:**

[src/models.ts:394](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L394)

---

### AbiParam

Ƭ **AbiParam**: `Object`

#### Type declaration

| Name          | Type                                                                                                                                                                          |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                                                                                                                      |
| `type`        | [`AbiParamKind`](models.md#abiparamkind) \| `AbiParamKindMap` \| `AbiParamKindArray` \| `AbiParamOptional` \| `AbiParamRef` \| `AbiParamOptionalRef` \| `AbiParamRefOptional` |
| `components?` | [`AbiParam`](models.md#abiparam)[]                                                                                                                                            |

**Defined in:**

[src/models.ts:414](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L414)

---

### ReadonlyAbiParam

Ƭ **ReadonlyAbiParam**: `Object`

#### Type declaration

| Name          | Type                                                                                                                                                                          |
| :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | `string`                                                                                                                                                                      |
| `type`        | [`AbiParamKind`](models.md#abiparamkind) \| `AbiParamKindMap` \| `AbiParamKindArray` \| `AbiParamOptional` \| `AbiParamRef` \| `AbiParamOptionalRef` \| `AbiParamRefOptional` |
| `components?` | readonly [`ReadonlyAbiParam`](models.md#readonlyabiparam)[]                                                                                                                   |

**Defined in:**

[src/models.ts:430](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L430)

---

### serializeTokensObject

▸ **serializeTokensObject**(`object`): [`RawTokensObject`](models.md#rawtokensobject)

#### Parameters

| Name     | Type                                                                       |
| :------- | :------------------------------------------------------------------------- |
| `object` | [`TokensObject`](models.md#tokensobject)<[`Address`](classes/Address.md)\> |

#### Returns

[`RawTokensObject`](models.md#rawtokensobject)

**Defined in:**

[src/models.ts:446](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L446)

---

### parseTokensObject

▸ **parseTokensObject**(`params`, `object`): [`TokensObject`](models.md#tokensobject)

#### Parameters

| Name     | Type                                           |
| :------- | :--------------------------------------------- |
| `params` | [`AbiParam`](models.md#abiparam)[]             |
| `object` | [`RawTokensObject`](models.md#rawtokensobject) |

#### Returns

[`TokensObject`](models.md#tokensobject)

**Defined in:**

[src/models.ts:475](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L475)

---

### parsePartialTokensObject

▸ **parsePartialTokensObject**(`params`, `object`): [`TokensObject`](models.md#tokensobject)

#### Parameters

| Name     | Type                                                       |
| :------- | :--------------------------------------------------------- |
| `params` | [`AbiParam`](models.md#abiparam)[]                         |
| `object` | `Partial`<[`RawTokensObject`](models.md#rawtokensobject)\> |

#### Returns

[`TokensObject`](models.md#tokensobject)

**Defined in:**

[src/models.ts:486](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L486)

---

### InputTokenObject

Ƭ **InputTokenObject**<`O`\>: `O` extends { `name`: infer K ; `type`: infer T ; `components?`: infer C } ? `K` extends `string` ? { [P in K]: InputTokenValue<T, C\> } : `never` : `never`

#### Type parameters

| Name |
| :--- |
| `O`  |

**Defined in:**

[src/models.ts:595](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L595)

---

### OutputTokenObject

Ƭ **OutputTokenObject**<`O`\>: `O` extends { `name`: infer K ; `type`: infer T ; `components?`: infer C } ? `K` extends `string` ? { [P in K]: OutputTokenValue<T, C\> } : `never` : `never`

#### Type parameters

| Name |
| :--- |
| `O`  |

**Defined in:**

[src/models.ts:604](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L604)

---

### MergeInputObjectsArray

Ƭ **MergeInputObjectsArray**<`A`\>: `A` extends readonly [infer T, ...(infer Ts)] ? [`InputTokenObject`](models.md#inputtokenobject)<`T`\> & [`MergeInputObjectsArray`](models.md#mergeinputobjectsarray)<[...Ts]\> : `A` extends readonly [infer T] ? [`InputTokenObject`](models.md#inputtokenobject)<`T`\> : `A` extends readonly [] ? {} : `never`

#### Type parameters

| Name |
| :--- |
| `A`  |

**Defined in:**

[src/models.ts:613](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L613)

---

### MergeOutputObjectsArray

Ƭ **MergeOutputObjectsArray**<`A`\>: `A` extends readonly [infer T, ...(infer Ts)] ? [`OutputTokenObject`](models.md#outputtokenobject)<`T`\> & [`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<[...Ts]\> : `A` extends readonly [infer T] ? [`OutputTokenObject`](models.md#outputtokenobject)<`T`\> : `A` extends readonly [] ? {} : `never`

#### Type parameters

| Name |
| :--- |
| `A`  |

**Defined in:**

[src/models.ts:624](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L624)

---

### AbiFunctionName

Ƭ **AbiFunctionName**<`C`\>: `AbiFunction`<`C`\>[``"name"``]

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/models.ts:642](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L642)

---

### AbiEventName

Ƭ **AbiEventName**<`C`\>: `AbiEvent`<`C`\>[``"name"``]

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/models.ts:646](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L646)

---

### AbiFieldName

Ƭ **AbiFieldName**<`C`\>: keyof [`DecodedAbiFields`](models.md#decodedabifields)<`C`\>

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/models.ts:650](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L650)

---

### AbiFunctionInputs

Ƭ **AbiFunctionInputs**<`C`, `T`\>: [`MergeInputObjectsArray`](models.md#mergeinputobjectsarray)<`PickFunction`<`C`, `T`\>[``"inputs"``]\>

#### Type parameters

| Name | Type                                                         |
| :--- | :----------------------------------------------------------- |
| `C`  | `C`                                                          |
| `T`  | extends [`AbiFunctionName`](models.md#abifunctionname)<`C`\> |

**Defined in:**

[src/models.ts:658](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L658)

---

### AbiFunctionInputsWithDefault

Ƭ **AbiFunctionInputsWithDefault**<`C`, `T`\>: `PickFunction`<`C`, `T`\>[``"inputs"``] extends readonly [] ? `void` \| `Record`<`string`, `never`\> : [`AbiFunctionInputs`](models.md#abifunctioninputs)<`C`, `T`\>

#### Type parameters

| Name | Type                                                         |
| :--- | :----------------------------------------------------------- |
| `C`  | `C`                                                          |
| `T`  | extends [`AbiFunctionName`](models.md#abifunctionname)<`C`\> |

**Defined in:**

[src/models.ts:663](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L663)

---

### DecodedAbiFunctionInputs

Ƭ **DecodedAbiFunctionInputs**<`C`, `T`\>: [`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<`PickFunction`<`C`, `T`\>[``"inputs"``]\>

#### Type parameters

| Name | Type                                                         |
| :--- | :----------------------------------------------------------- |
| `C`  | `C`                                                          |
| `T`  | extends [`AbiFunctionName`](models.md#abifunctionname)<`C`\> |

**Defined in:**

[src/models.ts:673](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L673)

---

### DecodedAbiFunctionOutputs

Ƭ **DecodedAbiFunctionOutputs**<`C`, `T`\>: [`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<`PickFunction`<`C`, `T`\>[``"outputs"``]\>

#### Type parameters

| Name | Type                                                         |
| :--- | :----------------------------------------------------------- |
| `C`  | `C`                                                          |
| `T`  | extends [`AbiFunctionName`](models.md#abifunctionname)<`C`\> |

**Defined in:**

[src/models.ts:679](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L679)

---

### DecodedAbiEventData

Ƭ **DecodedAbiEventData**<`C`, `T`\>: [`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<`PickEvent`<`C`, `T`\>[``"inputs"``]\>

#### Type parameters

| Name | Type                                                   |
| :--- | :----------------------------------------------------- |
| `C`  | `C`                                                    |
| `T`  | extends [`AbiEventName`](models.md#abieventname)<`C`\> |

**Defined in:**

[src/models.ts:685](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L685)

---

### DecodedAbiInitData

Ƭ **DecodedAbiInitData**<`C`\>: `C` extends { `data`: infer D } ? `Partial`<[`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<`D`\>\> : `never`

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/models.ts:690](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L690)

---

### DecodedAbiFields

Ƭ **DecodedAbiFields**<`C`\>: `C` extends { `fields`: infer F } ? [`MergeOutputObjectsArray`](models.md#mergeoutputobjectsarray)<`F`\> : `never`

#### Type parameters

| Name |
| :--- |
| `C`  |

**Defined in:**

[src/models.ts:695](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/models.ts#L695)
