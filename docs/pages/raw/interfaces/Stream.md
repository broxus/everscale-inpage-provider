[everscale-inpage-provider - v0.3.57](../README.md) / Stream

# Interface: Stream<P, T, F\>

## Type parameters

| Name | Type                        |
| :--- | :-------------------------- |
| `P`  | `P`                         |
| `T`  | `T`                         |
| `F`  | extends `boolean` = `false` |

## Table of contents

### Properties

- [makeProducer](Stream.md#makeproducer)
- [stopProducer](Stream.md#stopproducer)
- [isFinite](Stream.md#isfinite)
- [fold](Stream.md#fold)
- [finished](Stream.md#finished)

### Methods

- [delayed](Stream.md#delayed)
- [first](Stream.md#first)
- [on](Stream.md#on)
- [merge](Stream.md#merge)
- [enumerate](Stream.md#enumerate)
- [tap](Stream.md#tap)
- [filter](Stream.md#filter)
- [filterMap](Stream.md#filtermap)
- [map](Stream.md#map)
- [flatMap](Stream.md#flatmap)
- [skip](Stream.md#skip)
- [skipWhile](Stream.md#skipwhile)
- [take](Stream.md#take)
- [takeWhile](Stream.md#takewhile)
- [takeWhileMap](Stream.md#takewhilemap)

## Properties

### makeProducer

• `Readonly` **makeProducer**: (`onData`: (`data`: `P`) => `Promise`<`boolean`\>, `onEnd`: (`eof`: `boolean`) => `void`) => `Promise`<`void`\>

#### Type declaration

▸ (`onData`, `onEnd`): `Promise`<`void`\>

##### Parameters

| Name     | Type                                   |
| :------- | :------------------------------------- |
| `onData` | (`data`: `P`) => `Promise`<`boolean`\> |
| `onEnd`  | (`eof`: `boolean`) => `void`           |

##### Returns

`Promise`<`void`\>

#### Defined in

[src/stream.ts:295](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L295)

---

### stopProducer

• `Readonly` **stopProducer**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/stream.ts:296](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L296)

---

### isFinite

• `Readonly` **isFinite**: `F`

#### Defined in

[src/stream.ts:297](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L297)

---

### fold

• **fold**: `F` extends `true` ? <B\>(`init`: `B`, `f`: (`init`: `B`, `item`: `T`) => `B` \| `Promise`<`B`\>) => `Promise`<`B`\> : `never`

Folds every element into an accumulator by applying an operation, returning the final result

#### Defined in

[src/stream.ts:312](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L312)

---

### finished

• **finished**: `F` extends `true` ? () => `Promise`<`void`\> : `never`

Waits until the end of the stream

#### Defined in

[src/stream.ts:317](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L317)

## Methods

### delayed

▸ **delayed**<`R`\>(`f`): `Promise`<() => `R`\>

Waits until contract subscription is ready and then returns a promise with the result

#### Type parameters

| Name |
| :--- |
| `R`  |

#### Parameters

| Name | Type                                                            |
| :--- | :-------------------------------------------------------------- |
| `f`  | (`stream`: `Delayed`<`P`, `T`, `F`\>) => `DelayedPromise`<`R`\> |

#### Returns

`Promise`<() => `R`\>

#### Defined in

[src/stream.ts:302](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L302)

---

### first

▸ **first**(): `Promise`<`F` extends `true` ? `undefined` \| `T` : `T`\>

Waits for the first element or the end of the stream

#### Returns

`Promise`<`F` extends `true` ? `undefined` \| `T` : `T`\>

#### Defined in

[src/stream.ts:307](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L307)

---

### on

▸ **on**(`handler`): `void`

Executes handler on each item

#### Parameters

| Name      | Type                                          |
| :-------- | :-------------------------------------------- |
| `handler` | (`item`: `T`) => `void` \| `Promise`<`void`\> |

#### Returns

`void`

#### Defined in

[src/stream.ts:322](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L322)

---

### merge

▸ **merge**<`F1`\>(`other`): [`Stream`](Stream.md)<`P`, `T`, `BothFinite`<`F`, `F1`\>\>

Merges two streams

#### Type parameters

| Name | Type              |
| :--- | :---------------- |
| `F1` | extends `boolean` |

#### Parameters

| Name    | Type                                   |
| :------ | :------------------------------------- |
| `other` | [`Stream`](Stream.md)<`P`, `T`, `F1`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `BothFinite`<`F`, `F1`\>\>

#### Defined in

[src/stream.ts:327](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L327)

---

### enumerate

▸ **enumerate**(): [`Stream`](Stream.md)<`P`, { `index`: `number` ; `item`: `T` }, `F`\>

Creates a stream which gives the current iteration count as well as the value

#### Returns

[`Stream`](Stream.md)<`P`, { `index`: `number` ; `item`: `T` }, `F`\>

#### Defined in

[src/stream.ts:332](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L332)

---

### tap

▸ **tap**(`handler`): [`Stream`](Stream.md)<`P`, `T`, `F`\>

Alias for the `.map((item) => { f(item); return item; })`

#### Parameters

| Name      | Type                                          |
| :-------- | :-------------------------------------------- |
| `handler` | (`item`: `T`) => `void` \| `Promise`<`void`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `F`\>

#### Defined in

[src/stream.ts:337](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L337)

---

### filter

▸ **filter**(`f`): [`Stream`](Stream.md)<`P`, `T`, `F`\>

Skip elements where `f(item) == false`

#### Parameters

| Name | Type                                                |
| :--- | :-------------------------------------------------- |
| `f`  | (`item`: `T`) => `boolean` \| `Promise`<`boolean`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `F`\>

#### Defined in

[src/stream.ts:342](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L342)

---

### filterMap

▸ **filterMap**<`U`\>(`f`): [`Stream`](Stream.md)<`P`, `U`, `F`\>

Modifies items and skip all `undefined`

#### Type parameters

| Name |
| :--- |
| `U`  |

#### Parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `f`  | (`item`: `T`) => `undefined` \| `U` \| `Promise`<`undefined` \| `U`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `U`, `F`\>

#### Defined in

[src/stream.ts:347](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L347)

---

### map

▸ **map**<`U`\>(`f`): [`Stream`](Stream.md)<`P`, `U`, `F`\>

Modifies items

#### Type parameters

| Name |
| :--- |
| `U`  |

#### Parameters

| Name | Type                                    |
| :--- | :-------------------------------------- |
| `f`  | (`item`: `T`) => `U` \| `Promise`<`U`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `U`, `F`\>

#### Defined in

[src/stream.ts:352](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L352)

---

### flatMap

▸ **flatMap**<`U`\>(`f`): [`Stream`](Stream.md)<`P`, `U`, `F`\>

Creates an iterator that flattens nested structure

#### Type parameters

| Name |
| :--- |
| `U`  |

#### Parameters

| Name | Type                                        |
| :--- | :------------------------------------------ |
| `f`  | (`item`: `T`) => `U`[] \| `Promise`<`U`[]\> |

#### Returns

[`Stream`](Stream.md)<`P`, `U`, `F`\>

#### Defined in

[src/stream.ts:357](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L357)

---

### skip

▸ **skip**(`n`): [`Stream`](Stream.md)<`P`, `T`, `F`\>

Creates an iterator that skips the first n elements

#### Parameters

| Name | Type     |
| :--- | :------- |
| `n`  | `number` |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `F`\>

#### Defined in

[src/stream.ts:362](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L362)

---

### skipWhile

▸ **skipWhile**(`f`): [`Stream`](Stream.md)<`P`, `T`, `F`\>

Creates an iterator that skips elements based on a predicate

#### Parameters

| Name | Type                                                |
| :--- | :-------------------------------------------------- |
| `f`  | (`item`: `T`) => `boolean` \| `Promise`<`boolean`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `F`\>

#### Defined in

[src/stream.ts:367](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L367)

---

### take

▸ **take**(`n`): [`Stream`](Stream.md)<`P`, `T`, `true`\>

Creates an iterator that yields the first n elements, or fewer if the underlying iterator ends sooner

#### Parameters

| Name | Type     |
| :--- | :------- |
| `n`  | `number` |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `true`\>

#### Defined in

[src/stream.ts:372](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L372)

---

### takeWhile

▸ **takeWhile**(`f`): [`Stream`](Stream.md)<`P`, `T`, `true`\>

Creates an iterator that yields elements based on a predicate

#### Parameters

| Name | Type                                                |
| :--- | :-------------------------------------------------- |
| `f`  | (`item`: `T`) => `boolean` \| `Promise`<`boolean`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `T`, `true`\>

#### Defined in

[src/stream.ts:377](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L377)

---

### takeWhileMap

▸ **takeWhileMap**<`U`\>(`f`): [`Stream`](Stream.md)<`P`, `U`, `true`\>

Creates an iterator that yields mapped elements based on a predicate until first `undefined` is found

#### Type parameters

| Name |
| :--- |
| `U`  |

#### Parameters

| Name | Type                                                                  |
| :--- | :-------------------------------------------------------------------- |
| `f`  | (`item`: `T`) => `undefined` \| `U` \| `Promise`<`undefined` \| `U`\> |

#### Returns

[`Stream`](Stream.md)<`P`, `U`, `true`\>

#### Defined in

[src/stream.ts:382](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/stream.ts#L382)
