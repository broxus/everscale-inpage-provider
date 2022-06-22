<p align="center">
    <h3 align="center">Everscale inpage provider</h3>
    <p align="center">Web3-like interface to the Everscale blockchain.</p>
    <p align="center">
        <a href="/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/github/license/broxus/everscale-inpage-provider" />
        </a>
        <a href="https://www.npmjs.com/package/everscale-inpage-provider">
            <img alt="npm" src="https://img.shields.io/npm/v/everscale-inpage-provider">
        </a>
    </p>
    <p align="center"><b><a href="https://broxus.github.io/everscale-inpage-provider/index.html">Documentation</a></b></p>
</p>

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

### How to build

```shell
npm install
npm run build
```
