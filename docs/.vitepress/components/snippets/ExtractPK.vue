<template>
  <div class="demo">
    <div>
      <label for="rawAccountState">Contract BOC:</label>
      <input id="rawAccountState" type="text" v-model="boc" />
    </div>
    <button @click="getPublicKey">Extract Public Key</button>
    <pre v-if="publicKey">Public Key: {{ publicKey }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';
import { testContract } from '../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  setup() {
    const boc = ref(testContract.boc);
    const publicKey = ref('');

    return { boc, publicKey };
  },
  methods: {
    async getPublicKey() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`] });

      this.publicKey = await provider.extractPublicKey(this.boc);
    },
  },
});
</script>
