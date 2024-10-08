<template>
  <div class="demo">
    <div class="contract-state" v-if="parsedSimpleState">Simple State: {{ parsedSimpleState.simpleState }}</div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendExternalMessage">Send Message</button>
    <AccordionComponent
      v-if="transactionData"
      :transactionData="transactionData"
      buttonText="Show transaction"
    ></AccordionComponent>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue';
import { Address } from 'everscale-inpage-provider';

import { testContract, errorExtractor } from './../../helpers';

import AccordionComponent from './../shared/Accordion.vue';
import { useProvider } from './../../../src/provider/useProvider';

export default defineComponent({
  name: 'SendExternalMessage',
  components: {
    AccordionComponent,
  },
  async setup() {
    const transactionData = ref();
    const someParam = ref(42);
    const simpleState = ref('');

    const { provider } = useProvider();

    const testAddress: Address = inject('testAddress')!;
    const exampleContract = new provider.Contract(testContract.ABI, testAddress);

    onMounted(async () => {
      const state = await exampleContract.methods.simpleState().call();
      simpleState.value = JSON.stringify(state, null, 2);
    });
    return { transactionData, simpleState, someParam, testAddress };
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
    async sendExternalMessage() {
      const { provider } = useProvider();

      await provider.ensureInitialized();
      await provider.requestPermissions({
        permissions: ['basic', 'accountInteraction'],
      });
      const providerState = await provider.getProviderState();
      const senderPublicKey = providerState?.permissions.accountInteraction?.publicKey;

      if (!senderPublicKey) {
        throw new Error('No public key');
      }

      const exampleContract = new provider.Contract(testContract.ABI, this.testAddress);

      const tx = await errorExtractor(
        exampleContract.methods.setVariableExternal({ someParam: this.someParam }).sendExternal({
          publicKey: senderPublicKey!,
        }),
      );
      this.transactionData = JSON.stringify(tx, null, 2);
      const state = await exampleContract.methods.simpleState().call();
      this.simpleState = JSON.stringify(state, null, 2);
    },
  },
});
</script>

<style scoped>
.contract-state {
  margin-bottom: 1rem;
}
</style>
