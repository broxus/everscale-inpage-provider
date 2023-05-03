---
outline: deep
---

## Utils

### UniqueArray

Ƭ **UniqueArray**<`T`\>: `T` extends readonly [infer X, ...(infer Rest)] ? `InArray`<`Rest`, `X`\> extends `true` ? [``"Encountered value with duplicates:"``, `X`] : readonly [`X`, ...UniqueArray<Rest\>] : `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

**Defined in:**

[src/utils.ts:6](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L6)

---

### CheckAddress

Ƭ **CheckAddress**<`T`\>: `AddressImpl`<`T`, `Lowercase`<`T`\>\>

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `T`  | extends `string` |

**Defined in:**

[src/utils.ts:81](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L81)

---

### LT_COLLATOR

• `Const` **LT_COLLATOR**: `Intl.Collator`

**Defined in:**

[src/utils.ts:262](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L262)

---

### mergeTransactions

▸ **mergeTransactions**<`Addr`\>(`knownTransactions`, `newTransactions`, `info`): [`Transaction`](models.md#transaction)<`Addr`\>[]

Modifies knownTransactions array, merging it with new transactions.
All arrays are assumed to be sorted by descending logical time.

> Note! This method does not remove duplicates.

#### Type parameters

| Name   |
| :----- |
| `Addr` |

#### Parameters

| Name                | Type                                                       |
| :------------------ | :--------------------------------------------------------- |
| `knownTransactions` | [`Transaction`](models.md#transaction)<`Addr`\>[]          |
| `newTransactions`   | [`Transaction`](models.md#transaction)<`Addr`\>[]          |
| `info`              | [`TransactionsBatchInfo`](models.md#transactionsbatchinfo) |

#### Returns

[`Transaction`](models.md#transaction)<`Addr`\>[]

**Defined in:**

[src/utils.ts:276](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L276)
