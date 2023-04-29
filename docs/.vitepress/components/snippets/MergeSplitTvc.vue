<template>
  <div class="demo">
    <div>
      <label for="code">Code:</label>
      <input id="code" type="text" v-model="code" />
    </div>
    <div>
      <label for="data">Data:</label>
      <input id="data" type="text" v-model="data" />
    </div>
    <button @click="mergeAndSplit">Merge and Split TVC</button>

    <pre v-if="mergedTvc">TVC: {{ mergedTvc }}</pre>
    <pre v-if="splitCode">Splited Code: {{ splitCode }}</pre>
    <pre v-if="splitData">Splited Data: {{ splitData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from '../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  setup() {
    const code = ref(testContract.base64);
    const data = ref(testContract.boc);
    const mergedTvc = ref('');
    const splitCode = ref('');
    const splitData = ref('');

    return { code, data, mergedTvc, splitCode, splitData };
  },

  methods: {
    async mergeAndSplit() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`] });
      const merged = await provider.mergeTvc({ code: this.code, data: this.data });
      this.mergedTvc = merged.tvc;

      const { code, data } = await provider.splitTvc(merged.tvc);
      this.splitCode = code;
      this.splitData = data;
    },
  },
});
</script>
