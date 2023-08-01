<template>
  <div class="demo">
    <button @click="computeSmth">computeSmth</button>
    <pre class="computed-result" v-if="computedResult">Computed result: {{ computedResult }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';

import { useProvider } from './../../../src/provider/useProvider';
import { testContract } from './../../helpers';

export default defineComponent({
  name: 'ComputeSmth',
  setup() {
    const computedResult = ref('');

    return { computedResult };
  },
  methods: {
    async computeSmth() {
      const { provider } = useProvider();

      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, new Address(testContract.address));

      const offset = 42;
      const computedResult = await example.methods.computeSmth({ offset, answerId: 13 }).call({ responsible: true });

      this.computedResult = JSON.stringify(computedResult.res, null, 2);
    },
  },
});
</script>
