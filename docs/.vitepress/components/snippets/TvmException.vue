<template>
  <div class="demo">
    <button @click="throwTvmException">computeSmth</button>

    <pre>require(offset &lt; 1000, 1337);</pre>

    <pre v-if="exceptionCode">TVM Exception: {{ exceptionCode }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { TvmException, Address } from 'everscale-inpage-provider';

import { useProvider } from './../../../src/provider/useProvider';
import { testContract } from './../../helpers';

export default defineComponent({
  name: 'TvmException',
  setup() {
    const exceptionCode = ref();
    const testAddress: Address = inject('testAddress')!;

    return { exceptionCode, testAddress };
  },
  methods: {
    async throwTvmException() {
      const { provider } = useProvider();

      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, this.testAddress);

      try {
        await example.methods.computeSmth({ offset: 1444, answerId: 2 }).call({ responsible: true });
      } catch (e) {
        if (e instanceof TvmException) {
          this.exceptionCode = e.code;
        }
      }
    },
  },
});
</script>
