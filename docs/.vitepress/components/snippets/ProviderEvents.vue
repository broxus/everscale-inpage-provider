<template>
  <div class="demo">
    <div class="subscriptions">
      <button @click="toggleSubscription('networkChanged')">
        {{ networkChangedSubscription ? 'Unsubscribe from' : 'Subscribe to' }} NetworkChanged
      </button>
      <button @click="toggleSubscription('permissionsChanged')">
        {{ permissionsChangedSubscription ? 'Unsubscribe from' : 'Subscribe to' }} PermissionsChanged
      </button>
      <button @click="toggleSubscription('loggedOut')">
        {{ loggedOutSubscription ? 'Unsubscribe from' : 'Subscribe to' }} LoggedOut
      </button>
    </div>

    <div class="actions">
      <button @click="requestPermissions">Request Permissions</button>
      <button @click="changeAccount">Change Account</button>
      <button @click="disconnect">Disconnect</button>
    </div>

    <pre class="event-data" v-if="eventData">{{ eventData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref, Ref } from 'vue';
import { Subscription } from 'everscale-inpage-provider';
import { useProvider } from './../../../src/provider/useProvider';
const { provider } = useProvider();

export default defineComponent({
  name: 'AllEventsDemo',
  setup() {
    const eventData = ref();

    const events = ['networkChanged', 'permissionsChanged', 'loggedOut'];
    const subscriptions: Record<string, Ref<null | Subscription<any>>> = {
      networkChanged: ref(null),
      permissionsChanged: ref(null),
      loggedOut: ref(null),
    };

    const subscribeEvent = async (event: string) => {
      await provider.ensureInitialized();
      let subscription;
      switch (event) {
        case 'networkChanged':
          subscription = await provider.subscribe('networkChanged');
          break;
        case 'permissionsChanged':
          subscription = await provider.subscribe('permissionsChanged');
          break;
        case 'loggedOut':
          subscription = await provider.subscribe('loggedOut');
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

    const unsubscribeEvent = (subscription: Ref<null | Subscription<any>>) => {
      if (subscription.value) {
        subscription.value.unsubscribe();
        subscription.value = null;
      }
    };
    const toggleSubscription = async (event: string) => {
      if (subscriptions[event].value) {
        unsubscribeEvent(subscriptions[event]);
        subscriptions[event].value = null;
      } else {
        subscriptions[event].value = await subscribeEvent(event);
      }
    };

    onUnmounted(() => {
      for (const event of events) {
        if (subscriptions[event].value) {
          unsubscribeEvent(subscriptions[event]);
        }
      }
    });
    return {
      eventData,
      networkChangedSubscription: subscriptions.networkChanged,
      permissionsChangedSubscription: subscriptions.permissionsChanged,
      loggedOutSubscription: subscriptions.loggedOut,
      toggleSubscription,
    };
  },
  methods: {
    async requestPermissions() {
      await provider.ensureInitialized();
      await provider.requestPermissions({
        permissions: ['basic'],
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

  /* justify-content: right; */
  /* align-items: center; */
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
