# Interface: Subscription<T\>

**`Toc Ref`**

1

## Type parameters

| Name | Type                                                        |
| :--- | :---------------------------------------------------------- |
| `T`  | extends [`ProviderEvent`](../provider-api.md#providerevent) |

## Table of contents

### Properties

- [subscribe](Subscription.md#subscribe)
- [unsubscribe](Subscription.md#unsubscribe)

### Methods

- [on](Subscription.md#on)

## Properties

### subscribe

• **subscribe**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

Can be used to re-subscribe with the same parameters.

##### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:1123](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1123)

---

### unsubscribe

• **unsubscribe**: () => `Promise`<`void`\>

#### Type declaration

▸ (): `Promise`<`void`\>

Unsubscribes the subscription.

##### Returns

`Promise`<`void`\>

#### Defined in

[src/index.ts:1128](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1128)

## Methods

### on

▸ **on**(`eventName`, `listener`): [`Subscription`](Subscription.md)<`T`\>

Fires on each incoming event with the event object as argument.

#### Parameters

| Name        | Type                                                                                                                      | Description |
| :---------- | :------------------------------------------------------------------------------------------------------------------------ | :---------- |
| `eventName` | `"data"`                                                                                                                  | 'data'      |
| `listener`  | (`data`: [`ProviderEventData`](../provider-api.md#providereventdata)<`T`, [`Address`](../classes/Address.md)\>) => `void` |             |

#### Returns

[`Subscription`](Subscription.md)<`T`\>

#### Defined in

[src/index.ts:1102](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1102)

▸ **on**(`eventName`, `listener`): [`Subscription`](Subscription.md)<`T`\>

Fires on successful re-subscription

#### Parameters

| Name        | Type           | Description  |
| :---------- | :------------- | :----------- |
| `eventName` | `"subscribed"` | 'subscribed' |
| `listener`  | () => `void`   |              |

#### Returns

[`Subscription`](Subscription.md)<`T`\>

#### Defined in

[src/index.ts:1110](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1110)

▸ **on**(`eventName`, `listener`): [`Subscription`](Subscription.md)<`T`\>

Fires on unsubscription

#### Parameters

| Name        | Type             | Description    |
| :---------- | :--------------- | :------------- |
| `eventName` | `"unsubscribed"` | 'unsubscribed' |
| `listener`  | () => `void`     |                |

#### Returns

[`Subscription`](Subscription.md)<`T`\>

#### Defined in

[src/index.ts:1118](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1118)
