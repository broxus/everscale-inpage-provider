<template>
  <div class="demo">
    <div>
      <label for="nonce">Nonce:</label>
      <input id="nonce" type="number" v-model="nonce" />
    </div>
    <button @click="getExpectedAddress">Get Expected Address</button>
    <pre v-if="expectedAddress">{{ expectedAddress }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  setup() {
    const nonce = ref(0);
    const expectedAddress = ref('');

    return { nonce, expectedAddress };
  },

  methods: {
    async getExpectedAddress() {
      await provider.ensureInitialized();
      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      const senderPublicKey = accountInteraction?.publicKey;
      if (!senderPublicKey) {
        throw new Error('No public key');
      }

      const deployParams = {
        tvc: testContract.base64,
        workchain: 0,
        publicKey: senderPublicKey,
        initParams: {
          nonce: this.nonce,
        },
      };
      const address = await provider.getExpectedAddress(testContract.ABI, deployParams);
      this.expectedAddress = address.toString();
    },
  },
});
</script>
