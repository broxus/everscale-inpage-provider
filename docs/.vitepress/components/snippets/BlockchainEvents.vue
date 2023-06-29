<template>
  <div class="demo">
    <div class="subscriptions">
      <button v-for="event in events" :key="event" @click="toggleSubscription(event)">
        {{ getButtonLabel(event) }}
      </button>
    </div>

    <pre class="event-data" v-if="eventData">{{ eventData }}</pre>
  </div>
</template>
<script lang="ts">
import { defineComponent, onUnmounted, reactive, ref, toRefs, Ref } from 'vue';
import { Address, ProviderRpcClient, Subscription } from 'everscale-inpage-provider';
import { testContract } from './../../helpers';
const provider = new ProviderRpcClient();
export default defineComponent({
  name: 'BlockchainEvents',
  setup() {
    const eventData = ref();
    const events = ['transactionsFound', 'contractStateChanged', 'messageStatusUpdated'];
    const subscriptions = reactive({
      transactionsFound: null,
      contractStateChanged: null,
      messageStatusUpdated: null,
    });

    const subscribeEvent = async (event: string) => {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      let subscription;
      switch (event) {
        case 'transactionsFound':
          subscription = await provider.subscribe('transactionsFound', {
            address: new Address(testContract.address),
          });
          break;
        case 'contractStateChanged':
          subscription = await provider.subscribe('contractStateChanged', {
            address: new Address(testContract.address),
          });
          break;
        case 'messageStatusUpdated':
          subscription = await provider.subscribe('messageStatusUpdated');
          break;
        default:
          throw new Error(`Unknown event: ${event}`);
      }
      subscription.on('data', data => {
        console.log(data);
        eventData.value = `${event}: ${JSON.stringify(data, undefined, 4)}`;
      });
      return subscription;
    };

    const unsubscribeEvent = (event: string) => {
      if (subscriptions[event]) {
        subscriptions[event].unsubscribe();
        subscriptions[event] = null;
      }
    };

    const toggleSubscription = async (event: string) => {
      if (subscriptions[event]) {
        unsubscribeEvent(event);
        subscriptions[event] = null;
      } else {
        subscriptions[event] = await subscribeEvent(event);
      }
    };

    const getButtonLabel = event => {
      return subscriptions[event] ? `Unsubscribe from ${event}` : `Subscribe to ${event}`;
    };

    onUnmounted(() => {
      for (const event of events) {
        if (subscriptions[event]) {
          unsubscribeEvent(event);
        }
      }
    });

    return {
      eventData,
      events,
      ...toRefs(subscriptions),
      toggleSubscription,
      getButtonLabel,
    };
  },
  methods: {
    async requestPermissions() {
      await provider.ensureInitialized();
      await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
    },
    async disconnect() {
      await provider.ensureInitialized();
      await provider.disconnect();
      this.eventData = 'Disconnected';
    },
    async changeAccount() {
      await provider.ensureInitialized();
      await provider.changeAccount();
    },
  },
});
</script>

<style scoped>
.subscriptions {
  display: flex;
  flex-direction: row;
  margin-bottom: 2rem;
}

.subscriptions button {
  width: 12rem;
  padding: 0.75rem 1rem;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.actions button {
  width: 10rem;
  padding: 0.25rem 0.5rem;
}
</style>
