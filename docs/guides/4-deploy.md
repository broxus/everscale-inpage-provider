# Deploy a Contract

This guide will walk you through the process of deploying a simple contract using the `ProviderRpcClient`. The process involves generating the expected uninitialized contract address, funding this address, and finally calling the constructor of the contract to initialize it. Make sure to replace the `base64Contract` variable with the actual `base64-encoded` TON Virtual Machine-compatible contract (TVC) of your contract.

## Code to TVC

Before deploying a contract, you need to convert the base64 encoded contract code into a TVC (TVM Container) file with default init data. The `codeToTvc` method is used for this conversion. The TVC format stores the contract's code and data in a compact binary form, suitable for execution on the TON Virtual Machine.

```typescript
const base64Contract = `te6ccgECJAEABNsAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gshBQQjAtztRNDXScMB+GaNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4aSHbPN=YgAK+Eby4EwCEPSkIPS98sBOIyIAFHNvbCAwLjY2LjAAAA==`;

// Convert contract code to TVC
const tvc = await provider.codeToTvc(base64Contract);

console.log('TVC:', tvc);
```

## TVC Merge & Split

During development and testing, you may need to modify or inspect the contract code and data independently. The `mergeTvc` and `splitTvc` methods allow you to manage the contract's code and data separately or combined into a single state init.

```typescript
// Merge code and data into state init
const mergedTvc = await provider.mergeTvc({
  code: base64Contract,
  data: exampleBOC,
});

// Split state init into code and data
const { code, data } = await provider.splitTvc(mergedTvc.tvc);
```

## Code Salt Management

The `setCodeSalt` and `getCodeSalt` methods enable you to manage the salt value associated with a contract's code. The salt value is an optional component that can be used to ensure the uniqueness of a contract's code, preventing collisions or other issues when deploying multiple instances of the same contract.

```typescript
saltParams;
// Set code salt
const saltParams = { structure: exampleAbi, data: saltData };
const saltedCode = await provider.setCodeSalt({
  code: contractCode,
  salt: saltParams,
});

// Get code salt
const codeSalt = await provider.getCodeSalt({
  code: saltedCode.code,
});
```

## Expected Address Retrieval

Before deploying a contract, you may need to compute the expected address of the contract. The `getExpectedAddress` method takes into account the provided TVC, workchain, public key, and init params, returning the address that the contract will have once it is deployed. This can be useful for pre-allocating resources or setting up permissions in advance, ensuring a smooth deployment process.

```typescript
const deployParams = {
  tvc: base64Contract,
  workchain: 0,
  publicKey: 'public_key',
  initParams: {
    nonce: 0,
  },
};

// Get the expected address of the contract
const expectedAddress = await provider.getExpectedAddress(
  deployParams,
);

console.log('Expected address:', expectedAddress);
```

## Deploying the Sample Contract

Now that you have prepared all the necessary components, you can deploy the contract using the following code:

```typescript
import {
  GetExpectedAddressParams,
  Contract,
} from 'everscale-inpage-provider';

type DeployParams<Abi> = GetExpectedAddressParams<Abi> & {
  publicKey: string | undefined;
};

const someParam = 1000;
const secondParam = 'test';

const deployParams: DeployParams<typeof ABI> = {
  tvc: base64Contract,
  workchain: 0,
  publicKey: senderPublicKey,
  initParams: {
    nonce: (Math.random() * 64000).toFixed(),
  },
};
// Get the expected contract address
const expectedAddress = await provider.getExpectedAddress(
  ABI,
  deployParams,
);

// Get the state init
const stateInit = await provider.getStateInit(ABI, deployParams);

// Define the constructor payload
const constructorPayload = {
  abi: JSON.stringify(ABI),
  method: 'constructor',
  params: {
    someParam: someParam.toString(),
    second: secondParam,
  },
};

// Send the coins to the address
await provider.sendMessage({
  sender: senderAddress,
  recipient: expectedAddress,
  amount: 1 * 10 ** 9, // 1 Coin in nanoсents
  bounce: false, // It is important to set 'bounce' to false
  // to ensure funds remain in the contract.

  stateInit: stateInit.stateInit,
});

// Create a contract instance
const exampleContract: Contract<typeof ABI> = new provider.Contract(
  ABI,
  expectedAddress,
);

// Call the contract constructor
await exampleContract.methods
  .constructor({
    someParam: someParam,
    second: secondParam,
  })
  .sendExternal({
    stateInit: stateInit.stateInit,
    publicKey: deployParams.publicKey!,
  });
```

<DeployAccountComponent />

::: info Important Points

- The deployment process uses external inbound messages, which are designed for calling contracts from outside or deploying them without a source address or value.
- The contract address is generated using the `getExpectedAddress` method. This method returns the address of the uninitialized contract.
- Ensure the contract's ABI and deploy parameters are correctly defined before initiating the deployment process.
- The contract address must be funded before the constructor is called. Send funds to the contract address with the `sendMessage` method.
- When sending funds, set the `bounce` parameter in `sendMessage` to `false`. Since the contract has no code yet, it cannot process the incoming message. Setting `bounce` to `false` ensures that the funds remain in the contract and are not returned to the sender.

:::
