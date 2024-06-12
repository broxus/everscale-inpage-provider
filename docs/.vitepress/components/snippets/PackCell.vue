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
    <button @click="executeApiCall">packData</button>
    <pre v-if="packedData">{{ packedData }}</pre>
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
  setup() {
    const packedData = ref('');
    const dataToPack = ref({
      name: 'Alice',
      age: 30,
      city: 'New York',
    });

    return { packedData, dataToPack };
  },
  methods: {
    async packData(): Promise<{ boc: string; hash: string }> {
      await provider.ensureInitialized();

      const { boc, hash } = await provider.packIntoCell({
        structure: ABI,
        data: this.dataToPack,
      });

      return { boc, hash };
    },

    async executeApiCall() {
      await provider.requestPermissions({ permissions: ['basic'] });

      const packed = await this.packData();
      this.packedData = JSON.stringify(packed, null, 2);
    },
  },
});
</script>
