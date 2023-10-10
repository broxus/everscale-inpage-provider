<template>
  <div class="demo">
    <label>
      Transaction Hash:
      <input type="text" v-model="transactionHash" />
    </label>
    <button @click="toggleTrace">Trace Transaction</button>
    <div>
      <pre>{{ JSON.stringify(transactionTraces[0], null, 2) }}</pre>
    </div>
    <!-- <div v-for="(trace, index) in transactionTraces" :key="index">
      <h3>Trace {{ index + 1 }}</h3>
      <pre>{{ JSON.stringify(trace, null, 2) }}</pre>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Stream } from 'everscale-inpage-provider';

import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

const subscriber = new provider.Subscriber();

export default defineComponent({
  name: 'SubscriberTrace',
  data() {
    return {
      transactionTraces: [],
      traceStream: null as null | Stream<any, any, any>,
      transactionHash: '2a7c997e25c5849460057e0e066525647d0b0f657195c81d5f7ffa522ab1d552',
    };
  },
  beforeDestroy() {
    this.unsubscribeTrace();
  },
  methods: {
    async toggleTrace() {
      if (this.traceStream) {
        await this.unsubscribeTrace();
      } else {
        this.traceStream = await this.subscribeTrace();
      }
    },
    async subscribeTrace() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const tx = await provider.getTransaction({
        hash: this.transactionHash,
      });

      const traceStream = subscriber.trace(tx.transaction);

      traceStream.on(data => {
        this.transactionTraces.push(data);
      });

      return traceStream;
    },
    unsubscribeTrace() {
      if (this.traceStream) {
        this.traceStream.stopProducer();
        this.traceStream = null;
      }
    },
  },
});
</script>

<style scoped>
.demo button {
  margin-bottom: 1rem;
}
.demo label {
  display: block;
  margin-bottom: 1rem;
}
</style>
