<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedContractState">
      <div>Simple State: {{ parsedContractState.simpleState }}</div>
    </div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendInternalMessage">Send internal message</button>
    <pre v-if="transactionData != null">{{ transactionData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract, errorExtractor, toNano } from './../../helpers';

export default defineComponent({
  name: 'SendInternalMessage',
  async setup() {
    const transactionData = ref();
    const someParam = ref(1337);

    const provider = new ProviderRpcClient();

    const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
    const state = await exampleContract.methods.simpleState().call();

    const contractState = ref(JSON.stringify(state, null, 2));

    return { transactionData, contractState, someParam };
  },
  computed: {
    parsedContractState() {
      try {
        return JSON.parse(this.contractState);
      } catch (error) {
        return null;
      }
    },
  },
  methods: {
    async sendInternalMessage() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();
      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      const senderPublicKey = accountInteraction?.publicKey!;
      const senderAddress = accountInteraction?.address!;

      if (!senderPublicKey) {
        throw new Error('No public key');
      }
      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      const payload = {
        abi: JSON.stringify(testContract.ABI),
        method: 'setVariable',
        params: {
          someParam: this.someParam,
        },
      };
      const tx = await errorExtractor(
        provider.sendMessage({
          sender: senderAddress,
          recipient: new Address(testContract.address),
          amount: toNano(1),
          bounce: true,
          payload: payload,
        }),
      );

      const s = await exampleContract.waitForEvent({ filter: event => event.event === 'StateChanged' });
      console.log(JSON.stringify(s, null, 2));
      const state = await exampleContract.methods.simpleState().call();
      this.contractState = JSON.stringify(state, null, 2);
      this.transaction = JSON.stringify(tx.transaction, null, 2);
    },
  },
});
</script>

<style scoped>
.contract-state {
  margin-bottom: 1rem;
}
</style>
