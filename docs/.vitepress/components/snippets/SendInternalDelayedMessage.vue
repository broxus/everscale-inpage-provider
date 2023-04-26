<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedContractState">
      <div>Simple State: {{ parsedContractState.simpleState }}</div>
    </div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendInternalDelayedMessage">Send Message</button>
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
import { defineComponent, ref } from 'vue';
import { Address, ProviderRpcClient } from 'everscale-inpage-provider';

import { testContract, toNano } from './../../helpers';

import AccordionComponent from './../shared/Accordion.vue';

export default defineComponent({
  name: 'SendInternalDelayedMessage',
  components: {
    AccordionComponent,
  },
  async setup() {
    const transactionExecuted = ref(false);
    const messageInfo = ref();
    const transaction = ref();
    const someParam = ref(1337);

    const provider = new ProviderRpcClient();

    const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));
    const state = await exampleContract.methods.simpleState().call();

    const contractState = ref(JSON.stringify(state, null, 2));

    return { transactionExecuted, messageInfo, contractState, someParam, transaction };
  },
  computed: {
    parsedContractState() {
      try {
        return JSON.parse(this.contractState);
      } catch (error) {
        return null;
      }
    },
  },
  methods: {
    async sendInternalDelayedMessage() {
      this.messageInfo = null;
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
      const exampleContract = new provider.Contract(testContract.ABI, new Address(testContract.address));

      const payload = {
        abi: JSON.stringify(testContract.ABI),
        method: 'setVariable',
        params: {
          someParam: this.someParam,
        },
      };
      const { transaction, messageHash, expireAt } = await provider.sendMessageDelayed({
        sender: senderAddress,
        recipient: new Address(testContract.address),
        amount: toNano(1),
        bounce: true,
        payload: payload,
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
          this.contractState = JSON.stringify(state, null, 2);
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
