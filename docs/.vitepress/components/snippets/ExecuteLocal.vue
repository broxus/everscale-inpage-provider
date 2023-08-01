<template>
  <div class="demo">
    <button @click="executeLocal">Execute Local</button>
    <pre class="execute-local-transaction" v-if="executeLocalResult.value">
Executed transaction: {{ executeLocalResult.value.transaction }}</pre
    >
    <pre class="execute-local-state" v-if="executeLocalResult.value">
New contract state: {{ executeLocalResult.value.newState }}</pre
    >
    <pre class="execute-local-output" v-if="executeLocalResult.value">
Parsed function call output: {{ executeLocalResult.value.output }}</pre
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { testContract } from './../../helpers';
import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'ExecuteLocal',
  setup() {
    const executeLocalResult: Record<any, any> = ref({});

    return { executeLocalResult };
  },
  methods: {
    async executeLocal() {
      await provider.ensureInitialized();

      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      this.executeLocalResult.value = await provider.rawApi.executeLocal({
        address: testContract.address,
        messageHeader: {
          type: 'internal',
          sender: accountInteraction!.address.toString(),
          amount: (1 * 10 ** 9).toString(),
          bounce: true,
        },
        payload: {
          abi: JSON.stringify(testContract.ABI),
          method: 'setVariable',
          params: {
            someParam: 42,
          },
        },
      });
    },
  },
});
</script>

<style scoped>
.execute-local button {
  margin-bottom: 1rem;
}
</style>
