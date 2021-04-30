## TON inpage provider

Web3-like interface to TON provided by TON Crystal Wallet browser extension.

### How to install

```shell
npm install --save ton-inpage-provider
```

### Contents

- [`src/api.ts`](./src/api.ts) - RPC interface description
- [`src/models.ts`](./src/models.ts) - general models, used in RPC interface
- [`src/permissions.ts`](./src/permissions.ts) - permission-specific models

### Example

```typescript
import ton, {
  hasTonProvider,
  ensureProviderInitialized
} from 'ton-inpage-provider';

async function myApp() {
  if (!hasTonProvider()) {
    throw new Error('TON provider not found')
  }
  await ensureProviderInitialized();

  const { accountInteraction } = ton.requestPermissions({
    permissions: ["tonClient", "accountInteraction"]
  });

  const selectedAddress = accountInteraction[0].address
  const dePoolAddress =
    '0:bbcbf7eb4b6f1203ba2d4ff5375de30a5408a8130bf79f870efbcfd49ec164e9';

  const { transaction } = ton.sendMessage({
    preferredAccount: selectedAddress,
    address: dePoolAddress,
    amount: '10500000000',
    bounce: true,
    payload: {
      abi: DePoolAbi,
      method: 'addOrdinaryStake',
      params: {
        stake: '10000000000',
      }
    }
  });
  console.log(transaction)

  const { output, code } = ton.runLocal({
    address: dePoolAddress,
    functionCall: {
      abi: DePoolAbi,
      method: 'getParticipantInfo',
      params: {
        addr: selectedAddress,
      }
    }
  })
  console.log(output, code)
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
