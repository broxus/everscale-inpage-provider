<template>
  <div class="demo">
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
    const outputMessageBody = ref(
      `te6ccgEBAQEAbwAA2WgAeTEn+cGIA88SHdjLM4FvN8SmKFM9iPU88MT4hdKPryUAAbEBJmLtKb1z+Rlk54+NWLtVz4n95BjVbGp4c9h9bouQ7msoAAYKLDAAACjYV/lBhMpLpf4cbWh2AAAAAAAAAAAAAAAAAAAAFUA=`,
    );
    const testAddress: Address = inject('testAddress')!;
    return { decodedOutputMessage, outputMessageBody, testAddress };
  },
  methods: {
    async decodeOutputMessage() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });

      const contract = new provider.Contract(testContract.ABI, this.testAddress);
      console.log(
        await contract.decodeOutputMessage({
          body: this.outputMessageBody,
          methods: ['setVariable', 'setVariableExternal'],
        }),
      );
      this.decodedOutputMessage = await contract.decodeOutputMessage({
        body: this.outputMessageBody,
        methods: ['setVariable'],
      });
    },
  },
});
</script>
