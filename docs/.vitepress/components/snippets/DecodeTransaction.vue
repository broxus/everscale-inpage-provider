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
import { defineComponent, inject, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'DecodeTransaction',
  setup() {
    const decodedTransaction = ref(null);
    const transactionHash = ref('1ee4e54aae183b683d65149a4d34a822942b49e391fe33b7b8c80f7b0898f7b8');
    const testAddress: Address = inject('testAddress')!;
    return { decodedTransaction, transactionHash, testAddress };
  },
  methods: {
    async decodeTransaction() {
      if (!this.transactionHash) return;

      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });

      const contract = new provider.Contract(testContract.ABI, this.testAddress);

      const tx = await provider.getTransaction({
        hash: this.transactionHash,
      });

      if (!tx.transaction) {
        this.decodedTransaction = null;
        throw new Error(`Transaction not found`);
      }

      const decodedTransaction = await contract.decodeTransaction({
        transaction: tx.transaction,
        methods: [
          'setVariable',
          'setVariableExternal',
          'getSecondElementWithPrefix',
          'getComplexState',
          'simpleState',
          'computeSmth',
        ],
      });

      if (!decodedTransaction) {
        this.decodedTransaction = null;
        throw new Error(`Decoding failed`);
      }
      this.decodedTransaction = decodedTransaction;
    },
  },
});
</script>
