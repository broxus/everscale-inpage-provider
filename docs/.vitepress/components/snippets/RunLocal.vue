<template>
  <div class="demo">
    <button @click="runLocal">Run Local</button>
    <pre class="run-local-output" v-if="runLocalResult.value">Run local output: {{ runLocalResult.value }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { useProvider } from './../../../src/provider/useProvider';

import { testContract } from './../../helpers';

export default defineComponent({
  name: 'RunLocal',
  setup() {
    const runLocalResult: Record<any, any> = ref({});
    const testAddress: Address = inject('testAddress')!;

    return { runLocalResult };
  },
  methods: {
    async runLocal() {
      const { provider } = useProvider();

      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const exampleContract = new provider.Contract(testContract.ABI, this.testAddress);
      this.runLocalResult.value = await exampleContract.methods.setVariable({ someParam: 1 }).call();
    },
  },
});
</script>

<style scoped>
.run-local button {
  margin-bottom: 1rem;
}
</style>
