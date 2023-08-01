<template>
  <div class="demo">
    <div>
      <label for="boc">BOC:</label>
      <input id="boc" type="text" v-model="bocToHash" />
    </div>
    <button @click="executeApiCall">getBocHash</button>
    <pre v-if="bocHash">{{ bocHash }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

export default defineComponent({
  setup() {
    const bocHash = ref('');
    const bocToHash = ref('te6ccgEBAwEAGQACCAAAAB4CAQAQTmV3IFlvcmsACkFsaWNl');

    return { bocHash, bocToHash };
  },
  methods: {
    async getBocHash(boc: string): Promise<string> {
      await provider.ensureInitialized();
      const hash = await provider.getBocHash(boc);
      return hash;
    },

    async executeApiCall() {
      await provider.requestPermissions({ permissions: ['basic'] });

      const hash = await this.getBocHash(this.bocToHash);
      this.bocHash = `BOC hash: ${hash}`;
    },
  },
});
</script>
