<template>
  <div class="demo">
    <button @click="toggleSubscription">
      {{ buttonLabel }}
    </button>
    <button @click="triggerEvent">send</button>
    <pre class="event-data" v-if="eventData">{{ eventData }}</pre>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';
import { testContract } from '../../helpers';

const provider = new ProviderRpcClient();

export default defineComponent({
  name: 'ListenContractEvents',
  setup() {
    const eventData = ref();
    const subscription = ref();
    const buttonLabel = ref('Subscribe');

    const toggleSubscription = async () => {
      if (subscription.value) {
        subscription.value.unsubscribe();
        subscription.value = null;
        buttonLabel.value = 'Subscribe';
      } else {
        subscription.value = await subscribeEvent();
        buttonLabel.value = 'Unsubscribe';
      }
    };

    const subscribeEvent = async () => {
      await provider.ensureInitialized();
      await provider.requestPermissions({ permissions: ['basic'] });

      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
      const subscriber = new provider.Subscriber();

      const contractEvents = exampleContract.events(subscriber);

      const eventCallback = event => {
        eventData.value = JSON.stringify(event, null, 2);
      };

      contractEvents.on(eventCallback);

      return {
        unsubscribe() {
          contractEvents.stopProducer();
        },
      };
    };

    const triggerEvent = async () => {
      await provider.ensureInitialized();
      const { accountInteraction } = await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });

      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
      const senderPublicKey = accountInteraction?.publicKey!;

      await exampleContract.methods.setVariableExternal({ someParam: '1337' }).sendExternal({
        publicKey: senderPublicKey,
      });
    };

    onUnmounted(() => {
      if (subscription.value) {
        subscription.value.unsubscribe();
      }
    });

    return {
      eventData,
      toggleSubscription,
      triggerEvent,
      buttonLabel,
    };
  },
});
</script>
