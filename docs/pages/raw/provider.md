---
outline: deep
---

## Provider

### ProviderProperties

Ƭ **ProviderProperties**: `Object`

#### Type declaration

| Name                | Type                                                   | Description                                                                                                                                 |
| :------------------ | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `forceUseFallback?` | `boolean`                                              | Ignore injected provider and try to use `fallback` instead. **`Default`** `ts false `                                                       |
| `fallback?`         | () => `Promise`<[`Provider`](interfaces/Provider.md)\> | Provider factory which will be called if injected provider was not found. Can be used for initialization of the standalone Everscale client |

**Defined in:**

[src/index.ts:89](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L89)

---

### hasEverscaleProvider

▸ **hasEverscaleProvider**(): `Promise`<`boolean`\>

#### Returns

`Promise`<`boolean`\>

**Defined in:**

[src/index.ts:133](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L133)

---

### RawRpcMethod

Ƭ **RawRpcMethod**<`P`\>: [`RawProviderApiRequestParams`](README.md#rawproviderapirequestparams)<`P`\> extends `undefined` ? () => `Promise`<[`RawProviderApiResponse`](README.md#rawproviderapiresponse)<`P`\>\> : (`args`: [`RawProviderApiRequestParams`](README.md#rawproviderapirequestparams)<`P`\>) => `Promise`<[`RawProviderApiResponse`](README.md#rawproviderapiresponse)<`P`\>\>

#### Type parameters

| Name | Type                                                 |
| :--- | :--------------------------------------------------- |
| `P`  | extends [`ProviderMethod`](README.md#providermethod) |

**Defined in:**

[src/index.ts:1160](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1160)

---

### RawProviderApiMethods

Ƭ **RawProviderApiMethods**: { [P in ProviderMethod]: RawRpcMethod<P\> }

**Defined in:**

[src/index.ts:1168](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1168)

---

### GetExpectedAddressParams

Ƭ **GetExpectedAddressParams**<`Abi`\>: `Abi` extends { `data`: infer D } ? { `tvc`: `string` ; `workchain?`: `number` ; `publicKey?`: `string` ; `initParams`: [`MergeInputObjectsArray`](README.md#mergeinputobjectsarray)<`D`\> } : `never`

#### Type parameters

| Name  |
| :---- |
| `Abi` |

**Defined in:**

[src/index.ts:1176](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1176)

---

### SetCodeSaltParams

Ƭ **SetCodeSaltParams**<`P`\>: `Object`

#### Type parameters

| Name | Type                                                                |
| :--- | :------------------------------------------------------------------ |
| `P`  | extends readonly [`ReadonlyAbiParam`](README.md#readonlyabiparam)[] |

#### Type declaration

| Name   | Type                                                                                                                                                                | Description                                           |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------- |
| `code` | `string`                                                                                                                                                            | Base64 encoded contract code                          |
| `salt` | `string` \| { `abiVersion?`: [`AbiVersion`](README.md#abiversion) ; `structure`: `P` ; `data`: [`MergeInputObjectsArray`](README.md#mergeinputobjectsarray)<`P`\> } | Base64 encoded salt (as BOC) or params of boc encoder |

**Defined in:**

[src/index.ts:1201](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1201)

---

### GetCodeSaltParams

Ƭ **GetCodeSaltParams**: `Object`

#### Type declaration

| Name   | Type     | Description                  |
| :----- | :------- | :--------------------------- |
| `code` | `string` | Base64 encoded contract code |

**Defined in:**

[src/index.ts:1231](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1231)

---

### AddAssetParams

Ƭ **AddAssetParams**<`T`\>: `Object`

#### Type parameters

| Name | Type                                       |
| :--- | :----------------------------------------- |
| `T`  | extends [`AssetType`](README.md#assettype) |

#### Type declaration

| Name      | Type                                                 | Description                                                                                                            |
| :-------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `account` | [`Address`](classes/Address.md)                      | Owner's wallet address. It is the same address as the `accountInteraction.address`, but it must be explicitly provided |
| `type`    | `T`                                                  | Which asset to add                                                                                                     |
| `params`  | [`AssetTypeParams`](README.md#assettypeparams)<`T`\> | Asset parameters                                                                                                       |

**Defined in:**

[src/index.ts:1242](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1242)
