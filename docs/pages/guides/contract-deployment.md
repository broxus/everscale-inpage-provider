# Contract Deployment

In this guide, we will demonstrate how to deploy a simple contract on the TVM-compatible blockchains using the `ProviderRpcClient`. Deploying a contract involves sending an external inbound message to an uninitialized contract address, followed by calling its constructor.

## Introduction

Blockchain has a unique feature where all contract addresses exist by default but are uninitialized. An uninitialized account has some data, which contains a balance and meta info, but does not have any smart contract code or persistent data yet. To deploy a contract, you need to fund the contract address and then call its constructor. This can be achieved by sending an external inbound message to the uninitialized contract address, which doesn't contain a source address but has a destination address and doesn't have any value. External inbound messages are used to call contracts from outside or to deploy them.

For a more detailed explanation of Everscale accounts and their states, please refer to the [Everscale Overview](./../overview.md#accounts) section of the documentation.

## Prerequisites

Before proceeding with the deployment example, ensure you have the following components:

1. The contract ABI, which is the JSON representation of the contract interface.
2. The base64-encoded TVC, which is the compiled binary code of the contract.

For this guide, we will use the following contract ABI:

::: details ABI

:::

::: details Code of the contract

```solidity
pragma ever-solidity >=0.66;

struct ComplexType {
	uint32 first;
	string second;
}

contract ExampleContract {
	uint32 static nonce;

	uint128 public simpleState;
	ComplexType complexState;

	modifier cashBack() {
		tvm.rawReserve(1 ever, 0);
		_;
		msg.sender.transfer({value: 0, flag: 68, bounce: false});
	}

	event StateChanged(ComplexType complexState);

	constructor(uint128 someParam, string second) public {
		tvm.accept();
		simpleState = someParam;
		complexState = ComplexType(uint32(someParam % 1000), second);
	}

	function setVariable(uint128 someParam) public cashBack {
		_setVariable(someParam);
	}

	function setVariableExternal(uint128 someParam) external {
		tvm.accept();
		_setVariable(someParam);
	}

	function _setVariable(uint128 someParam) private cashBack {
		simpleState = someParam;
		complexState.first = uint32(someParam % 1000);
		emit StateChanged(complexState);
	}

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

::: details Base64-encoded TVC-hash of the Contract

```base64
te6ccgECFAEAAiwAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBCSK7VMg4wMgwP/jAiDA/uMC8gsRBQQTArbtRNDXScMB+GYh2zzTAAGOGYMI1xgg+QEB0wABlNP/AwGTAvhC4vkQ8qiV0wAB8nri0z8B+EMhufK0IPgjgQPoqIIIG3dAoLnytPhj0x8B+CO88rnTHwHbPPI8CAYDSu1E0NdJwwH4ZiLQ1wsDqTgA3CHHAOMCIdcNH/K8IeMDAds88jwQEAYDPCCCECBivBq64wIgghAumE3guuMCIIIQPJHhxbrjAgwJBwM2MPhCbuMA+EbycyGT1NHQ3tP/0fgA2zzbPPIACAsKAWLtRNDXScIBjiZw7UTQ9AVxIYBA9A5vkZPXCw/ecPhr+GqAQPQO8r3XC//4YnD4Y+MNDwM0MPhG8uBM+EJu4wAhk9TR0N7T/9HbPNs88gAPCwoALPhL+Er4Q/hCyMv/yz/Pg8sPy//J7VQAQvgAIPhrjQRwAAAAAAAAAAAAAAAAGM7MaiDIzsv/yXD7AANoMPhG8uBM+EJu4wDR2zwhjhwj0NMB+kAwMcjPhyDOghCgYrwazwuBy//JcPsAkTDi4wDyAA8ODQAo7UTQ0//TPzH4Q1jIy//LP87J7VQABPhLAC7tRNDT/9M/0wAx0w/T/9H4a/hq+GP4YgAK+Eby4EwCEPSkIPS98sBOExIAFHNvbCAwLjYzLjAAAA==
```

:::

## Deploying a contract

In the following example, we will demonstrate how to deploy a simple contract using the `ProviderRpcClient`. We will first generate the expected uninitialized contract address, then fund this address, and finally call the constructor of the contract to initialize it. Make sure to replace the `base64Contract` variable with the actual base64-encoded TON Virtual Machine-compatible contract (TVC) of your contract.

```typescript
import { ProviderRpcClient, GetExpectedAddressParams, Contract } from 'everscale-inpage-provider';

type DeployParams<Abi> = GetExpectedAddressParams<Abi> & {
  publicKey: string | undefined;
};

const provider = new ProviderRpcClient();

// Ensure the provider is initialized
await provider.ensureInitialized();

// Request permissions from the user to execute API methods using the provider
await provider.requestPermissions({ permissions: ['basic', 'accountInteraction'] });

const providerState = await provider.getProviderState();

const senderPublicKey = providerState?.permissions.accountInteraction?.publicKey!;
const senderAddress = providerState?.permissions.accountInteraction?.address!;

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
const expectedAddress = await provider.getExpectedAddress(ABI, deployParams);

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
  bounce: false, // It is important to set 'bounce' to false to ensure funds remain in the contract.

  stateInit: stateInit.stateInit,
});

// Create a contract instance
const exampleContract: Contract<typeof ABI> = new provider.Contract(ABI, expectedAddress);

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

<DeployAccountComponent  />

::: info Important Points

- The deployment process uses external inbound messages, which are designed for calling contracts from outside or deploying them without a source address or value.
- The contract address is generated using the getExpectedAddress method. This method returns the address of the uninitialized contract.
- Ensure the contract's ABI and deploy parameters are correctly defined before initiating the deployment process.
- The contract address must be funded before the constructor is called. Send funds to the contract address with the sendMessage method.
- When sending funds, set the bounce parameter in sendMessage to false. Since the contract has no code yet, it cannot process the incoming message. Setting bounce to false ensures that the funds remain in the contract and are not returned to the sender.

:::
