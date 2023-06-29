<template>
  <div class="demo">
    <label>
      Transaction Hash:
      <input type="text" v-model="transactionHash" />
    </label>
    <button @click="toggleTrace">{{ traceStream ? 'Unsubscribe from' : 'Subscribe to' }} transaction traces</button>
    <div v-for="(trace, index) in transactionTraces" :key="index">
      <h3>Trace {{ index + 1 }}</h3>
      <pre>{{ JSON.stringify(trace, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ProviderRpcClient, Stream, TransactionId } from 'everscale-inpage-provider';

const provider = new ProviderRpcClient();
const subscriber = new provider.Subscriber();

export default defineComponent({
  name: 'SubscriberTrace',
  data() {
    return {
      transactionTraces: [],
      traceStream: null as null | Stream<any, any, any>,
      transactionHash: '5eb6c0150d768f5f4612fac65c6ec6dd0a754081eeae3dc4cb257280587ae64d',
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
        console.log('Child transactions:', data);
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
    async testTransaction() {
      // the same as in the previous component
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
