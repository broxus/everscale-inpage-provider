<template>
  <div class="demo">
    <div>
      <label for="boc">BOC:</label>
      <input id="boc" type="text" v-model="bocToUnpack" />
    </div>
    <button @click="executeApiCall">unpackData</button>
    <pre v-if="unpackedData">{{ unpackedData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

const ABI = [
  { name: 'name', type: 'string' },
  { name: 'age', type: 'uint32' },
  { name: 'city', type: 'string' },
] as const;

export default defineComponent({
  name: 'UnpackCell',
  setup() {
    const unpackedData = ref('');
    const bocToUnpack = ref('te6ccgEBAwEAGQACCAAAAB4CAQAQTmV3IFlvcmsACkFsaWNl');

    return { unpackedData, bocToUnpack };
  },
  methods: {
    async unpackData(boc: string) {
      await provider.ensureInitialized();

      const unpacked = await provider.unpackFromCell({
        structure: ABI,
        boc: boc,
        allowPartial: true,
      });

      return unpacked.data;
    },

    async executeApiCall() {
      await provider.requestPermissions({ permissions: ['basic'] });

      const unpacked = await this.unpackData(this.bocToUnpack);
      this.unpackedData = JSON.stringify(unpacked, null, 2);
    },
  },
});
</script>
