---
outline: deep
---

# Keystore

Keystore provides an abstraction layer over key management. This abstraction helps with securely managing keys, as well as signing data with the appropriate key. `EverscaleStandaloneClient` requires a `Keystore` for signing transactions and other blockchain operations.

In this guide, we will explain what a `Keystore` is, how to use it with the `EverscaleStandaloneClient`, and how to manage the keys using a `SimpleKeystore`.

## Overview

Keystore is an interface that comprises the `getSigner(id: string): Promise<Signer | undefined>` method. This method retrieves a `Signer` instance based on the provided ID.

A `Signer` is another interface that contains two properties:

- `publicKey: string`: The hex-encoded public key.
- `sign(rawData: string, signatureId?: number): Promise<string>`: A method to sign data and return a signature. The data can be encoded either in hex or base64.

## SimpleKeystore

`SimpleKeystore` is a class that implements the `Keystore` interface. It provides basic functionality to manage key pairs. It uses a map to store signers based on their ID and public key.

Here's a list of its methods:

- `addKeyPair`: Adds a key pair to the keystore. You can add the key pair either by directly providing it or by providing an ID and a key pair.
- `removeKeyPair`: Removes a key pair from the keystore based on its ID.
- `withNewKey`: Generates and adds a new key pair to the keystore. This method accepts a callback function to decide whether to keep the key pair based on its public key. It returns the ID of the key pair.
- `getSigner`: Retrieves a `Signer` instance based on the ID or public key.

## Creating an instance of SimpleKeystore

```typescript
import { SimpleKeystore } from 'everscale-standalone-client';

const keystore = new SimpleKeystore();
```

## Adding Key Pairs

You can add key pairs to the `SimpleKeystore` using the `addKeyPair` method. This method accepts either a key pair or an ID and a key pair.

```typescript
const keyPair = SimpleKeystore.generateKeyPair();
keystore.addKeyPair(keyPair);

// Or you can add a key pair with a custom ID
keystore.addKeyPair('customId', keyPair);

// Remove a key pair
keystore.removeKeyPair('customId');
```

### With predefined keys

The `SimpleKeystore` also allows you to create an instance with predefined keys. This can be useful when you have existing keys that you want to use.

You can provide the keys in the constructor, using an object. The keys of the object will be used as the key IDs and the values are objects that contain the `publicKey` and `secretKey`.

Here's how to create a `SimpleKeystore` with predefined keys:

```typescript
import { SimpleKeystore } from 'everscale-standalone-client';

const keystore = new SimpleKeystore({
  0: {
    publicKey:
      '4038a63fb2b95c0b85516f289fe87b8fc87860b7ba0920cd285e0bad53cff8a5',
    secretKey:
      'ae218eb9c8df7ab217ee4ecef0e74f178efdb8b9f697be6f6b72a7681110716a',
  },
});
```

## Removing Key Pairs

You can remove key pairs from the `SimpleKeystore` using the `removeKeyPair` method. This method accepts the ID of the key pair to remove.

```typescript
// Remove a key pair
keystore.removeKeyPair('customId');
```

## Generating and Adding a New Key Pair to SimpleKeystore

```typescript
const keyId = await keystore.withNewKey(async publicKey => {
  console.log('New public key:', publicKey);
  return true; // Return true to keep the new key
});
```

## Retrieving a Signer

```typescript
const signer = await keystore.getSigner('customId');
if (signer) {
  const signature = await signer.sign('data to sign');
}
```

## Connecting SimpleKeystore to Client

After setting up your `SimpleKeystore`, you can now connect it to your `EverscaleStandaloneClient` instance:

```typescript
const provider = new ProviderRpcClient({
  fallback: () =>
    EverscaleStandaloneClient.create({
      connection: {
        // Connection configurations go here
      },
      keystore: keystore, // Add your keystore here
    }),
  forceUseFallback: true,
});
```
