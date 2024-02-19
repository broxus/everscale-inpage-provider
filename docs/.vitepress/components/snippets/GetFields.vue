<template>
  <div class="demo">
    <button @click="getContractFields">getFields</button>
    <pre class="contract-fields" v-if="contractFields">Contract Fields: {{ contractFields }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';
import { useProvider } from './../../../src/provider/useProvider';

export default defineComponent({
  name: 'GetContractFields',
  setup() {
    const contractFields = ref('');
    const testAddress: Address = inject('testAddress')!;
    return { contractFields, testAddress };
  },
  methods: {
    async getContractFields() {
      const { provider } = useProvider();

      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, this.testAddress);
      const { fields, state } = await example.getFields();

      this.contractFields = JSON.stringify({ fields, state }, null, 2);
    },
  },
});
</script>
