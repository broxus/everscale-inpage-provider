<template>
  <section class="function">
    <h3 :id="item.name">{{ item.name }}</h3>
    <code class="code-block">▸ {{ item.name }}(): <code v-html="item.type"></code></code>
    <p v-if="item.comment">{{ item.comment }}</p>
    <div class="function-parameters" v-if="item.parameters && item.parameters.length > 0">
      <h6>Parameters</h6>
      <PropertyTable :properties="item.parameters" />
    </div>
    <div class="function-returns">
      <h6>Returns</h6>
      <code v-html="item.returnType"></code>
    </div>

    <DefinedInLink :definedIn="item.definedIn" :definedInUrl="item.definedInUrl" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { FunctionInfo } from './../../ast-utils';
import PropertyTable from './../shared/PropertyTable.vue';
import DefinedInLink from './../shared/DefinedInLink.vue';

export default defineComponent({
  name: 'FunctionComponent',
  props: {
    item: {
      type: Object as () => FunctionInfo,
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
