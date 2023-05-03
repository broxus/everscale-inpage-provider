[everscale-inpage-provider - v0.3.57](../README.md) / AddressLiteral

# Class: AddressLiteral<T\>

## Type parameters

| Name | Type             |
| :--- | :--------------- |
| `T`  | extends `string` |

## Hierarchy

- [`Address`](Address.md)

  ↳ **`AddressLiteral`**

## Table of contents

### Constructors

- [constructor](AddressLiteral.md#constructor)

### Methods

- [toString](AddressLiteral.md#tostring)
- [toJSON](AddressLiteral.md#tojson)
- [equals](AddressLiteral.md#equals)

## Constructors

### constructor

• **new AddressLiteral**<`T`\>(`address`)

#### Type parameters

| Name | Type             |
| :--- | :--------------- |
| `T`  | extends `string` |

#### Parameters

| Name      | Type                                   |
| :-------- | :------------------------------------- |
| `address` | `AddressImpl`<`T`, `Lowercase`<`T`\>\> |

#### Overrides

[Address](Address.md).[constructor](Address.md#constructor)

#### Defined in

[src/utils.ts:73](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L73)

## Methods

### toString

▸ **toString**(): `string`

#### Returns

`string`

#### Inherited from

[Address](Address.md).[toString](Address.md#tostring)

#### Defined in

[src/utils.ts:38](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L38)

---

### toJSON

▸ **toJSON**(): `string`

#### Returns

`string`

#### Inherited from

[Address](Address.md).[toJSON](Address.md#tojson)

#### Defined in

[src/utils.ts:42](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L42)

---

### equals

▸ **equals**(`other`): `boolean`

#### Parameters

| Name    | Type                                |
| :------ | :---------------------------------- |
| `other` | `string` \| [`Address`](Address.md) |

#### Returns

`boolean`

#### Inherited from

[Address](Address.md).[equals](Address.md#equals)

#### Defined in

[src/utils.ts:46](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/utils.ts#L46)
