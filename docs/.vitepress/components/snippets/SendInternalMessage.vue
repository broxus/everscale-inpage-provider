<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedContractState">Simple State: {{ parsedContractState.simpleState }}</div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendInternalMessage">Send Message</button>
    <AccordionComponent v-if="transaction" buttonText="Show transaction" :transactionData="transaction" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { Address } from 'everscale-inpage-provider';

import { testContract, errorExtractor, toNano } from './../../helpers';

import AccordionComponent from './../shared/Accordion.vue';
import { useProvider } from './../../../src/provider/useProvider';

export default defineComponent({
  name: 'SendInternalMessage',
  components: {
    AccordionComponent,
  },
  async setup() {
    const transaction = ref();
    const someParam = ref(1337);

    const contractState = ref('');

    const { provider } = useProvider();

    const testAddress: Address = inject('testAddress')!;
    const exampleContract = new provider.Contract(testContract.ABI, testAddress);

    onMounted(async () => {
      const state = await exampleContract.methods.simpleState().call();
      contractState.value = JSON.stringify(state, null, 2);
    });
    return { transaction, contractState, someParam, testAddress };
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
    async sendInternalMessage() {
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
      const exampleContract = new provider.Contract(testContract.ABI, this.testAddress);

      const payload = {
        abi: JSON.stringify(testContract.ABI),
        method: 'setVariable',
        params: {
          someParam: this.someParam,
        },
      };
      const tx = await errorExtractor(
        provider.sendMessage({
          sender: senderAddress,
          recipient: this.testAddress,
          amount: toNano(1),
          bounce: true,
          payload: payload,
        }),
      );

      const state = await exampleContract.methods.simpleState().call();
      this.contractState = JSON.stringify(state, null, 2);
      this.transaction = JSON.stringify(tx.transaction, null, 2);
    },
  },
});
</script>

<style scoped>
.contract-state {
  margin-bottom: 1rem;
}
</style>
