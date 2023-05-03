[everscale-inpage-provider - v0.3.57](../README.md) / Provider

# Interface: Provider

**`Toc Section`**

1. Interfaces

**`Toc Description`**

Define the structure and expected behavior of the Provider,
Subscription, and other types in the module.

## Table of contents

### Methods

- [request](Provider.md#request)
- [addListener](Provider.md#addlistener)
- [removeListener](Provider.md#removelistener)
- [on](Provider.md#on)
- [once](Provider.md#once)
- [prependListener](Provider.md#prependlistener)
- [prependOnceListener](Provider.md#prependoncelistener)

## Methods

### request

▸ **request**<`T`\>(`data`): `Promise`<[`ProviderApiResponse`](../README.md#providerapiresponse)<`T`, `string`\>\>

Sends request to the provider.

**`Sub Category`**

Request Method

#### Type parameters

| Name | Type                                                                                         |
| :--- | :------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderApi`](../README.md#providerapi)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name   | Type                                                |
| :----- | :-------------------------------------------------- |
| `data` | [`RawProviderRequest`](RawProviderRequest.md)<`T`\> |

#### Returns

`Promise`<[`ProviderApiResponse`](../README.md#providerapiresponse)<`T`, `string`\>\>

#### Defined in

[src/index.ts:61](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L61)

---

### addListener

▸ **addListener**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

Adds a listener for the specified event.

**`Sub Category`**

Event Listener Methods

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:68](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L68)

---

### removeListener

▸ **removeListener**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

Removes a listener for the specified event.

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:72](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L72)

---

### on

▸ **on**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

**`Sub Category`**

Event Management Methods

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:77](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L77)

---

### once

▸ **once**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:78](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L78)

---

### prependListener

▸ **prependListener**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:79](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L79)

---

### prependOnceListener

▸ **prependOnceListener**<`T`\>(`eventName`, `listener`): [`Provider`](Provider.md)

#### Type parameters

| Name | Type                                                                                               |
| :--- | :------------------------------------------------------------------------------------------------- |
| `T`  | extends keyof [`ProviderEvents`](../README.md#providerevents)<[`Address`](../classes/Address.md)\> |

#### Parameters

| Name        | Type                                                                                  |
| :---------- | :------------------------------------------------------------------------------------ |
| `eventName` | `T`                                                                                   |
| `listener`  | (`data`: [`RawProviderEventData`](../README.md#rawprovidereventdata)<`T`\>) => `void` |

#### Returns

[`Provider`](Provider.md)

#### Defined in

[src/index.ts:80](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L80)
