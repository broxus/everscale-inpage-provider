<template>
  <div class="demo">
    <div>
      <label for="data">Data:</label>
      <input id="data" type="text" v-model="data" />
    </div>
    <button @click="signData">Sign Data</button>
    <button @click="signDataRaw">Sign Data Raw</button>
    <pre v-if="signedData">Signed Data: {{ signedData }}</pre>
    <pre v-if="signedDataRaw">Signed Data (raw): {{ signedDataRaw }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Base64 } from 'js-base64';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'SignAndSignRaw',
  setup() {
    const data = ref('example42');
    const signedData = ref('');
    const signedDataRaw = ref('');

    return { data, signedData, signedDataRaw };
  },
  methods: {
    async signData() {
      await provider.ensureInitialized();
      const permissions = await provider.requestPermissions({ permissions: ['basic', 'accountInteraction'] });
      const publicKey = permissions.accountInteraction?.publicKey!;

      this.signedData = await provider.signData({
        publicKey: publicKey,
        data: Base64.encode(this.data),
      });
    },
    async signDataRaw() {
      await provider.ensureInitialized();
      const permissions = await provider.requestPermissions({ permissions: ['basic', 'accountInteraction'] });
      const publicKey = permissions.accountInteraction?.publicKey!;

      this.signedDataRaw = await provider.signDataRaw({
        publicKey: publicKey,
        data: Base64.encode(this.data),
      });
    },
  },
});
</script>
