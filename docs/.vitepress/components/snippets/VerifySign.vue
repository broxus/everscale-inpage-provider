<template>
  <div class="demo">
    <div>
      <label for="publicKey">Public Key:</label>
      <input id="publicKey" type="text" v-model="publicKey" />
    </div>
    <div>
      <label for="signature">Signature:</label>
      <input id="signature" type="text" v-model="signature" />
    </div>
    <div>
      <label for="dataHash">Data Hash:</label>
      <input id="dataHash" type="text" v-model="dataHash" />
    </div>
    <button @click="verifySignature">Verify Signature</button>
    <pre v-if="isValid">Signature is valid: {{ isValid }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ProviderRpcClient } from 'everscale-inpage-provider';

const provider = new ProviderRpcClient();

export default defineComponent({
  name: 'VerifySignature',
  setup() {
    const publicKey = ref('fbe51100154bc12d9269905d2f9aaaea75588ab439a8f911fd5a2adeb6d2b5a7');
    const signature = ref('L+QYhOjZNVJXcOQFa6nb7ELPenwX3VQBibZVxjmis+k+fA/E3G0thKL/98+klD6swljMHwB/PMirIinoVYw9Cg==');
    const dataHash = ref('9d2157c26e70bd16e3b70f7fb4373dc1d1aedddf24efcbf27234597b40bf277e');
    const isValid = ref(null);

    return { publicKey, signature, dataHash, isValid };
  },
  methods: {
    async verifySignature() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const result = await provider.verifySignature({
        publicKey: this.publicKey,
        signature: this.signature,
        dataHash: this.dataHash,
      });

      this.isValid = result.isValid ? 'true' : 'false';
    },
  },
});
</script>
