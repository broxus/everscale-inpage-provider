---
title: Everscale Inpage Provider
---

# Working with cells

Cells are the basic storage elements in the blockchain, used to represent and manipulate data in contracts. In this guide, we will explore the basic methods for working with cells provided by `everscale-inpage-provider`.

:::info
Note that it is also possible to work with accounts, but we will cover that in the [next section](./working-with-contracts.md).
:::

Here is the ABI definition we'll use in our examples:

```typescript
const ABI = [
  { name: 'name', type: 'string' },
  { name: 'age', type: 'uint32' },
  { name: 'city', type: 'string' },
] as const;
```

## Cell Data Packing

To pack data into a TVM cell, use the `packIntoCell` method. It creates a `base64` encoded `BOC` (Bag of Cells) from the provided `data`, `structure`, and ABI version.

```typescript
import { ProviderRpcClient } from 'everscale-inpage-provider';

const provider = new ProviderRpcClient();

// Make sure the provider is initialized.
await provider.ensureInitialized();

// Request permissions from the user to execute API
// methods using the provider.
await provider.requestPermissions({ permissions: ['basic'] });

// Define the data to pack.
const dataToPack = {
  name: 'Alice',
  age: 30,
  city: 'New York',
};

// Pack the data into BOC.
const { boc, hash } = await provider.packIntoCell({
  structure: ABI,
  data: dataToPack,
});

console.log('Packed data:', boc);
console.log('Packed data hash:', hash);
```

<PackCellComponent />

## Cell Data Unpacking

To unpack data from a TVM cell, use the `unpackFromCell` method. It decodes the `base64-encoded` string into an object according to the provided ABI.

```typescript
// Define the data to unpack.
const bocToUnpack =
  'te6ccgEBAwEAGQACCAAAAB4CAQAQTmV3IFlvcmsACkFsaWNl';

// Unpack the data from BOC.
const unpacked = await provider.unpackFromCell({
  structure: ABI,
  boc: bocToUnpack,
  allowPartial: true,
});
console.log('Unpacked data:', unpacked.data);
```

<UnpackCellComponent />

## BOC Hash Computation

Before diving into the specifics of how to compute the hash of a `base64` encoded BOC (Bag of Cells) using the `getBocHash` method provided by the `everscale-inpage-provider`.

At the most fundamental level, everything in Blockchain is a _cell_. Each _cell_ consists of up to **1023 data bits** and **up to 4 references** to other cells. Cells are organized in a tree-like structure, with each cell potentially referencing up to four other cells. The hash of a cell is a kind of complex hash derived from the cell's representation in a specific format.

It's crucial to note that this is not simply a SHA-256 hash of the byte contents of the base64 string. Instead, it involves the structured data within the cell, its references, and specific aspects of its representation.

### Get BOC Hash

The `getBocHash` method computes the hash of a `base64` encoded BOC and returns the hash as a hexadecimal string. This method requires basic permissions.

Here's an example of how to use the `getBocHash` method:

```typescript
// Define the base64 encoded BOC.
const boc = 'te6ccgEBAwEAGQACCAAAAB4CAQAQTmV3IFlvcmsACkFsaWNl';

// Compute the hash of the base64 encoded BOC.
const hash = await provider.getBocHash(boc);

console.log('BOC hash:', hash);
```

<GetBocHashComponent />

::: warning
In this case, `getBocHash` takes the `base64` representation of the cell (or BOC) and computes the hash using the specific hashing method suitable for this data structure.
:::

---

## Public Key Extraction

The `extractPublicKey` method is useful when you need to obtain the public key associated with a contract's raw account state. This can be helpful, for example, when verifying the integrity of a transaction or checking the owner of a contract. Keep in mind that this method can only be used on contracts that have been deployed and have a `pubkey` header.

::: details exampleBOC

```typescript
const exampleBOC = `te6ccgECJAEABVQAAq+ABZ3CHw48OB0mTpE8eqZinXiv5scdevb2gcI/pRjrelBFjS9+hkTHXAAAAGmBdY7yEh23xBWmo7FjLZOuSyzxWmQsy2Iuh1QTrvQw03v4IzLNJK91loBAAwEBgfvlEQAVS8EtkmmQXS+aqup1WIq0Oaj5Ef1aKt620rWnAAABh8qr9wqAABHVgAAAAAAAAAAAAAAAAAAB9AAAAABAAgAIdGVzdAQkiu1TIOMDIMD/4wIgwP7jAvILIQUEIwLc7UTQ10nDAfhmjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE+Gkh2zzTAAGOFIMI1xgg+CjIzs7J+QBY+EL5EPKo3tM/AfhDIbnytCD4I4ED6KiCCBt3QKC58rT4Y9MfAds88jwLBgN67UTQ10nDAfhmItDTA/pAMPhpqTgA+ER/b3GCCJiWgG9ybW9zcG90+GTcIccA4wIh1w0f8rwh4wMB2zzyPCAgBgIoIIIQQT7ay7vjAiCCEHEJa0q74wIOBwM8IIIQZwdgDrrjAiCCEG6/VtK64wIgghBxCWtKuuMCDAoIA3Iw+Eby4Ez4Qm7jANHbPCGOISPQ0wH6QDAxyM+HIM6CEPEJa0rPC4EBbyICyx/MyXD7AJEw4uMA8gAfCR0ABPhMAkgw+EJu4wD4RvJz03/U0fgAIfhrAYED6KkItR8BbwL4bNs88gALEQJu7UTQ10nCAY6scO1E0PQFcSGAQPQOb5GT1wsf3nAgiG8C+Gz4a/hqgED0DvK91wv/+GJw+GPjDSMfAygw+Eby4Ez4Qm7jANN/0ds82zzyAB8NEQFC+CdvEGim/mChtX9y+wLbPPhJyM+FiM6Ab89AyYEAgfsAEwRQIIIQETcOALrjAiCCED/haBW64wIgghBAAi9yuuMCIIIQQT7ay7rjAhwUEA8BUDDR2zz4SyGOHI0EcAAAAAAAAAAAAAAAADBPtrLgyM7Lf8lw+wDe8gAfAygw+Eby4Ez4Qm7jANN/0ds82zzyAB8SEQA++Ez4S/hK+EP4QsjL/8s/z4PLH8t/AW8iAssfzMntVAEI+ADbPBMAZiD4a4ED6KkItR/4TAFvUCD4bI0EcAAAAAAAAAAAAAAAABTOcilgyM4BbyICyx/MyXD7AANoMPhG8uBM+EJu4wDU0ds8IY4bI9DTAfpAMDHIz4cgzoIQv+FoFc8LgczJcPsAkTDi4wDyAB8VHQEM+ExvEds8FgQ8Ads8WNBfMts8MzOUIHHXRo6I1TFfMts8MzPoMNs8GhkZFwEkliFviMAAs46GIds8M88R6MkxGAAcb41vjVkgb4iSb4yRMOIBUiHPNab5IddLIJYjcCLXMTTeMCG7jo1c1xgzI84zXds8NMgz31MSzmwxGwEwbwAB0JUg10rDAI6J1QHIzlIg2zwy6MjOGwA4URBviJ5vjSBviIQHoZRvjG8A35JvAOJYb4xvjAPwMPhG8uBM+EJu4wDTH/hEWG91+GTTH9HbPCGOHyPQ0wH6QDAxyM+HIM6CEJE3DgDPC4EBbyICyx/MyXCONPhEIG8TIW8S+ElVAm8RyM+EgMoAz4RAzgH6AvQAgGrPQPhEbxXPCx8BbyICyx/MyfhEbxTi+wDjAPIAHx4dACjtRNDT/9M/MfhDWMjL/8s/zsntVAFaIIED6Lny5Tn4TG8QoLUfcIhvAgFvUPhMbxFvUTD4RHBvcoBEb3Rwb3H4ZPhMIwBA7UTQ0//TP9MAMdMf03/TH9RZbwIB0fhs+Gv4avhj+GIACvhG8uBMAhD0pCD0vfLATiMiABRzb2wgMC42Ni4wAAA=`;
```

:::

```typescript
// Extract public key from boc
const publicKey = await provider.extractPublicKey(exampleBOC);

console.log('Public key:', publicKey);
```

<ExtractPKComponent />
