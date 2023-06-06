<template>
  <div class="demo">
    <button @click="toggleSubscription">
      {{ transactionsStream ? 'Unsubscribe from' : 'Subscribe to' }} transactions
    </button>
    <button @click="testTransaction">Test Transaction</button>
    <div v-for="(transaction, index) in transactions" :key="index">
      <h3>Transaction {{ index + 1 }}</h3>
      <pre>{{ JSON.stringify(transaction, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted } from 'vue';
import { ProviderRpcClient, Stream, Address } from 'everscale-inpage-provider';
import { testContract, toNano } from '../../helpers';

const provider = new ProviderRpcClient();
const subscriber = new provider.Subscriber();

export default defineComponent({
  name: 'SubscriberTx',
  data() {
    return {
      transactions: [],
      transactionsStream: null as null | Stream<any, any, any>,
    };
  },
  beforeDestroy() {
    this.unsubscribeTransactions();
  },
  methods: {
    async toggleSubscription() {
      if (this.transactionsStream) {
        await this.unsubscribeTransactions();
      } else {
        this.transactionsStream = await this.subscribeTransactions();
      }
    },
    async subscribeTransactions() {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const stream = subscriber.transactions(new Address(testContract.address));
      stream.on(data => {
        console.log('New transactions:', data);
        this.transactions.push(data);
      });

      return stream;
    },
    unsubscribeTransactions() {
      if (this.transactionsStream) {
        this.transactionsStream.stopProducer();
        this.transactionsStream = null;
      }
    },
    async testTransaction() {
      const provider = new ProviderRpcClient();
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
