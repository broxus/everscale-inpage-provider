<template>
  <div class="method">
    <h4>{{ methodData.name }}</h4>
    <code class="code-block">▸ {{ methodData.name }}(): <code v-html="methodData.type"></code></code>
    <p v-if="methodData.comment">{{ methodData.comment }}</p>
    <div class="method-parameters" v-if="methodData.parameters && methodData.parameters.length > 0">
      <h6>Parameters</h6>
      <PropertyTable :properties="methodData.parameters" />
    </div>
    <div class="method-returns">
      <h6>Returns</h6>
      <code v-html="methodData.returnType"></code>
    </div>
    <h6>Defined in</h6>
    <p>
      <a :href="methodData.definedInUrl" target="_blank" rel="noopener">{{ methodData.definedIn }}</a>
    </p>
  </div>
</template>

<script>
import PropertyTable from './../../shared/PropertyTable.vue';

export default {
  name: 'MethodComponent',
  props: {
    methodData: {
      type: Object,
      required: true,
    },
  },
  components: {
    PropertyTable,
  },
};
</script>

<style scoped>
.method {
  margin-bottom: 1.5rem;
}

.code-block {
  margin: 0.7rem 0;
}
</style>
