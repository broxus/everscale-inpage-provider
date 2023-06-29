<template>
  <div class="demo">
    <div>
      <label for="base64Contract">Base64 Contract:</label>
      <input id="base64Contract" type="text" v-model="base64Contract" />
    </div>
    <button @click="convertToTvc">Convert to TVC</button>
    <pre v-if="tvc">TVC: {{ tvc }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';
const provider = new ProviderRpcClient();

export default defineComponent({
  name: 'CodeToTVC',
  setup() {
    const base64Contract = ref(testContract.base64);
    const tvc = ref('');

    return { base64Contract, tvc };
  },
  methods: {
    async convertToTvc() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`] });
      this.tvc = await provider.codeToTvc(this.base64Contract);
    },
  },
});
</script>
