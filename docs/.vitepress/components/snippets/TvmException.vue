<template>
  <div class="demo">
    <button @click="throwTvmException">computeSmth</button>
    <a
      v-if="exceptionCode != null"
      target="_blank"
      href="https://github.com/tonlabs/ton-labs-contracts/blob/e7821cec3514869979f702047348b2faf35b7b3f/solidity/depool/DePool.sol#L1428"
    >
      <pre>require(offset &lt; 1000, 1337);</pre>
    </a>
    <pre v-if="exceptionCode">TVM Exception: {{ exceptionCode }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient, TvmException, Address } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';

export default defineComponent({
  name: 'TvmException',
  setup() {
    const exceptionCode = ref();

    return { exceptionCode };
  },
  methods: {
    async throwTvmException() {
      const provider = new ProviderRpcClient();
      await provider.ensureInitialized();

      await provider.requestPermissions({
        permissions: ['basic'],
      });

      const example = new provider.Contract(testContract.ABI, new Address(testContract.address));

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
