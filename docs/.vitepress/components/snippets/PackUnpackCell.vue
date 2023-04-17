<template>
  <div class="demo">
    <div>
      <label for="name">Name:</label>
      <input id="name" type="text" v-model="dataToPack.name" />
    </div>
    <div>
      <label for="age">Age:</label>
      <input id="age" type="number" v-model="dataToPack.age" />
    </div>
    <div>
      <label for="city">City:</label>
      <input id="city" type="text" v-model="dataToPack.city" />
    </div>
    <button @click="executeApiCall">Run</button>
    <pre v-if="apiResult">{{ apiResult }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

const provider = new ProviderRpcClient();

const abiStructure = [
  { name: 'name', type: 'string' },
  { name: 'age', type: 'uint32' },
  { name: 'city', type: 'string' },
] as const;

export default defineComponent({
  setup() {
    const apiResult = ref('');
    const dataToPack = ref({
      name: 'Alice',
      age: 30,
      city: 'New York',
    });

    return { apiResult, dataToPack };
  },
  methods: {
    async packData(): Promise<{ boc: string; hash: string }> {
      await provider.ensureInitialized();

      const { boc, hash } = await provider.packIntoCell({
        structure: abiStructure,
        data: this.dataToPack,
      });

      return { boc, hash };
    },

    async unpackData(boc: string) {
      await provider.ensureInitialized();

      const unpacked = await provider.unpackFromCell({
        structure: abiStructure,
        boc: boc,
        allowPartial: true,
      });

      return unpacked.data;
    },

    async executeApiCall() {
      await provider.requestPermissions({ permissions: ['basic'] });

      const packedData = await this.packData();
      const unpackedData = await this.unpackData(packedData.boc);

      this.apiResult = `Packed Data: ${JSON.stringify(packedData, null, 2)}\n\nUnpacked Data: ${JSON.stringify(
        unpackedData,
        null,
        2,
      )}`;
    },
  },
});
</script>
