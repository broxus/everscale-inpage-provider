<template>
  <div class="demo">
    <div>
      <label for="outputMessage">Message Boc:</label>
      <input id="outputMessage" type="text" v-model="outputMessageBody" />
    </div>
    <button @click="decodeOutputMessage">Decode Output Message</button>
    <pre v-if="decodedOutputMessage">Decoded Output Message: {{ decodedOutputMessage }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'DecodeOutputMessage',
  setup() {
    const decodedOutputMessage = ref(null);
    const outputMessageBody = ref(`te6ccgEBAgEAEQABEFM5yKUAAABXAQAIdGVzdA==`);
    const testAddress: Address = inject('testAddress')!;
    return { decodedOutputMessage, outputMessageBody, testAddress };
  },
  methods: {
    async decodeOutputMessage() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });

      const contract = new provider.Contract(testContract.ABI, this.testAddress);

      this.decodedOutputMessage = await contract.decodeOutputMessage({
        body: this.outputMessageBody,
        methods: ['setVariable', 'setVariableExternal'],
      });
    },
  },
});
</script>
