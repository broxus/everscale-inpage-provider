<p align="center">
    <h3 align="center">TON inpage provider</h3>
    <p align="center">Web3-like interface to TON provided by the TON Crystal Wallet browser extension.</p>
    <p align="center">
        <a href="/LICENSE">
            <img alt="GitHub" src="https://img.shields.io/github/license/broxus/ton-inpage-provider" />
        </a>
        <a href="https://www.npmjs.com/package/ton-inpage-provider">
            <img alt="npm" src="https://img.shields.io/npm/v/ton-inpage-provider">
        </a>
    </p>
    <p align="center"><b><a href="https://broxus.github.io/ton-inpage-provider/index.html">Documentation</a></b></p>
</p>

### How to install

```shell
npm install --save ton-inpage-provider
```

### Contents

- [`src/api.ts`](./src/api.ts) - RPC interface description
- [`src/models.ts`](./src/models.ts) - general models, used in RPC interface
- [`src/contract.ts`](./src/contract.ts) - typed contracts wrapper
- [`src/stream.ts`](./src/stream.ts) - user-friendly api for streams
- [`src/utils.ts`](./src/utils.ts) - some useful stuff

### Example

```typescript
import ton, { hasTonProvider } from 'ton-inpage-provider';

async function myApp() {
  if (!(await hasTonProvider())) {
    throw new Error('Extension is not installed')
  }
  await ton.ensureInitialized();

  const { accountInteraction } = await ton.rawApi.requestPermissions({
    permissions: ['tonClient', 'accountInteraction']
  });
  if (accountInteraction == null) {
    throw new Error('Insufficient permissions')
  }

  const selectedAddress = accountInteraction.address;
  const dePoolAddress = '0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9';

  const { transaction } = await ton.rawApi.sendMessage({
    sender: selectedAddress,
    recipient: dePoolAddress,
    amount: '10500000000',
    bounce: true,
    payload: {
      abi: DePoolAbi,
      method: 'addOrdinaryStake',
      params: {
        stake: '10000000000'
      }
    }
  });
  console.log(transaction);

  const { output, code } = await ton.rawApi.runLocal({
    address: dePoolAddress,
    functionCall: {
      abi: DePoolAbi,
      method: 'getParticipantInfo',
      params: {
        addr: selectedAddress
      }
    }
  });
  console.log(output, code);
}

const DePoolAbi = `{
  "ABI version": 2,
  "header": ["time", "expire"],
  "functions": [{
    "name": "addOrdinaryStake",
    "inputs": [
      {"name":"stake","type":"uint64"}
    ],
    "outputs": []
  }, {
    "name": "getParticipantInfo",
    "inputs": [
      {"name":"addr","type":"address"}
    ],
    "outputs": [
      {"name":"total","type":"uint64"},
      {"name":"withdrawValue","type":"uint64"},
      {"name":"reinvest","type":"bool"},
      {"name":"reward","type":"uint64"},
      {"name":"stakes","type":"map(uint64,uint64)"},
      {"components":[{"name":"remainingAmount","type":"uint64"},{"name":"lastWithdrawalTime","type":"uint64"},{"name":"withdrawalPeriod","type":"uint32"},{"name":"withdrawalValue","type":"uint64"},{"name":"owner","type":"address"}],"name":"vestings","type":"map(uint64,tuple)"},
      {"components":[{"name":"remainingAmount","type":"uint64"},{"name":"lastWithdrawalTime","type":"uint64"},{"name":"withdrawalPeriod","type":"uint32"},{"name":"withdrawalValue","type":"uint64"},{"name":"owner","type":"address"}],"name":"locks","type":"map(uint64,tuple)"},
      {"name":"vestingDonor","type":"address"},
      {"name":"lockDonor","type":"address"}
    ]
  }],
  "data": [],
  "events": []
}`;

myApp().catch(console.error);
```

### How to build

```shell
npm install
npm run build
```
