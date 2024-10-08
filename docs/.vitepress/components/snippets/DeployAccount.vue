<template>
  <div class="demo">
    <button @click="deployAccount">Deploy</button>
    <a
      v-if="deployedContract"
      :href="`https://net.ever.live/accounts/accountDetails?id=${deployedContract}`"
      target="_blank"
      >{{ deployedContract }}</a
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { GetExpectedAddressParams, Contract } from 'everscale-inpage-provider';

import { toNano, testContract, errorExtractor } from '../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

type DeployParams<Abi> = GetExpectedAddressParams<Abi> & {
  publicKey: string | undefined;
};

export default defineComponent({
  name: 'DeployAccount',
  setup() {
    const deployedContract = ref('');
    const tx = ref(null);

    const exampleAbi = testContract.ABI;

    return { deployedContract, tx, exampleAbi };
  },
  methods: {
    async deployAccount() {
      await provider.ensureInitialized();

      // Request permissions from the user to execute API methods using the provider.
      await provider.requestPermissions({ permissions: ['basic', 'accountInteraction'] });

      const providerState = await provider.getProviderState();

      const senderPublicKey = providerState?.permissions.accountInteraction?.publicKey!;
      const senderAddress = providerState?.permissions.accountInteraction?.address!;

      const someParam = 1000;
      const secondParam = 'test';

      const deployParams: DeployParams<typeof testContract.ABI> = {
        tvc: testContract.base64,
        workchain: 0,
        publicKey: senderPublicKey,
        initParams: {
          nonce: (Math.random() * 64000).toFixed(),
        },
      };

      const expectedAddress = await provider.getExpectedAddress(testContract.ABI, deployParams);

      const stateInit = await provider.getStateInit(testContract.ABI, deployParams);

      await errorExtractor(
        provider.sendMessage({
          sender: senderAddress,
          recipient: expectedAddress,
          amount: toNano(1),
          bounce: false,
          stateInit: stateInit.stateInit,
        }),
      );

      const exampleContract: Contract<typeof testContract.ABI> = new provider.Contract(
        testContract.ABI,
        expectedAddress,
      );

      await errorExtractor(
        exampleContract.methods
          .constructor({
            someParam: someParam,
            second: secondParam,
          })
          .sendExternal({
            stateInit: stateInit.stateInit,
            publicKey: deployParams.publicKey!,
          }),
      );

      this.deployedContract = expectedAddress.toString();
    },
  },
});
</script>
