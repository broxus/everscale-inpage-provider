# Class: ProviderNotFoundException

## Hierarchy

- `Error`

  ↳ **`ProviderNotFoundException`**

## Table of contents

### Constructors

- [constructor](ProviderNotFoundException.md#constructor)

### Properties

- [prepareStackTrace](ProviderNotFoundException.md#preparestacktrace)
- [stackTraceLimit](ProviderNotFoundException.md#stacktracelimit)
- [cause](ProviderNotFoundException.md#cause)
- [name](ProviderNotFoundException.md#name)
- [message](ProviderNotFoundException.md#message)
- [stack](ProviderNotFoundException.md#stack)

### Methods

- [captureStackTrace](ProviderNotFoundException.md#capturestacktrace)

## Constructors

### constructor

• **new ProviderNotFoundException**()

#### Overrides

Error.constructor

#### Defined in

[src/index.ts:1141](https://github.com/Broxus/everscale-inpage-provider/blob/14e397c/src/index.ts#L1141)

## Properties

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name          | Type         |
| :------------ | :----------- |
| `err`         | `Error`      |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

---

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

---

### cause

• `Optional` **cause**: `unknown`

#### Inherited from

Error.cause

#### Defined in

node_modules/typescript/lib/lib.es2022.error.d.ts:26

---

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1053

---

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1054

---

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1055

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name              | Type       |
| :---------------- | :--------- |
| `targetObject`    | `object`   |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
