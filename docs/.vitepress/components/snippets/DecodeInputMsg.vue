<template>
  <div class="demo">
    <div>
      <label for="inputMessageBody">Input Message Body:</label>
      <input id="inputMessageBody" type="text" v-model="inputMessageBody" />
    </div>
    <button @click="decodeInputMessage">Decode Input Message</button>
    <pre v-if="decodedInputMessage">Decoded Input Message: {{ decodedInputMessage }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'DecodeInputMessage',
  setup() {
    const decodedInputMessage = ref(null);
    const inputMessageBody = ref('te6ccgEBAQEAFgAAKGcHYA4AAAAAAAAAAAAAAAAAAACZ');

    return { decodedInputMessage, inputMessageBody };
  },
  methods: {
    async decodeInputMessage() {
      if (!this.inputMessageBody) return;

      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });
      const contract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      this.decodedInputMessage = await contract.decodeInputMessage({
        internal: true,
        body: this.inputMessageBody,
        methods: ['setVariable'],
      });
    },
  },
});
</script>
