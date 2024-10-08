<template>
  <div class="demo">
    <button @click="encryptData">Encrypt Data</button>
    <button @click="decryptData" :disabled="!encryptedData">Decrypt Data</button>
    <pre v-if="encryptedData">Encrypted Data: {{ encryptedData }}</pre>
    <pre v-if="decryptedData">Decrypted Data: {{ decryptedData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Base64 } from 'js-base64';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  setup() {
    const encryptedData = ref('');
    const decryptedData = ref('');

    return { encryptedData, decryptedData };
  },

  methods: {
    async encryptData() {
      await provider.ensureInitialized();
      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      const publicKey = accountInteraction?.publicKey!;
      const data = 'encrypt-test-42';

      const encryptedDataList = await provider.encryptData({
        publicKey: publicKey,
        recipientPublicKeys: [publicKey],
        algorithm: 'ChaCha20Poly1305',
        data: Base64.encode(data),
      });

      this.encryptedData = JSON.stringify(encryptedDataList[0], null, 2);
    },

    async decryptData() {
      if (!this.encryptedData) {
        console.error('Encrypted data is not set. Use "Encrypt Data" first.');
        return;
      }

      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic', 'accountInteraction'] });

      const encryptedDataObj = JSON.parse(this.encryptedData);
      this.decryptedData = await provider.decryptData(encryptedDataObj);
    },
  },
});
</script>
