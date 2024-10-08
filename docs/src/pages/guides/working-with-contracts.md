---
title: Everscale Inpage Provider
outline: deep
---

# Contract Interaction

An `active` account is similar to an instance of a class, where smart-contract code is a class definition and persistent data
is a state of all instance variables. Thus, to read the contract variables you can either decode account data or
call some getters on it. As in system languages, reading variables from a memory representation of a structure is
a tricky idea, in contracts it also depends on how these variables are packed. Therefore, **interaction with smart contracts
is done using some function calls**.

You can interact with contract locally (e.g. getters) or on-chain. Each provider must have a VM and executor that is consistent with those of the validators.
Therefore, during getters execution, RPC is used only to obtain the contract state, which can be reused.
To execute method on-chain you can send an external message or an internal (through the selected wallet).
The result of the on-chain method execution can be obtained by parsing a transaction with it.

## Contract ABI

To be able to interact with contract, you must know its structure or the methods it implements. In blockchain, all compilers
produce JSON ABI with the description of data, methods and events.

```typescript
type Abi = {
  // Legacy major version definition
  'ABI version': 2;
  // Full ABI version definition (`major.minor`)
  version?: string;
  // Required headers
  header: AbiType[];
  // Function interfaces
  functions: AbiFunction[];
  // Event interfaces
  events: AbiEvent[];
  // State init variables
  data: (AbiType & { key: number })[];
};
```

### Components

_For a full description, please refer to [the ABI specification](https://github.com/tonlabs/ton-labs-abi/tree/master/docs)._

::: details Types

At a basic level everything in blockchain is a _cell_. Each _cell_ consists of up to **1023 data bits** and **up to 4 references** to other cells.

| Name          | Description                                                                                                                                                      | Representation in cell                                                                                                | Abi version |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- |
| `bool`        | Boolean type                                                                                                                                                     | 1 bit                                                                                                                 | ^1.0        |
| `intN`        | Fixed-sized signed integer, where `N` is a bit length<br /><br />e.g. `int8`, `int32`, `int256`, ..                                                              | `N` bits                                                                                                              | ^1.0        |
| `uintN`       | Fixed-sized unsigned integer, where `N` is a bit length<br /><br />e.g. `uint8`, `uint32`, ..                                                                    | `N` bits                                                                                                              | ^1.0        |
| `varintN`     | Variable-length signed integer. Bit length is between `log2(N)` and `8*(N-1)` where `N` is either **16** or **32**<br /><br />e.g. `varint16`, `varint32`.       | `4+len*8` bits for `varint16` or `5+len*8` bits for `varuint32` where `len` is first 4 or 5 bits                      | ^2.1        |
| `varuintN`    | Variable-length unsigned integer. Bit length is between `log2(N)` and `8*(N-1)` where `N` is either **16** or **32**<br /><br />e.g. `varint16`, `varint32`.     | Same as `varintN`                                                                                                     | ^2.1        |
| `cell`        | TVM cell                                                                                                                                                         | Cell reference                                                                                                        | ^1.0        |
| `address`     | Contract address                                                                                                                                                 | 267 bits (usually)                                                                                                    | ^1.0        |
| `bytes`       | Byte array                                                                                                                                                       | A cell reference. This cell contains bytes, aligned to 8 bits with continuation in further references with same align | ^1.0        |
| `fixedbytesN` | Fixed bytes array of length `N` (up to **32**)                                                                                                                   | `N*8` bits                                                                                                            | ^1.0        |
| `string`      | Byte array which is required to be a valid UTF-8 sequence                                                                                                        | Same as `bytes`                                                                                                       | ^2.1        |
| `optional(T)` | Can store a valut of `T` type or be empty.<br/><br/>e.g. `optional(string)`                                                                                      | 1 bit flag, if it is set then `T` itself                                                                              | ^2.1        |
| `tuple`       | A product of types.<br/><br/>e.g. `(uint256,bool,cell)`<br/><br/>NOTE: Requires `components` field in JSON ABI.                                                  | Same as a sequence of inner types                                                                                     | ^1.0        |
| `map(K,V)`    | Dictionary with key type `K` and value type `V`.<br/><br/>e.g. `map(uint32,address)`<br/><br/>NOTE: `K` can only be a type which can be represented in one cell. | 1 bit flag, if it is set then cell with dictionary                                                                    | ^1.0        |
| `T[]`         | Array of type `T`.<br/><br/>e.g. `uint256[]`                                                                                                                     | 32 bits of array length, then `map(uint32,T)`                                                                         | ^1.0        |
| `ref(T)`      | Data of type `T`, but stored in a reference (cell).<br/><br/>e.g. `ref((uint32,address))`                                                                        | Cell reference                                                                                                        | ^2.2        |

In JSON ABI, types are described as follows:

```typescript
type AbiType = {
  // Each parameter must have its own name
  name: string;
  // Concrete type from the table above
  type: string;
  // Tuple components if it is used in `type`
  components?: ParamType[];
};
```

:::

::: details Functions

In general, function calls are stored in message body, and encoded as `function ID` + `encoded arguments`,
where `function ID` is the first 32 bits of **sha256** of the function signature. However, external messages must contain
a prefix with optional signature and encoded headers.

In JSON ABI, functions are described as follows:

```typescript
type AbiFunction = {
  // Each function in contract must have its own unique name
  name: string;
  // Function arguments
  inputs: AbiType[];
  // Function output types (it can return several values of different types)
  outputs: AbiType[];
  // Optional explicit function id
  id?: string;
};
```

:::

::: details Events

Events are similar to functions, but they can only exist as an external outgoing message and doesn't
have anything other than arguments. They are used to provide additional info during the
transaction execution.

In JSON ABI, events are described as follows:

```typescript
type AbiEvent = {
  // Each event in contract must have its own unique name
  name: string;
  // Event arguments
  inputs: AbiType[];
  // Optional explicit event id
  id?: string;
};
```

:::

### Declaration

Let's go back to the code and declare the ABI of our contract:

```typescript
const exampleAbi = {
  'ABI version': 2,
  version: '2.3',
  header: ['time'],
  functions: [
    {
      name: 'constructor',
      inputs: [
        { name: 'someParam', type: 'uint128' },
        { name: 'second', type: 'string' },
      ],
      outputs: [],
    },
    {
      name: 'getComplexState',
      inputs: [],
      outputs: [
        {
          components: [
            { name: 'first', type: 'uint32' },
            { name: 'second', type: 'string' },
          ],
          name: 'value0',
          type: 'tuple',
        },
      ],
    },
    {
      name: 'setVariable',
      inputs: [{ name: 'someParam', type: 'uint128' }],
      outputs: [{ name: 'value0', type: 'uint32' }],
    },
    {
      name: 'setVariableExternal',
      inputs: [{ name: 'someParam', type: 'uint128' }],
      outputs: [],
    },
    {
      name: 'getSecondElementWithPrefix',
      inputs: [{ name: 'prefix', type: 'string' }],
      outputs: [{ name: 'value0', type: 'string' }],
    },
    {
      name: 'computeSmth',
      inputs: [
        { name: 'answerId', type: 'uint32' },
        { name: 'offset', type: 'uint32' },
      ],
      outputs: [
        {
          components: [
            { name: 'first', type: 'uint32' },
            { name: 'second', type: 'string' },
          ],
          name: 'res',
          type: 'tuple',
        },
      ],
    },
    {
      name: 'simpleState',
      inputs: [],
      outputs: [{ name: 'simpleState', type: 'uint128' }],
    },
  ],
  data: [{ key: 1, name: 'nonce', type: 'uint32' }],
  events: [
    {
      name: 'StateChanged',
      inputs: [
        {
          components: [
            { name: 'first', type: 'uint32' },
            { name: 'second', type: 'string' },
          ],
          name: 'complexState',
          type: 'tuple',
        },
      ],
      outputs: [],
    },
  ],
  fields: [
    { name: '_pubkey', type: 'uint256' },
    { name: '_timestamp', type: 'uint64' },
    { name: '_constructorFlag', type: 'bool' },
    { name: 'nonce', type: 'uint32' },
    { name: 'simpleState', type: 'uint128' },
    {
      components: [
        { name: 'first', type: 'uint32' },
        { name: 'second', type: 'string' },
      ],
      name: 'complexState',
      type: 'tuple',
    },
  ],
} as const; // NOTE: `as const` is very important here
```

To fully utilize the features of this library, it is important to declare ABI as a const object with a const type (which should be declared using `as const`.

Unfortunately, this approach has drawbacks that have to
be tolerated for now **(you can't import JSON as a const type, [issue #32063](https://github.com/microsoft/TypeScript/issues/32063))**

### Code of ExampleContract

::: details Code of the contract

```solidity
pragma ever-solidity >=0.66;

// Define a custom struct `ComplexType` with two properties.
struct ComplexType {
	uint32 first;
	string second;
}

contract ExampleContract {
	uint32 static nonce;

	uint128 public simpleState;
	ComplexType complexState;

	// A modifier that refunds the sender after the function call.
	modifier cashBack() {
		tvm.rawReserve(address(this).balance - msg.value, 2);
		_;
		msg.sender.transfer({ value: 0, flag: 129 });
	}

	// Event emitted when the complexState is changed.
	event StateChanged(ComplexType complexState);

	// Constructor to initialize the contract state.
	constructor(uint128 someParam, string second) public {
		tvm.accept();
		simpleState = someParam;
		complexState = ComplexType(uint32(someParam % 1000), second);
	}

	// Function to get the current complexState.
	function getComplexState() external view returns (ComplexType) {
		return complexState;
	}

	// Function to set a new value for simpleState and complexState.first, refunds the sender after the call.
	function setVariable(uint128 someParam) public cashBack returns (uint32) {
		return _setVariable(someParam);
	}

	// Function to set a new value for `simpleState` and `complexState.first`.
	function setVariableExternal(uint128 someParam) public {
		tvm.accept();
		_setVariable(someParam);
	}

	// Internal function to update `simpleState` and `complexState.first`, and emit the `StateChanged` event.
	function _setVariable(uint128 someParam) internal returns (uint32) {
		simpleState = someParam;
		complexState.first = uint32(someParam % 1000);
		emit StateChanged(complexState);
		return complexState.first;
	}

	// Function to concatenate a given prefix with the `complexState.second` value.
	function getSecondElementWithPrefix(string prefix) external view returns (string) {
		return prefix + complexState.second;
	}

	// Function to compute and return an updated `ComplexType` value based on the given offset.
	function computeSmth(
		uint32 offset
	) external view responsible returns (ComplexType res) {
		require(offset < 1000, 1337);
		res.first = complexState.first + offset;
		res.second = complexState.second;
		return {value: 0, flag: 68, bounce: false} complexState;
	}
}


```

:::

## Contract Wrapper

Contract
wrapper ([`ProviderRpcClient.Contract`](https://broxus.github.io/everscale-inpage-provider/classes/ProviderRpcClient.html#Contract))
is a preferred way to interact with contracts. It is tied to a specific address, it has a bunch of helpers and a proxy object with all
methods.
Construction doesn't make any requests or subscriptions (since this object doesn't have any state),
however it serializes the provided ABI object, so you shouldn't create it in tight loops.

```typescript
import { Address } from 'everscale-inpage-provider';

const exampleAddress = new Address(
  '0:06c404998bb4a6f5cfe465939e3e3562ed573e27f7906355b1a9e1cf61f5ba2e',
);
const example = new provider.Contract(exampleAbi, exampleAddress);
```

::: info
An [`Address`](https://broxus.github.io/everscale-inpage-provider/classes/Address.html) objects are used throughout the code instead of plain strings to prevent potential errors. However, requests
through [`rawApi`](https://broxus.github.io/everscale-inpage-provider/classes/ProviderRpcClient.html#rawApi)
use strings as it is a Proxy object which directly communicates with underlying provider object via JRPC.

Btw, if you have some hardcoded constant address you should better
use [`AddressLiteral`](https://broxus.github.io/everscale-inpage-provider/classes/AddressLiteral.html)
which checks the provided string at compile time.
:::

## Reading contract

In most contracts all publicly visible data should be accessed by getters. They don't require user interaction,
and only rely on `basic` permission, so they can be used even without extension via standalone client.

Contract wrapper has a [`methods`](https://broxus.github.io/everscale-inpage-provider/classes/Contract.html#methods) Proxy
object which contains all functions as properties. To execute a getter, you should first prepare its arguments and
then execute the [`call`](https://broxus.github.io/everscale-inpage-provider/interfaces/ContractMethod.html#call)
method on the prepared object.

### Simple getters

This type of getters is executed locally by simulating external message call and parsing external outgoing messages.

```typescript
// Optionally request account state
const state = await provider.getFullContractState(exampleAddress);

// Simple getter without any parameters
const complexState = await example.methods.getComplexState().call({
  // You can call several getters "atomicly" on a single contract state
  cachedState: state,
});

// Another getter, but with parameters
const prefixedSecond = await example.methods
  .getSecondElementWithPrefix({
    // Arguments have the same type as described in ABI,
    // but merged into one object by `name`
    prefix: : 'foo',
  })
  .call({
    // NOTE: It will request the state itself if it is not specified
    cachedState: state,
  });
```

<GetComplexStateAndPrefixedSecondComponent />

### Responsible methods

This type of methods can either be called via internal message or locally as a getter via external message. It differs from
simple getters as it has additional argument of type `uint32` which is usually called `answerId`.

- When it is called on-chain, it returns the result in outgoing internal message to the caller with `answerId` as a function id.
- When it is called locally, it behaves the same way as simple getters. However, in this library you could call these methods
  with an additional `responsible: true` flag which executes them locally as internal messages. This allows you to skip headers and use the same function signature for contracts with different header configurations.

```typescript
const computedResult = await example.methods
  .computeSmth({
    offset: : 1200,
    answerId: 13,
  })
  .call({
    responsible: true,
  });
const { value0: nonce } = await example.methods.getNonce({ answerId: 42 })
  .call({ responsible: true });

console.log(`Computed State: ${nonce}`);
```

<ComputeSmthComponent />

### Fetching Contract Fields

Another crucial method for interacting with contracts is `getFields`. This method allows you to unpack all fields from the contract's state using the specified ABI.

This method requires `basic` permissions.

Example of usage:

```typescript
// Unpack all fields from contract state
const { fields, state } = await example.getFields();
console.log(fields); // display all unpacked fields

// Unpacking fields using cached state
const cachedState = await provider.getFullContractState(
  exampleAddress,
);
const fieldsFromCachedState = await example.getFields({
  cachedState,
});
console.log(fieldsFromCachedState);

// Unpacking fields with allowing partial results
//if something is left in a cell after unpacking
const partialFields = await example.getFields({ allowPartial: true });
console.log(partialFields);
```

<GetFieldsComponent />

The `getFields` method is particularly useful for quickly acquiring information about a contract's state without having to call each getter individually. It can significantly simplify the process of reading data from a contract, especially for contracts with numerous fields.

::: warning
It's worth noting that using `getFields` is recommended primarily for testing purposes, as you will need to update the ABI in case of a contract upgrade. Otherwise, using individual getters might be a safer and more convenient option.
:::

### TVM Exceptions

There can be exceptions during local contract execution. They may arise either due to an incorrect function signature
or due to some checks in contract code. If an exception code is less than 100, then it is likely due to an incorrect ABI
or signature or something else. Otherwise, it is an exception from the contract code, and you can find the reason if you
have that code.

You can catch TVM exceptions using [`TvmException`](https://broxus.github.io/everscale-inpage-provider/classes/TvmException.html) class.
Although there might be some situations when execution fails due to a TVM exception, but other exception is thrown - in that
case it is more likely due to incorrect input or contract state.

```typescript
import { TvmException } from 'everscale-inpage-provider';

try {
  const computedSmth = await example.methods
    .computeSmth({
      // Offset is greater than 1000, so it will throw an exception
      offset: 1444,
    })
    .call();
} catch (e) {
  if (e instanceof TvmException) {
    console.log(`TVM Exception: ${e.code}`);
  } else {
    // Re-throw it othersise
    throw e;
  }
}
```

<TvmExceptionComponent />

::: details Known TVM Exceptions

#### Basic exceptions

_Please refer to [the whitepaper](https://test.ton.org/tvm.pdf) 4.5.7_

| Code | Name              | Definition                                                                                                                       |
| ---- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2    | Stack underflow   | Not enough arguments in the stack for a primitive                                                                                |
| 3    | Stack overflow    | More values have been stored on a stack than allowed by this version of TVM                                                      |
| 4    | Integer overflow  | Integer does not fit into expected range (by default −2<sup>256</sup> ≤ x < 2<sup>256</sup>), or a division by zero has occurred |
| 5    | Range check error | Integer out of expected range                                                                                                    |
| 6    | Invalid opcode    | Instruction or its immediate arguments cannot be decoded                                                                         |
| 7    | Type check error  | An argument to a primitive is of incorrect value type                                                                            |
| 8    | Cell overflow     | Error in one of the serialization primitives                                                                                     |
| 9    | Cell underflow    | Deserialization error                                                                                                            |
| 10   | Dictionary error  | Error while deserializing a dictionary object                                                                                    |
| 11   | Unknown error     | Unknown error, may be thrown by user programs                                                                                    |
| 12   | Fatal error       | Thrown by TVM in situations deemed impossible                                                                                    |
| 13   | Out of gas        | Thrown by TVM when the remaining gas (g r ) becomes negative                                                                     |

#### Solidity exceptions

_Please refer to [the docs](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#solidity-runtime-errors)_

| Code | Definition                                                                                                                                                                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40   | External inbound message has an invalid signature. See [`tvm.pubkey()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmpubkey) and [`msg.pubkey()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#msgpubkey). |
| 50   | Array index or index of [`<mapping>.at()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#mappingat) is out of range.                                                                                                                  |
| 51   | Contract's constructor has already been called.                                                                                                                                                                                                             |
| 52   | Replay protection exception. See `timestamp` in [pragma AbiHeader](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#pragma-abiheader).                                                                                                   |
| 53   | See [`<address>.unpack()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#addressunpack).                                                                                                                                              |
| 54   | `<array>.pop` call for an empty array.                                                                                                                                                                                                                      |
| 55   | See [`tvm.insertPubkey()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvminsertpubkey).                                                                                                                                            |
| 57   | External inbound message is expired. See `expire` in [pragma AbiHeader](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#pragma-abiheader).                                                                                              |
| 58   | External inbound message has no signature but has public key. See `pubkey` in [pragma AbiHeader](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#pragma-abiheader).                                                                     |
| 60   | Inbound message has wrong function id. In the contract there are no functions with such function id and there is no fallback function that could handle the message.                                                                                        |
| 61   | Deploying StateInit has no public key in data field.                                                                                                                                                                                                        |
| 62   | Reserved for internal usage.                                                                                                                                                                                                                                |
| 63   | See [`<optional(Type)>.get()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#optionaltypeget).                                                                                                                                        |
| 64   | [`tvm.buildExtMSg()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#tvmbuildextmsg) call with wrong parameters.                                                                                                                       |
| 65   | Call of the unassigned variable of function type. See [Function type](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#function-type).                                                                                                   |
| 66   | Convert an integer to a string with width less than number length. See [`format()`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#format).                                                                                            |
| 67   | See [`gasToValue`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#gastovalue) and [`valueToGas`](https://github.com/tonlabs/TON-Solidity-Compiler/blob/master/API.md#valuetogas).                                                      |
| 68   | There is no config parameter 20 or 21.                                                                                                                                                                                                                      |
| 69   | Zero to the power of zero calculation.                                                                                                                                                                                                                      |
| 70   | `string` method `substr` was called with substr longer than the whole string.                                                                                                                                                                               |
| 71   | Function marked by `externalMsg` was called by internal message.                                                                                                                                                                                            |
| 72   | Function marked by internalMsg was called by external message.                                                                                                                                                                                              |
| 73   | The value can't be converted to enum type.                                                                                                                                                                                                                  |
| 74   | Await answer message has wrong source address.                                                                                                                                                                                                              |
| 75   | Await answer message has wrong function id.                                                                                                                                                                                                                 |
| 76   | Public function was called before constructor.                                                                                                                                                                                                              |

:::

## Sending Messages

To learn more about these messages, you can refer to the [Overview](./../index.md).

### External Msg

External messages are used for calling functions in smart contracts from off-chain applications. To send an external message, you should use the contract wrapper, which provides a convenient way to interact with contracts. To call a function in a contract, use the following syntax:

```typescript
// Call the `setVariableExternal` function on the example contract
// with `someParam` as the parameter
const tx = await exampleContract.methods
  .setVariableExternal({ someParam: 42 })
  .sendExternal({
    publicKey: senderPublicKey,
  });

console.log('Transaction:', tx);
```

<Suspense>
  <SendExternalMessageComponent />
</Suspense>

#### Delayed Msg

```typescript
const { transaction, messageHash, expireAt } =
  await exampleContract.methods
    .setVariableExternal({ someParam: this.someParam })
    .sendExternalDelayed({
      publicKey: senderPublicKey!,
    });

console.log('Message hash:', messageHash);
console.log('Expire at:', expireAt);

transaction.then(() => {
  console.log('Transaction:', transaction);
});
```

<Suspense>
  <SendExternalDelayedMessageComponent />
</Suspense>

### Internal Msg

There are two ways to send internal messages in the blockchain: through the `provider.Contract` instance using the send method or using the `Provider.sendMessage` method. Both methods have their unique features, and developers should choose the one that best fits their needs.

1. Sending Internal Messages Through the Contract Instance
   To send an internal message through the contract instance, you need to call the contract's method directly and invoke the send method on the contract instance. The required parameters for this method are defined in the `SendInternalParams` type.

2. Using `Provider.sendMessage`
   This method provides a higher level of abstraction and flexibility, allowing developers to work with the provider directly instead of the contract instance. The required parameters for this method are defined in the `ProviderApiRequestParams` type.

```typescript
// 1. Using the contract instance
const { transaction } = await exampleContract.methods
  .setVariableInternal({ someParam: 42 })
  .send({
    from: senderAddress,
    value: 1 * 10 ** 9,
    bounce: true,
  });

// 2. Using the provider
// Define the payload for the internal message,
// including ABI, method, params, and flags
const payload = {
  abi: JSON.stringify(exampleAbi),
  method: 'setVariable',
  params: {
    someParam: 42,
  },
};

// Use provider.sendMessage to send an internal message
// with the specified sender, recipient, amount, bounce flag, and payload
const { transaction } = await provider.sendMessage({
  sender: senderAddress,
  recipient: exampleAddress,
  amount: 1 * 10 ** 9, // 1 Native coin
  bounce: true,
  payload: payload,
});

console.log('Transaction:', transaction);
```

<Suspense>
  <SendInternalMessageComponent />
</Suspense>

#### Comparison and Differences

Both methods achieve the same goal of sending internal messages. However, there are some differences between them:

1. **Abstraction Level**: The `provider.Contract.send` method offers a lower level of abstraction, allowing developers to work directly with the contract instance and its methods. On the other hand, the `ProviderRpcClient.sendMessage` method provides a higher level of abstraction, allowing developers to work with the provider directly.

2. **Ease of Use**: Sending internal messages through the `provider.Contract.send` method is a more straightforward approach, as developers simply call the contract method and then use the `send` method to send the message. In contrast, using the ProviderRpcClient.sendMessage method requires specifying the payload, including the ABI, method, and parameters.

3. **Flexibility**: The `ProviderRpcClient.sendMessage` method provides more flexibility, as it can be used for different types of internal messages, including those with custom payloads or state initializations. This flexibility makes it a more suitable choice for advanced use cases or when working with multiple contracts.

Ultimately, the choice between these two methods depends on your specific use case and requirements. If you want a more straightforward and contract-focused approach, using the `provider.Contract.send` method might be the better option. However, if you need more flexibility or prefer working with the provider directly, the `ProviderRpcClient.sendMessage` method is an excellent choice.

#### Delayed Msg

```typescript
// 1. Using the contract instance
const { transaction } = await exampleContract.methods
  .setVariable({ someParam: 42 })
  .sendDelayed({
    from: senderAddress,
    value: 1 * 10 ** 9,
    bounce: true,
  });

// 2. Using the provider
const { transaction, messageHash, expireAt } =
  await provider.sendMessageDelayed({
    sender: senderAddress,
    recipient: new Address(testContract.address),
    amount: 1 * 10 ** 9,
    bounce: true,
    payload: payload,
  });

console.log('Message hash:', messageHash);
console.log('Expire at:', expireAt);

transaction.then(() => {
  console.log('Transaction:', transaction);
});
```

<Suspense>
  <SendInternalDelayedMessageComponent />
</Suspense>

::: warning
All functions can be executed either via external or internal messages. However, if function is not marked as `responsible`
it will not return anything when called via an internal message.
:::

## Local Execution

Local execution provides a way to simulate contract execution without actually sending a message to the blockchain. This can be useful for testing, debugging, or estimating gas usage. Everscale Provider API offers two methods for local execution: `runLocal` and `executeLocal`. Both methods require `basic` permissions.

### Run Local

The `call` method is used to execute only the compute phase of a contract locally. This method is useful when you want to simulate a contract call and obtain the output without affecting the contract's state.

Here is an example of how to use the `Contract.call` method:

```typescript
const runLocalResult = await exampleContract.methods
  .setVariable({ someParam: 1400 })
  .call();

console.log('Run local output:', runLocalResult.output);
console.log('TVM execution code:', runLocalResult.code);
```

<RunLocalComponent />

### Execute Local

The `executeLocal` method is used to execute all transaction phases locally, producing a new contract state. This method is useful when you want to simulate a contract call and observe the changes in the contract's state without actually sending a message to the blockchain.

Here is an example of how to use the `executeLocal` method:

```typescript
const executeLocalResult = await provider.api.executeLocal({
  address: exampleAddress,
  messageHeader: {
    type: 'internal',
    sender: senderAddress,
    amount: 1 * 10 ** 9, // 1 Native coin
    bounce: true,
  },
  payload: {
    abi: JSON.stringify(exampleAbi),
    method: 'setVariable',
    params: {
      someParam: 42,
    },
  },
});

console.log('Executed transaction:', executeLocalResult.transaction);
console.log('New contract state:', executeLocalResult.newState);
console.log(
  'Parsed function call output:',
  executeLocalResult.output,
);
```

<ExecuteLocalComponent />

#### Executor

The executor is an essential component of local execution, as it is responsible for running the contract's code in a simulated environment. The executor is provided by the provider, which ensures consistency with the validators.

You can customize the executor's behavior using the `executorParams` option, which allows you to disable signature checks or override the account balance during local contract execution.

Here is an example of how to use the `executeLocal` method with custom executor parameters:

```typescript
const executeLocalResultWithCustomExecutor =
  await provider.api.executeLocal({
    address: exampleAddress,
    messageHeader: {
      type: 'internal',
      sender: senderAddress,
      amount: 1 * 10 ** 9, // 1 Native coin
      bounce: true,
    },
    payload: {
      abi: JSON.stringify(exampleAbi),
      method: 'setVariable',
      params: {
        someParam: 42,
      },
    },
    executorParams: {
      disableSignatureCheck: true,
      overrideBalance: 100 * 10 ** 9, // 100 Native coins
    },
  });

console.log(
  'Executed transaction:',
  executeLocalResultWithCustomExecutor.transaction,
);
console.log(
  'New contract state:',
  executeLocalResultWithCustomExecutor.newState,
);
console.log(
  'Parsed function call output:',
  executeLocalResultWithCustomExecutor.output,
);
```
