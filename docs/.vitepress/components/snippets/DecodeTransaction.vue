<template>
  <div class="demo">
    <div>
      <label for="transactionHash">Transaction Hash:</label>
      <input id="transactionHash" type="text" v-model="transactionHash" />
    </div>
    <button @click="decodeTransaction">Decode Transaction</button>
    <pre v-if="decodedTransaction">Decoded Transaction: {{ decodedTransaction }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  name: 'DecodeTransaction',
  setup() {
    const decodedTransaction = ref(null);
    const transactionHash = ref('46e15231f113995b3075379066307374660391dd0a643574dad2092a1358d7eb');

    return { decodedTransaction, transactionHash };
  },
  methods: {
    async decodeTransaction() {
      if (!this.transactionHash) return;

      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });
      const contract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      const tx = await provider.getTransaction({
        hash: this.transactionHash,
      });

      this.decodedTransaction = await contract.decodeTransaction({
        transaction: tx.transaction!,
        methods: ['setVariable'],
      });
    },
  },
});
</script>
