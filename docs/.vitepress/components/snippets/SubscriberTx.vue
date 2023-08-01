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
import { defineComponent } from 'vue';
import { Stream, Address } from 'everscale-inpage-provider';
import { testContract, toNano } from '../../helpers';

import { useProvider } from './../../../src/provider/useProvider';

const { provider } = useProvider();

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

      const flatMappedStream = stream.flatMap(item => {
        return item.transactions.map(transaction => ({
          address: item.address,
          transaction: transaction,
          info: item.info,
        }));
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
