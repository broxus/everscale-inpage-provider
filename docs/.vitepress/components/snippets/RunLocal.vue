<template>
  <div class="demo">
    <button @click="runLocal">Run Local</button>
    <pre class="run-local-output" v-if="runLocalResult.value">Run local output: {{ runLocalResult.value.output }}</pre>
    <pre class="run-local-code" v-if="runLocalResult.value">TVM execution code: {{ runLocalResult.value.code }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';

export default defineComponent({
  name: 'RunLocal',
  setup() {
    const runLocalResult: Record<any, any> = ref({});

    return { runLocalResult };
  },
  methods: {
    async runLocal() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const exampleAddress = testContract.address;

      this.runLocalResult.value = await provider.rawApi.runLocal({
        address: exampleAddress,

        functionCall: {
          abi: JSON.stringify(testContract.ABI),
          method: 'setVariable',
          params: {
            someParam: 1400,
          },
        },
      });
    },
  },
});
</script>

<style scoped>
.run-local button {
  margin-bottom: 1rem;
}
</style>
