[everscale-inpage-provider - v0.3.57](../README.md) / ProviderRpcClient

# Class: ProviderRpcClient

**`Toc Section`**

3. Classes

**`Toc Description`**

Implement the main class, ProviderRpcClient, which contains
methods and properties for interacting with the Everscale blockchain.

## Table of contents

### Constructors

- [constructor](ProviderRpcClient.md#constructor)

### Properties

- [Contract](ProviderRpcClient.md#contract)
- [Subscriber](ProviderRpcClient.md#subscriber)

### Accessors

- [isInitialized](ProviderRpcClient.md#isinitialized)
- [raw](ProviderRpcClient.md#raw)
- [rawApi](ProviderRpcClient.md#rawapi)

### Methods

- [createContract](ProviderRpcClient.md#createcontract)
- [createSubscriber](ProviderRpcClient.md#createsubscriber)
- [hasProvider](ProviderRpcClient.md#hasprovider)
- [ensureInitialized](ProviderRpcClient.md#ensureinitialized)
- [requestPermissions](ProviderRpcClient.md#requestpermissions)
- [changeAccount](ProviderRpcClient.md#changeaccount)
- [disconnect](ProviderRpcClient.md#disconnect)
- [subscribe](ProviderRpcClient.md#subscribe)
- [getProviderState](ProviderRpcClient.md#getproviderstate)
- [getBalance](ProviderRpcClient.md#getbalance)
- [getFullContractState](ProviderRpcClient.md#getfullcontractstate)
- [getAccountsByCodeHash](ProviderRpcClient.md#getaccountsbycodehash)
- [getExpectedAddress](ProviderRpcClient.md#getexpectedaddress)
- [getStateInit](ProviderRpcClient.md#getstateinit)
- [unpackInitData](ProviderRpcClient.md#unpackinitdata)
- [packIntoCell](ProviderRpcClient.md#packintocell)
- [unpackFromCell](ProviderRpcClient.md#unpackfromcell)
- [extractPublicKey](ProviderRpcClient.md#extractpublickey)
- [codeToTvc](ProviderRpcClient.md#codetotvc)
- [mergeTvc](ProviderRpcClient.md#mergetvc)
- [splitTvc](ProviderRpcClient.md#splittvc)
- [setCodeSalt](ProviderRpcClient.md#setcodesalt)
- [getCodeSalt](ProviderRpcClient.md#getcodesalt)
- [addAsset](ProviderRpcClient.md#addasset)
- [getTransactions](ProviderRpcClient.md#gettransactions)
- [getTransaction](ProviderRpcClient.md#gettransaction)
- [sendMessage](ProviderRpcClient.md#sendmessage)
- [sendMessageDelayed](ProviderRpcClient.md#sendmessagedelayed)
- [getBocHash](ProviderRpcClient.md#getbochash)
- [verifySignature](ProviderRpcClient.md#verifysignature)
- [signData](ProviderRpcClient.md#signdata)
- [signDataRaw](ProviderRpcClient.md#signdataraw)
- [encryptData](ProviderRpcClient.md#encryptdata)
- [decryptData](ProviderRpcClient.md#decryptdata)

## Constructors

### constructor

• **new ProviderRpcClient**(`properties?`)

#### Parameters

| Name         | Type                                                    |
| :----------- | :------------------------------------------------------ |
| `properties` | [`ProviderProperties`](../README.md#providerproperties) |

#### Defined in

[src/index.ts:168](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L168)

## Properties

### Contract

• **Contract**: <Abi\>(`abi`: `Abi`, `address`: [`Address`](Address.md)) => [`Contract`](Contract.md)<`Abi`\>

#### Type declaration

• **new Contract**<`Abi`\>(`abi`, `address`)

##### Type parameters

| Name  |
| :---- |
| `Abi` |

##### Parameters

| Name      | Type                    |
| :-------- | :---------------------- |
| `abi`     | `Abi`                   |
| `address` | [`Address`](Address.md) |

#### Defined in

[src/index.ts:165](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L165)

---

### Subscriber

• **Subscriber**: () => [`Subscriber`](Subscriber.md)

#### Type declaration

• **new Subscriber**()

#### Defined in

[src/index.ts:166](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L166)

## Accessors

### isInitialized

• `get` **isInitialized**(): `boolean`

Whether provider api is ready

#### Returns

`boolean`

#### Defined in

[src/index.ts:311](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L311)

---

### raw

• `get` **raw**(): [`Provider`](../interfaces/Provider.md)

Raw provider

#### Returns

[`Provider`](../interfaces/Provider.md)

#### Defined in

[src/index.ts:318](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L318)

---

### rawApi

• `get` **rawApi**(): [`RawProviderApiMethods`](../README.md#rawproviderapimethods)

Raw provider api

#### Returns

[`RawProviderApiMethods`](../README.md#rawproviderapimethods)

#### Defined in

[src/index.ts:329](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L329)

## Methods

### createContract

▸ **createContract**<`Abi`\>(`abi`, `address`): [`Contract`](Contract.md)<`Abi`\>

Creates typed contract wrapper.

**`Deprecated`**

`new ever.Contract(abi, address)` should be used instead

**`Sub Category`**

Factory methods

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Parameters

| Name      | Type                    | Description                                        |
| :-------- | :---------------------- | :------------------------------------------------- |
| `abi`     | `Abi`                   | Readonly object (must be declared with `as const`) |
| `address` | [`Address`](Address.md) | Default contract address                           |

#### Returns

[`Contract`](Contract.md)<`Abi`\>

#### Defined in

[src/index.ts:270](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L270)

---

### createSubscriber

▸ **createSubscriber**(): [`Subscriber`](Subscriber.md)

Creates subscriptions group

**`Deprecated`**

`new ever.Subscriber()` should be used instead

#### Returns

[`Subscriber`](Subscriber.md)

#### Defined in

[src/index.ts:279](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L279)

---

### hasProvider

▸ **hasProvider**(): `Promise`<`boolean`\>

Checks whether this page has injected Everscale provider or
there is a fallback provider.

**`Sub Category`**

Initialization and provider related methods

#### Returns

`Promise`<`boolean`\>

#### Defined in

[src/index.ts:289](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L289)

---

### ensureInitialized

▸ **ensureInitialized**(): `Promise`<`void`\>

Waits until provider api will be available. Calls `fallback` if no provider was found

**`Throws`**

ProviderNotFoundException when no provider found

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:301](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L301)

---

### requestPermissions

▸ **requestPermissions**(`args`): `Promise`<`Partial`<[`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>\>\>

Requests new permissions for current origin.
Shows an approval window to the user.
Will overwrite already existing permissions

---

Required permissions: none

**`Sub Category`**

Account and Permissions management

#### Parameters

| Name               | Type                                                                        |
| :----------------- | :-------------------------------------------------------------------------- |
| `args`             | `Object`                                                                    |
| `args.permissions` | keyof [`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>[] |

#### Returns

`Promise`<`Partial`<[`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>\>\>

#### Defined in

[src/index.ts:343](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L343)

---

### changeAccount

▸ **changeAccount**(): `Promise`<`void`\>

Updates `accountInteraction` permission value

---

Requires permissions: `accountInteraction`

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:359](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L359)

---

### disconnect

▸ **disconnect**(): `Promise`<`void`\>

Removes all permissions for current origin and stops all subscriptions

#### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:367](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L367)

---

### subscribe

▸ **subscribe**(`eventName`, `params`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"contractStateChanged"`\>\>

Called every time contract state changes

**`Sub Category`**

Subscription management

#### Parameters

| Name             | Type                     |
| :--------------- | :----------------------- |
| `eventName`      | `"contractStateChanged"` |
| `params`         | `Object`                 |
| `params.address` | [`Address`](Address.md)  |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"contractStateChanged"`\>\>

#### Defined in

[src/index.ts:377](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L377)

▸ **subscribe**(`eventName`, `params`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"transactionsFound"`\>\>

Called on each new transactions batch, received on subscription

#### Parameters

| Name             | Type                    |
| :--------------- | :---------------------- |
| `eventName`      | `"transactionsFound"`   |
| `params`         | `Object`                |
| `params.address` | [`Address`](Address.md) |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"transactionsFound"`\>\>

#### Defined in

[src/index.ts:385](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L385)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"connected"`\>\>

Called every time when provider connection is established

#### Parameters

| Name        | Type          |
| :---------- | :------------ |
| `eventName` | `"connected"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"connected"`\>\>

#### Defined in

[src/index.ts:393](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L393)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"disconnected"`\>\>

Called when inpage provider disconnects from extension

#### Parameters

| Name        | Type             |
| :---------- | :--------------- |
| `eventName` | `"disconnected"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"disconnected"`\>\>

#### Defined in

[src/index.ts:398](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L398)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"messageStatusUpdated"`\>\>

Called every time a delayed message was delivered or expired

#### Parameters

| Name        | Type                     |
| :---------- | :----------------------- |
| `eventName` | `"messageStatusUpdated"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"messageStatusUpdated"`\>\>

#### Defined in

[src/index.ts:403](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L403)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"networkChanged"`\>\>

Called each time the user changes network

#### Parameters

| Name        | Type               |
| :---------- | :----------------- |
| `eventName` | `"networkChanged"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"networkChanged"`\>\>

#### Defined in

[src/index.ts:408](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L408)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"permissionsChanged"`\>\>

Called when permissions are changed.
Mostly when account has been removed from the current `accountInteraction` permission,
or disconnect method was called

#### Parameters

| Name        | Type                   |
| :---------- | :--------------------- |
| `eventName` | `"permissionsChanged"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"permissionsChanged"`\>\>

#### Defined in

[src/index.ts:415](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L415)

▸ **subscribe**(`eventName`): `Promise`<[`Subscription`](../interfaces/Subscription.md)<`"loggedOut"`\>\>

Called when the user logs out of the extension

#### Parameters

| Name        | Type          |
| :---------- | :------------ |
| `eventName` | `"loggedOut"` |

#### Returns

`Promise`<[`Subscription`](../interfaces/Subscription.md)<`"loggedOut"`\>\>

#### Defined in

[src/index.ts:420](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L420)

---

### getProviderState

▸ **getProviderState**(): `Promise`<{ `version`: `string` ; `numericVersion`: `number` ; `selectedConnection`: `string` ; `networkId`: `number` ; `supportedPermissions`: keyof [`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>[] ; `permissions`: `Partial`<[`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>\> ; `subscriptions`: { `[address: string]`: [`ContractUpdatesSubscription`](../README.md#contractupdatessubscription); } }\>

Returns provider api state

---

Required permissions: none

**`Sub Category`**

Contract & Data Handling

#### Returns

`Promise`<{ `version`: `string` ; `numericVersion`: `number` ; `selectedConnection`: `string` ; `networkId`: `number` ; `supportedPermissions`: keyof [`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>[] ; `permissions`: `Partial`<[`Permissions`](../README.md#permissions)<[`Address`](Address.md)\>\> ; `subscriptions`: { `[address: string]`: [`ContractUpdatesSubscription`](../README.md#contractupdatessubscription); } }\>

#### Defined in

[src/index.ts:591](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L591)

---

### getBalance

▸ **getBalance**(`address`): `Promise`<`string`\>

Requests contract balance

---

Required permissions: `basic`

#### Parameters

| Name      | Type                    |
| :-------- | :---------------------- |
| `address` | [`Address`](Address.md) |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/index.ts:606](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L606)

---

### getFullContractState

▸ **getFullContractState**(`args`): `Promise`<{ `state`: `undefined` \| [`FullContractState`](../interfaces/FullContractState.md) }\>

Requests contract data

---

Required permissions: `basic`

#### Parameters

| Name           | Type                    | Description      |
| :------------- | :---------------------- | :--------------- |
| `args`         | `Object`                | -                |
| `args.address` | [`Address`](Address.md) | Contract address |

#### Returns

`Promise`<{ `state`: `undefined` \| [`FullContractState`](../interfaces/FullContractState.md) }\>

#### Defined in

[src/index.ts:619](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L619)

---

### getAccountsByCodeHash

▸ **getAccountsByCodeHash**(`args`): `Promise`<{ `accounts`: [`Address`](Address.md)[] ; `continuation`: `undefined` \| `string` }\>

Requests accounts with specified code hash

---

Required permissions: `basic`

#### Parameters

| Name                 | Type     | Description                                          |
| :------------------- | :------- | :--------------------------------------------------- |
| `args`               | `Object` | -                                                    |
| `args.codeHash`      | `string` | Hex encoded code hash                                |
| `args.continuation?` | `string` | Last address from previous batch                     |
| `args.limit?`        | `number` | Optional limit. Values grater than 50 have no effect |

#### Returns

`Promise`<{ `accounts`: [`Address`](Address.md)[] ; `continuation`: `undefined` \| `string` }\>

#### Defined in

[src/index.ts:634](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L634)

---

### getExpectedAddress

▸ **getExpectedAddress**<`Abi`\>(`abi`, `args`): `Promise`<[`Address`](Address.md)\>

Computes contract address from code and init params

---

Required permissions: `basic`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Parameters

| Name   | Type                                                                        |
| :----- | :-------------------------------------------------------------------------- |
| `abi`  | `Abi`                                                                       |
| `args` | [`GetExpectedAddressParams`](../README.md#getexpectedaddressparams)<`Abi`\> |

#### Returns

`Promise`<[`Address`](Address.md)\>

#### Defined in

[src/index.ts:653](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L653)

---

### getStateInit

▸ **getStateInit**<`Abi`\>(`abi`, `args`): `Promise`<{ `address`: [`Address`](Address.md) ; `stateInit`: `string` ; `hash`: `string` }\>

Computes contract address and state from code and init params

---

Required permissions: `basic`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Parameters

| Name   | Type                                                                        |
| :----- | :-------------------------------------------------------------------------- |
| `abi`  | `Abi`                                                                       |
| `args` | [`GetExpectedAddressParams`](../README.md#getexpectedaddressparams)<`Abi`\> |

#### Returns

`Promise`<{ `address`: [`Address`](Address.md) ; `stateInit`: `string` ; `hash`: `string` }\>

#### Defined in

[src/index.ts:664](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L664)

---

### unpackInitData

▸ **unpackInitData**<`Abi`\>(`abi`, `data`): `Promise`<{ `publicKey?`: `string` ; `initParams`: [`DecodedAbiInitData`](../README.md#decodedabiinitdata)<`Abi`\> }\>

Decodes initial contract data using the specified ABI

---

Required permissions: `basic`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `abi`  | `Abi`    |
| `data` | `string` |

#### Returns

`Promise`<{ `publicKey?`: `string` ; `initParams`: [`DecodedAbiInitData`](../README.md#decodedabiinitdata)<`Abi`\> }\>

#### Defined in

[src/index.ts:687](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L687)

---

### packIntoCell

▸ **packIntoCell**<`P`\>(`args`): `Promise`<{ `boc`: `string` ; `hash`: `string` }\>

Creates base64 encoded BOC

---

Required permissions: `basic`

#### Type parameters

| Name | Type                                                                   |
| :--- | :--------------------------------------------------------------------- |
| `P`  | extends readonly [`ReadonlyAbiParam`](../README.md#readonlyabiparam)[] |

#### Parameters

| Name               | Type                                                                  |
| :----------------- | :-------------------------------------------------------------------- |
| `args`             | `Object`                                                              |
| `args.abiVersion?` | [`AbiVersion`](../README.md#abiversion)                               |
| `args.structure`   | `P`                                                                   |
| `args.data`        | [`MergeInputObjectsArray`](../README.md#mergeinputobjectsarray)<`P`\> |

#### Returns

`Promise`<{ `boc`: `string` ; `hash`: `string` }\>

#### Defined in

[src/index.ts:708](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L708)

---

### unpackFromCell

▸ **unpackFromCell**<`P`\>(`args`): `Promise`<{ `data`: [`MergeOutputObjectsArray`](../README.md#mergeoutputobjectsarray)<`P`\> }\>

Decodes base64 encoded BOC

---

Required permissions: `basic`

#### Type parameters

| Name | Type                                                                   |
| :--- | :--------------------------------------------------------------------- |
| `P`  | extends readonly [`ReadonlyAbiParam`](../README.md#readonlyabiparam)[] |

#### Parameters

| Name                | Type                                    |
| :------------------ | :-------------------------------------- |
| `args`              | `Object`                                |
| `args.abiVersion?`  | [`AbiVersion`](../README.md#abiversion) |
| `args.structure`    | `P`                                     |
| `args.boc`          | `string`                                |
| `args.allowPartial` | `boolean`                               |

#### Returns

`Promise`<{ `data`: [`MergeOutputObjectsArray`](../README.md#mergeoutputobjectsarray)<`P`\> }\>

#### Defined in

[src/index.ts:727](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L727)

---

### extractPublicKey

▸ **extractPublicKey**(`boc`): `Promise`<`string`\>

Extracts public key from raw account state

**NOTE:** can only be used on contracts which are deployed and has `pubkey` header

---

Required permissions: `basic`

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `boc` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/index.ts:751](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L751)

---

### codeToTvc

▸ **codeToTvc**(`code`): `Promise`<`string`\>

Converts base64 encoded contract code into tvc with default init data

---

Required permissions: `basic`

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `code` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/index.ts:765](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L765)

---

### mergeTvc

▸ **mergeTvc**(`args`): `Promise`<{ `tvc`: `string` ; `hash`: `string` }\>

Merges code and data into state init

---

Required permissions: `basic`

#### Parameters

| Name        | Type     | Description                  |
| :---------- | :------- | :--------------------------- |
| `args`      | `Object` | -                            |
| `args.code` | `string` | Base64 encoded contract code |
| `args.data` | `string` | Base64 encoded contract data |

#### Returns

`Promise`<{ `tvc`: `string` ; `hash`: `string` }\>

#### Defined in

[src/index.ts:779](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L779)

---

### splitTvc

▸ **splitTvc**(`tvc`): `Promise`<{ `data`: `undefined` \| `string` ; `code`: `undefined` \| `string` }\>

Splits base64 encoded state init into code and data

---

Required permissions: `basic`

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `tvc` | `string` |

#### Returns

`Promise`<{ `data`: `undefined` \| `string` ; `code`: `undefined` \| `string` }\>

#### Defined in

[src/index.ts:790](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L790)

---

### setCodeSalt

▸ **setCodeSalt**<`P`\>(`args`): `Promise`<{ `code`: `string` ; `hash`: `string` }\>

Merges code and data into state init

---

Required permissions: `basic`

#### Type parameters

| Name | Type                                                                   |
| :--- | :--------------------------------------------------------------------- |
| `P`  | extends readonly [`ReadonlyAbiParam`](../README.md#readonlyabiparam)[] |

#### Parameters

| Name   | Type                                                        |
| :----- | :---------------------------------------------------------- |
| `args` | [`SetCodeSaltParams`](../README.md#setcodesaltparams)<`P`\> |

#### Returns

`Promise`<{ `code`: `string` ; `hash`: `string` }\>

#### Defined in

[src/index.ts:803](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L803)

---

### getCodeSalt

▸ **getCodeSalt**(`args`): `Promise`<`undefined` \| `string`\>

Retrieves salt from code. Returns undefined if code doesn't contain salt

---

Required permissions: `basic`

#### Parameters

| Name   | Type                                                  |
| :----- | :---------------------------------------------------- |
| `args` | [`GetCodeSaltParams`](../README.md#getcodesaltparams) |

#### Returns

`Promise`<`undefined` \| `string`\>

#### Defined in

[src/index.ts:823](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L823)

---

### addAsset

▸ **addAsset**<`T`\>(`args`): `Promise`<{ `newAsset`: `boolean` }\>

Adds asset to the selected account

---

Requires permissions: `accountInteraction`

#### Type parameters

| Name | Type                   |
| :--- | :--------------------- |
| `T`  | extends `"tip3_token"` |

#### Parameters

| Name   | Type                                                  |
| :----- | :---------------------------------------------------- |
| `args` | [`AddAssetParams`](../README.md#addassetparams)<`T`\> |

#### Returns

`Promise`<{ `newAsset`: `boolean` }\>

#### Defined in

[src/index.ts:837](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L837)

---

### getTransactions

▸ **getTransactions**(`args`): `Promise`<{ `transactions`: [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\>[] ; `continuation`: `undefined` \| [`TransactionId`](../README.md#transactionid) ; `info?`: [`TransactionsBatchInfo`](../README.md#transactionsbatchinfo) }\>

Requests contract transactions

---

Required permissions: `basic`

**`Sub Category`**

Transactions

#### Parameters

| Name                 | Type                                          | Description                                                |
| :------------------- | :-------------------------------------------- | :--------------------------------------------------------- |
| `args`               | `Object`                                      | -                                                          |
| `args.address`       | [`Address`](Address.md)                       | Contract address                                           |
| `args.continuation?` | [`TransactionId`](../README.md#transactionid) | Id of the transaction from which to request the next batch |
| `args.limit?`        | `number`                                      | Optional limit. Values greater than 50 have no effect      |

#### Returns

`Promise`<{ `transactions`: [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\>[] ; `continuation`: `undefined` \| [`TransactionId`](../README.md#transactionid) ; `info?`: [`TransactionsBatchInfo`](../README.md#transactionsbatchinfo) }\>

#### Defined in

[src/index.ts:866](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L866)

---

### getTransaction

▸ **getTransaction**(`args`): `Promise`<{ `transaction`: `undefined` \| [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\> }\>

Searches transaction by hash

---

Required permissions: `basic`

#### Parameters

| Name        | Type     | Description                  |
| :---------- | :------- | :--------------------------- |
| `args`      | `Object` | -                            |
| `args.hash` | `string` | Hex encoded transaction hash |

#### Returns

`Promise`<{ `transaction`: `undefined` \| [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\> }\>

#### Defined in

[src/index.ts:887](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L887)

---

### sendMessage

▸ **sendMessage**(`args`): `Promise`<{ `transaction`: [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\> }\>

Sends an internal message from the user account.
Shows an approval window to the user.

---

Required permissions: `accountInteraction`

#### Parameters

| Name              | Type                                                                  | Description                                                                                                              |
| :---------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `args`            | `Object`                                                              | -                                                                                                                        |
| `args.sender`     | [`Address`](Address.md)                                               | Preferred wallet address. It is the same address as the `accountInteraction.address`, but it must be explicitly provided |
| `args.recipient`  | [`Address`](Address.md)                                               | Message destination address                                                                                              |
| `args.amount`     | `string`                                                              | Amount of nano EVER to send                                                                                              |
| `args.bounce`     | `boolean`                                                             | Whether to bounce message back on error                                                                                  |
| `args.payload?`   | [`FunctionCall`](../README.md#functioncall)<[`Address`](Address.md)\> | Optional function call                                                                                                   |
| `args.stateInit?` | `string`                                                              | Optional base64 encoded TVC NOTE: If the selected contract do not support this, an error is returned                     |

#### Returns

`Promise`<{ `transaction`: [`Transaction`](../README.md#transaction)<[`Address`](Address.md)\> }\>

#### Defined in

[src/index.ts:906](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L906)

---

### sendMessageDelayed

▸ **sendMessageDelayed**(`args`): `Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

Sends an internal message from the user account without waiting for the transaction.
Shows an approval window to the user.

**`See`**

messageStatusUpdated

---

Required permissions: `accountInteraction`

#### Parameters

| Name              | Type                                                                  | Description                                                                                                              |
| :---------------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `args`            | `Object`                                                              | -                                                                                                                        |
| `args.sender`     | [`Address`](Address.md)                                               | Preferred wallet address. It is the same address as the `accountInteraction.address`, but it must be explicitly provided |
| `args.recipient`  | [`Address`](Address.md)                                               | Message destination address                                                                                              |
| `args.amount`     | `string`                                                              | Amount of nano EVER to send                                                                                              |
| `args.bounce`     | `boolean`                                                             | Whether to bounce message back on error                                                                                  |
| `args.payload?`   | [`FunctionCall`](../README.md#functioncall)<[`Address`](Address.md)\> | Optional function call                                                                                                   |
| `args.stateInit?` | `string`                                                              | Optional base64 encoded TVC NOTE: If the selected contract do not support this, an error is returned                     |

#### Returns

`Promise`<[`DelayedMessageExecution`](../README.md#delayedmessageexecution)\>

#### Defined in

[src/index.ts:936](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L936)

---

### getBocHash

▸ **getBocHash**(`boc`): `Promise`<`string`\>

Computes hash of base64 encoded BOC

---

Required permissions: `basic`

**`Sub Category`**

Cryptography & Security

#### Parameters

| Name  | Type     |
| :---- | :------- |
| `boc` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/index.ts:1026](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1026)

---

### verifySignature

▸ **verifySignature**(`args`): `Promise`<{ `isValid`: `boolean` }\>

#### Parameters

| Name                    | Type                  | Description                                                                                                                                                                                                                                                                                    |
| :---------------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`                  | `Object`              | -                                                                                                                                                                                                                                                                                              |
| `args.publicKey`        | `string`              | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided                                                                                                                                                    |
| `args.dataHash`         | `string`              | Base64 or hex encoded arbitrary bytes hash (data must be 32 bytes long)                                                                                                                                                                                                                        |
| `args.signature`        | `string`              | Base64 or hex encoded signature bytes (data must be 64 bytes long)                                                                                                                                                                                                                             |
| `args.withSignatureId?` | `number` \| `boolean` | Whether to use the signature id during verification (true by default). - If `true`, uses the signature id of the selected network (if the capability is enabled). - If `false`, forces signature check to ignore any signature id. - If `number`, uses the specified number as a signature id. |

#### Returns

`Promise`<{ `isValid`: `boolean` }\>

#### Defined in

[src/index.ts:1035](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1035)

---

### signData

▸ **signData**(`args`): `Promise`<{ `dataHash`: `string` ; `signature`: `string` ; `signatureHex`: `string` ; `signatureParts`: { `high`: `string` ; `low`: `string` } }\>

Signs arbitrary data.

NOTE: hashes data before signing. Use `signDataRaw` to sign without hash.

---

Requires permissions: `accountInteraction`

#### Parameters

| Name                    | Type                  | Description                                                                                                                                                                                                                                                                            |
| :---------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`                  | `Object`              | -                                                                                                                                                                                                                                                                                      |
| `args.publicKey`        | `string`              | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided                                                                                                                                            |
| `args.data`             | `string`              | Base64 encoded arbitrary bytes                                                                                                                                                                                                                                                         |
| `args.withSignatureId?` | `number` \| `boolean` | Whether to use the signature id for signing (true by default). - If `true`, uses the signature id of the selected network (if the capability is enabled). - If `false`, forces signature check to ignore any signature id. - If `number`, uses the specified number as a signature id. |

#### Returns

`Promise`<{ `dataHash`: `string` ; `signature`: `string` ; `signatureHex`: `string` ; `signatureParts`: { `high`: `string` ; `low`: `string` } }\>

#### Defined in

[src/index.ts:1050](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1050)

---

### signDataRaw

▸ **signDataRaw**(`args`): `Promise`<{ `signature`: `string` ; `signatureHex`: `string` ; `signatureParts`: { `high`: `string` ; `low`: `string` } }\>

Signs arbitrary data without hashing it

---

Requires permissions: `accountInteraction`

#### Parameters

| Name                    | Type                  | Description                                                                                                                                                                                                                                                                            |
| :---------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`                  | `Object`              | -                                                                                                                                                                                                                                                                                      |
| `args.publicKey`        | `string`              | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided                                                                                                                                            |
| `args.data`             | `string`              | Base64 encoded arbitrary bytes                                                                                                                                                                                                                                                         |
| `args.withSignatureId?` | `number` \| `boolean` | Whether to use the signature id for signing (true by default). - If `true`, uses the signature id of the selected network (if the capability is enabled). - If `false`, forces signature check to ignore any signature id. - If `number`, uses the specified number as a signature id. |

#### Returns

`Promise`<{ `signature`: `string` ; `signatureHex`: `string` ; `signatureParts`: { `high`: `string` ; `low`: `string` } }\>

#### Defined in

[src/index.ts:1061](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1061)

---

### encryptData

▸ **encryptData**(`args`): `Promise`<[`EncryptedData`](../README.md#encrypteddata)[]\>

Encrypts arbitrary data with specified algorithm for each specified recipient

---

Requires permissions: `accountInteraction`

#### Parameters

| Name                       | Type                 | Description                                                                                                                                 |
| :------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `args`                     | `Object`             | -                                                                                                                                           |
| `args.publicKey`           | `string`             | The public key of the preferred account. It is the same publicKey as the `accountInteraction.publicKey`, but it must be explicitly provided |
| `args.recipientPublicKeys` | `string`[]           | Public keys of recipients. Hex encoded                                                                                                      |
| `args.algorithm`           | `"ChaCha20Poly1305"` | Encryption algorithm. Nonce will be generated for each recipient                                                                            |
| `args.data`                | `string`             | Base64 encoded data                                                                                                                         |

#### Returns

`Promise`<[`EncryptedData`](../README.md#encrypteddata)[]\>

#### Defined in

[src/index.ts:1072](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1072)

---

### decryptData

▸ **decryptData**(`encryptedData`): `Promise`<`string`\>

Decrypts encrypted data. Returns base64 encoded data

---

Requires permissions: `accountInteraction`

#### Parameters

| Name            | Type                                          |
| :-------------- | :-------------------------------------------- |
| `encryptedData` | [`EncryptedData`](../README.md#encrypteddata) |

#### Returns

`Promise`<`string`\>

#### Defined in

[src/index.ts:1084](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1084)
