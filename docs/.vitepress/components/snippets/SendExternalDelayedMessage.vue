<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedSimpleState">
      <div>Simple State: {{ parsedSimpleState.simpleState }}</div>
    </div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendExternalDelayedMessage">Send Message</button>
    <div class="message-info" v-if="messageInfo">
      <div>Message Hash: {{ messageInfo.messageHash }}</div>
      <div>Expiration Time: {{ messageInfo.expireAt }}</div>
      <AccordionComponent
        v-if="transactionExecuted"
        :transactionData="transaction"
        buttonText="Show transaction"
      ></AccordionComponent>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { Address } from 'everscale-inpage-provider';

import { testContract } from './../../helpers';

import AccordionComponent from './../shared/Accordion.vue';
import { useProvider } from './../../../src/provider/useProvider';

export default defineComponent({
  name: 'SendExternalDelayedMessage',
  components: {
    AccordionComponent,
  },
  async setup() {
    const transactionExecuted = ref(false);
    const transaction = ref();
    const messageInfo = ref();
    const someParam = ref(42);
    const simpleState = ref('');

    const { provider } = useProvider();
    const testAddress: Address = inject('testAddress')!;
    const exampleContract = new provider.Contract(testContract.ABI, testAddress);

    onMounted(async () => {
      const state = await exampleContract.methods.simpleState().call();
      simpleState.value = JSON.stringify(state, null, 2);
    });

    return { transactionExecuted, transaction, messageInfo, simpleState, someParam, testAddress };
  },
  computed: {
    parsedSimpleState() {
      try {
        return JSON.parse(this.simpleState);
      } catch (error) {
        return null;
      }
    },
  },
  methods: {
    async sendExternalDelayedMessage() {
      this.messageInfo = null;

      const { provider } = useProvider();

      await provider.ensureInitialized();
      await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
      const providerState = await provider.getProviderState();
      const senderPublicKey = providerState?.permissions.accountInteraction?.publicKey!;

      if (!senderPublicKey) {
        throw new Error('No public key');
      }

      const exampleContract = new provider.Contract(testContract.ABI, this.testAddress);

      const { transaction, messageHash, expireAt } = await exampleContract.methods
        .setVariableExternal({ someParam: this.someParam })
        .sendExternalDelayed({
          publicKey: senderPublicKey!,
        });

      this.messageInfo = {
        messageHash,
        expireAt,
      };

      transaction
        .then(async () => {
          this.transactionExecuted = true;
          this.transaction = await transaction;
          return exampleContract.methods.simpleState().call();
        })
        .then(state => {
          this.simpleState = JSON.stringify(state, null, 2);
        });
    },
  },
});
</script>

<style scoped>
.contract-state {
  margin-bottom: 1rem;
}

.message-info {
  margin-top: 1rem;
}

.message-info > div {
  margin-bottom: 0.5rem;
}
</style>
