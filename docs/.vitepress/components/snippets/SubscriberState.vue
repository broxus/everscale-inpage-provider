<template>
  <div class="demo">
    <button @click="toggleSubscription">{{ statesStream ? 'Unsubscribe from' : 'Subscribe to' }} state changes</button>
    <button @click="testStateChange">Test State Change</button>
    <div v-for="(state, index) in states" :key="index">
      <h3>State Change {{ index + 1 }}</h3>
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Stream, Address } from 'everscale-inpage-provider';
import { testContract, toNano } from '../../helpers';

import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

const subscriber = new provider.Subscriber();

export default defineComponent({
  name: 'SubscriberState',
  data() {
    return {
      states: [],
      statesStream: null as null | Stream<any, any, any>,
    };
  },
  beforeDestroy() {
    this.unsubscribeStates();
  },
  methods: {
    async toggleSubscription() {
      if (this.statesStream) {
        await this.unsubscribeStates();
      } else {
        this.statesStream = await this.subscribeStates();
      }
    },
    async subscribeStates() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const stream = subscriber.states(new Address(testContract.address));
      stream.on(data => {
        console.log('State changed:', data);
        this.states.push(data);
      });

      return stream;
    },
    unsubscribeStates() {
      if (this.statesStream) {
        this.statesStream.stopProducer();
        this.statesStream = null;
      }
    },
    async testStateChange() {
      const { provider } = useProvider();

      await provider.ensureInitialized();
      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      const senderPublicKey = accountInteraction?.publicKey!;
      const senderAddress = accountInteraction?.address!;

      if (!senderPublicKey) {
        throw new Error('No public key');
      }

      const payload = {
        abi: JSON.stringify(testContract.ABI),
        method: 'setVariable',
        params: {
          someParam: 1337,
        },
      };

      await provider.sendMessage({
        sender: senderAddress,
        recipient: new Address(testContract.address),
        amount: toNano(1),
        bounce: true,
        payload: payload,
      });
    },
  },
});
</script>

<style scoped>
.demo button {
  margin-bottom: 1rem;
}
</style>
