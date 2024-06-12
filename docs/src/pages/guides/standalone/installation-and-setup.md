---
title: Everscale Inpage Provider
outline: deep
---

# Installation & Setup

Setting up the Everscale Standalone Client is a straightforward process. In this section, we will guide you through the installation and setup steps.

## Installation

First, you need to install the required packages. Run the following command in your project directory to install both the `everscale-inpage-provider` and `everscale-standalone-client`:

```shell
npm install --save everscale-inpage-provider everscale-standalone-client
```

## Setup

After installing the necessary packages, you can start setting up the Standalone Client. Import the appropriate classes and functions from the installed packages depending on your environment:

### Browser environment

```typescript
import { ProviderRpcClient } from 'everscale-inpage-provider';
import { EverscaleStandaloneClient } from 'everscale-standalone-client';
```

### Node.js environment

```typescript
import { ProviderRpcClient } from 'everscale-inpage-provider';
import { EverscaleStandaloneClient } from 'everscale-standalone-client/nodejs';
```

Next, create an instance of the `ProviderRpcClient` and configure it to use the Standalone Client as a fallback:

```typescript
const provider = new ProviderRpcClient({
  fallback: () =>
    EverscaleStandaloneClient.create({
      connection: {
        // Connection configurations go here
      },
    }),
  forceUseFallback: true,
});
```

You can now proceed to the next sections to learn how to create instances of the Standalone Client, switch between different TVM blockchains, and interact with blockchains using the Standalone Client.

## Switching between different TVM blockchains

The Standalone Client provides a flexible way to switch between different TVM-compatible blockchains. This feature allows you to interact with various blockchains, within the same application.

In this section, we will explain how to configure the Standalone Client to connect to different TVM blockchains and provide an example of connecting to the Venom testnet.

### Configuration

To switch between different TVM blockchains, you need to configure the `connection` parameter when creating an instance of the Standalone Client. The `connection` parameter accepts an object that specifies the network ID, connection type, and connection data, such as the blockchain's endpoint.

Here's an example of configuring the Standalone Client to connect to the Venom testnet:

```typescript
const provider = new ProviderRpcClient({
  fallback: () =>
    EverscaleStandaloneClient.create({
      connection: {
        id: 1000,
        group: 'venom_testnet',
        type: 'jrpc',
        data: {
          endpoint: 'https://jrpc-testnet.venom.foundation/rpc',
        },
      },
      keystore: Keystore,
    }),
  forceUseFallback: true,
});
```

## Example: Connecting to the Venom testnet

The following example demonstrates how to use the Standalone Client to connect to the Venom testnet in a Node.js environment:

```typescript
import { ProviderRpcClient } from 'everscale-inpage-provider';
import {
  EverscaleStandaloneClient,
  SimpleKeystore,
} from 'everscale-standalone-client/nodejs';
import { Base64 } from 'js-base64';

async function main() {
  const Keystore = new SimpleKeystore({
    0: {
      publicKey:
        '4038a63fb2b95c0b85516f289fe87b8fc87860b7ba0920cd285e0bad53cff8a5',
      secretKey:
        'ae218eb9c8df7ab217ee4ecef0e74f178efdb8b9f697be6f6b72a7681110716a',
    },
  });
  const provider = new ProviderRpcClient({
    fallback: () =>
      EverscaleStandaloneClient.create({
        connection: {
          id: 1000,
          group: 'venom_testnet',
          type: 'jrpc',
          data: {
            endpoint: 'https://jrpc-testnet.venom.foundation/rpc',
          },
        },
        keystore: Keystore,
      }),
    forceUseFallback: true,
  });

  // Data to be signed
  const data = 'example42';

  // Sign data with hashing
  const signedData = await provider.signData({
    publicKey:
      '4038a63fb2b95c0b85516f289fe87b8fc87860b7ba0920cd285e0bad53cff8a5',
    data: Base64.encode(data),
  });
  console.log(`Signed data:`, signedData);
}

if (require.main === module) {
  main();
}
```

In this example, we configure the Standalone Client to connect to the Venom testnet and use the `signData` method to sign a piece of data with a specific public key.

By configuring the `connection` parameter, you can easily switch between different TVM blockchains and interact with them using the Standalone Client.
