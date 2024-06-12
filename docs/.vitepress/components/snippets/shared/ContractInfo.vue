<template>
  <div>
    <div class="contract-state" v-if="parsedState">Simple State: {{ parsedState.simpleState }}</div>
    <div>
      <label for="someParam">SomeParam:</label>
      <input id="someParam" type="number" v-model="someParam" />
    </div>
    <button @click="sendMessage">Send Message</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ContractInfo',
  props: {
    contractState: {
      type: String,
      default: '',
    },
    onSendMessage: {
      type: Function,
      default: () => {},
    },
  },
  setup(props) {
    const someParam = ref(0);

    function sendMessage() {
      props.onSendMessage(someParam.value);
    }

    return { someParam, sendMessage };
  },
  computed: {
    parsedState() {
      try {
        return JSON.parse(this.contractState);
      } catch (error) {
        return null;
      }
    },
  },
});
</script>
