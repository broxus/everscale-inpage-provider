<template>
  <div class="demo">
    <button @click="getProviderState">getProviderState</button>
    <pre v-if="providerState != null">{{ providerState }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

export default defineComponent({
  name: 'GetProviderStateComponent',
  setup() {
    const ever = new ProviderRpcClient();
    const providerState = ref();
    const getProviderState = async () => {
      await ever.ensureInitialized();
      providerState.value = await ever.rawApi.getProviderState().then(state => JSON.stringify(state, undefined, 4));
    };

    return {
      providerState,
      getProviderState,
    };
  },
});
</script>
