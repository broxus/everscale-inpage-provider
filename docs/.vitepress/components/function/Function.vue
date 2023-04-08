<template>
  <section class="function" v-for="functionData in functions" :key="functionData.name">
    <h4>{{ functionData.name }}</h4>
    <code class="code-block">▸ {{ functionData.name }}(): <code v-html="functionData.type"></code></code>
    <p v-if="functionData.comment">{{ functionData.comment }}</p>
    <div class="function-parameters" v-if="functionData.parameters && functionData.parameters.length > 0">
      <h6>Parameters</h6>
      <PropertyTable :properties="functionData.parameters" />
    </div>
    <div class="function-returns">
      <h6>Returns</h6>
      <code v-html="functionData.returnType"></code>
    </div>

    <DefinedInLink :definedIn="functionData.definedIn" :definedInUrl="functionData.definedInUrl" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Function } from './../../ast-utils';
import PropertyTable from './../shared/PropertyTable.vue';
import DefinedInLink from './../shared/DefinedInLink.vue';

export default defineComponent({
  name: 'FunctionComponent',
  props: {
    functions: {
      type: Array as () => Function[],
      required: true,
    },
  },
  methods: {
    hasAnyParameterComment(parameters) {
      return parameters.some(param => param.comment);
    },
  },
  components: {
    PropertyTable,
    DefinedInLink,
  },
});
</script>

<style scoped>
.function {
  margin-bottom: 1.5rem;
}

.code-block {
  margin: 0.7rem 0;
}
</style>
