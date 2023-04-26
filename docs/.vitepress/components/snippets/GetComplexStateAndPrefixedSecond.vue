<template>
  <div class="demo">
    <button @click="getComplexState">getComplexState</button>
    <button @click="getPrefixedSecond">getSecondElementWithPrefix</button>

    <div class="contract-state" v-if="complexState || prefixedSecond">
      <pre v-if="complexState">Complex State: {{ complexState }}</pre>
      <pre v-if="prefixedSecond">Prefixed Second: {{ prefixedSecond }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';

export default defineComponent({
  name: 'GetComplexStateAndPrefixedSecond',
  setup() {
    const complexState = ref();
    const prefixedSecond = ref();
    const prefix = ref('');

    return { complexState, prefixedSecond, prefix };
  },
  methods: {
    async getComplexState() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, new Address(testContract.address));

      const { value0: complexState } = await example.methods.getComplexState().call();

      this.complexState = JSON.stringify(complexState, null, 2);
      this.prefixedSecond = null;
    },
    async getPrefixedSecond() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, new Address(testContract.address));
      const state = await provider.getFullContractState({ address: new Address(testContract.address) })!;
      const { value0: secondElementWithPrefix } = await example.methods
        .getSecondElementWithPrefix({ prefix: 'foo' })
        .call({ cachedState: state.state });
      this.prefixedSecond = secondElementWithPrefix;
      this.complexState = null;
    },
  },
});
</script>
