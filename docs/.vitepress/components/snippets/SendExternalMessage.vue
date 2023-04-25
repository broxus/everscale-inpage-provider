<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedSimpleState">
      <div>Simple State: {{ parsedSimpleState.simpleState }}</div>
    </div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendExternalMessage">Send external message</button>
    <pre v-if="transactionData != null">{{ transactionData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract, errorExtractor } from './../../helpers';

export default defineComponent({
  name: 'SendExternalMessage',
  async setup() {
    const transactionData = ref();
    const someParam = ref(42);

    const provider = new ProviderRpcClient();

    const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
    const state = await exampleContract.methods.simpleState().call();

    const simpleState = ref(JSON.stringify(state, null, 2));

    return { transactionData, simpleState, someParam };
  },
  computed: {
    parsedSimpleState() {
      try {
        return JSON.parse(this.simpleState);
      } catch (error) {
        return null;
      }
    },
  },
  methods: {
    async sendExternalMessage() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();
      await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
      const providerState = await provider.getProviderState();
      const senderPublicKey = providerState?.permissions.accountInteraction?.publicKey;

      if (!senderPublicKey) {
        throw new Error('No public key');
      }

      const payload = {
        abi: JSON.stringify(testContract.ABI),
        method: 'setVariableExternal',
        params: {
          someParam: this.someParam,
        },
      };
      // const { transaction: tr, output } = await provider.rawApi.sendExternalMessage({
      //   publicKey: senderPublicKey?.toString(),
      //   recipient: testContract.address,
      //   payload,
      // });
      // console.log('Transaction:', tr);

      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
      console.log(this.someParam);
      const tx = await errorExtractor(
        exampleContract.methods.setVariableExternal({ someParam: this.someParam }).sendExternal({
          publicKey: senderPublicKey!,
        }),
      );
      console.log('Transaction:', tx);
      const state = await exampleContract.methods.simpleState().call();
      this.simpleState = JSON.stringify(state, null, 2);
    },
  },
});
</script>

<style scoped>
.contract-state {
  margin-bottom: 1rem;
}
</style>
