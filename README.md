<p align="center">
  <a href="https://github.com/venom-blockchain/developer-program">
    <img src="https://raw.githubusercontent.com/venom-blockchain/developer-program/main/vf-dev-program.png" alt="Logo" width="366.8" height="146.4">
  </a>
</p>

# Everscale inpage provider &emsp;  [![Latest Version]][npmjs.com] [![Docs badge]][docs]

## About

Web3-like interface to the Everscale blockchain.

## Usage

### How to install

```shell
npm install --save everscale-inpage-provider
```

> NOTE: this repo was originally used for `ton-inpage-provider` package which is DEPRECATED now.

### Contents

- [`src/api.ts`](./src/api.ts) - RPC interface description
- [`src/models.ts`](./src/models.ts) - general models, used in RPC interface
- [`src/contract.ts`](./src/contract.ts) - typed contracts wrapper
- [`src/stream.ts`](./src/stream.ts) - user-friendly api for streams
- [`src/utils.ts`](./src/utils.ts) - some useful stuff

### Example

```typescript
import {
  Address,
  ProviderRpcClient,
  TvmException
} from 'everscale-inpage-provider';

const ever = new ProviderRpcClient();

async function myApp() {
  if (!(await ever.hasProvider())) {
    throw new Error('Extension is not installed');
  }

  const { accountInteraction } = await ever.requestPermissions({
    permissions: ['basic', 'accountInteraction'],
  });
  if (accountInteraction == null) {
    throw new Error('Insufficient permissions');
  }

  const selectedAddress = accountInteraction.address;
  const dePoolAddress = new Address('0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9');

  const dePool = new ever.Contract(DePoolAbi, dePoolAddress);

  const transaction = await dePool
    .methods
    .addOrdinaryStake({
      stake: '10000000000',
    }).send({
      from: selectedAddress,
      amount: '10500000000',
      bounce: true,
    });
  console.log(transaction);

  try {
    const output = await dePool
      .methods
      .getParticipantInfo({
        addr: selectedAddress,
      })
      .call();
    console.log(output);
  } catch (e) {
    if (e instanceof TvmException) {
      console.error(e.code);
    }
  }
}

const DePoolAbi = {
  'ABI version': 2,
  'header': ['time', 'expire'],
  'functions': [{
    'name': 'addOrdinaryStake',
    'inputs': [
      { 'name': 'stake', 'type': 'uint64' },
    ],
    'outputs': [],
  }, {
    'name': 'getParticipantInfo',
    'inputs': [
      { 'name': 'addr', 'type': 'address' },
    ],
    'outputs': [
      { 'name': 'total', 'type': 'uint64' },
      { 'name': 'withdrawValue', 'type': 'uint64' },
      { 'name': 'reinvest', 'type': 'bool' },
      { 'name': 'reward', 'type': 'uint64' },
      { 'name': 'stakes', 'type': 'map(uint64,uint64)' },
      {
        'components': [
          { 'name': 'remainingAmount', 'type': 'uint64' },
          { 'name': 'lastWithdrawalTime', 'type': 'uint64' },
          { 'name': 'withdrawalPeriod', 'type': 'uint32' },
          { 'name': 'withdrawalValue', 'type': 'uint64' },
          { 'name': 'owner', 'type': 'address',
        }],
        'name': 'vestings', 'type': 'map(uint64,tuple)',
      },
      {
        'components': [
          { 'name': 'remainingAmount', 'type': 'uint64' },
          { 'name': 'lastWithdrawalTime', 'type': 'uint64' },
          { 'name': 'withdrawalPeriod', 'type': 'uint32' },
          { 'name': 'withdrawalValue', 'type': 'uint64' },
          { 'name': 'owner', 'type': 'address',
        }],
        'name': 'locks', 'type': 'map(uint64,tuple)',
      },
      { 'name': 'vestingDonor', 'type': 'address' },
      { 'name': 'lockDonor', 'type': 'address' },
    ],
  }],
  'data': [],
  'events': [],
} as const; // NOTE: `as const` is very important here

myApp().catch(console.error);
```

### Build

```shell
npm install

# Build as ts library
# (output will be in the `dist` folder)
npm run build

# Build as js library to use directly in <script> tags
# (output will be in the `vanilla` folder)
npm run build:vanilla
```

## Contributing

We welcome contributions to the project! If you notice any issues or errors, feel free to open an issue or submit a pull request.

## License

Licensed under GPL-3.0 license ([LICENSE](/LICENSE) or https://opensource.org/license/gpl-3-0/).

[latest version]: https://img.shields.io/npm/v/everscale-inpage-provider
[npmjs.com]: https://www.npmjs.com/package/everscale-inpage-provider
[docs badge]: https://img.shields.io/badge/docs-latest-brightgreen
[docs]: https://broxus.github.io/everscale-inpage-provider/index.html
