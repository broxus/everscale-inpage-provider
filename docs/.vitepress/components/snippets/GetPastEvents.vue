<template>
  <div class="demo">
    <div>
      <label for="timestamp">Timestamp:</label>
      <input id="timestamp" type="text" v-model="timestamp" />
    </div>
    <button @click="getPastEvents">getPastEvents</button>
    <pre v-if="pastEvents">Past Events: {{ pastEvents }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Address } from 'everscale-inpage-provider';
import { testContract } from '../../helpers';

import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

export default defineComponent({
  name: 'GetPastEvents',
  setup() {
    const pastEvents = ref(null);
    const timestamp = ref(Math.round(Date.now() / 1000));

    return { pastEvents, timestamp };
  },
  methods: {
    async getPastEvents() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      this.pastEvents = await exampleContract.getPastEvents({
        filter: 'StateChanged',
        range: {
          fromUtime: Number(this.timestamp),
        },
      });
    },
  },
});
</script>
