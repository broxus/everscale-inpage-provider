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
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  name: 'DecodeOutputMessage',
  setup() {
    const decodedOutputMessage = ref(null);
    const outputMessageBody = ref(`te6ccgEBAgEAEQABEFM5yKUAAABXAQAIdGVzdA==`);

    return { decodedOutputMessage, outputMessageBody };
  },
  methods: {
    async decodeOutputMessage() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });
      const contract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      this.decodedOutputMessage = await contract.decodeOutputMessage({
        body: this.outputMessageBody,
        methods: ['setVariable', 'setVariableExternal'],
      });
    },
  },
});
</script>
