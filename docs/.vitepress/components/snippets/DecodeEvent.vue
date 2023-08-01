<template>
  <div class="demo">
    <div>
      <label for="encodedEvent">Event Boc:</label>
      <input id="encodedEvent" type="text" v-model="encodedEvent" />
    </div>
    <button @click="decodeEvent">Decode Event</button>
    <pre v-if="decodedEvent">Decoded Event: {{ decodedEvent }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

export default defineComponent({
  name: 'DecodeEvent',
  setup() {
    const decodedEvent = ref(null);
    const encodedEvent = ref('te6ccgEBAgEAEQABEFM5yKUAAACZAQAIdGVzdA==');

    return { decodedEvent, encodedEvent };
  },
  methods: {
    async decodeEvent() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: [`basic`, `accountInteraction`] });
      const contract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      this.decodedEvent = await contract.decodeEvent({
        body: this.encodedEvent,
        events: ['StateChanged'],
      });
    },
  },
});
</script>
