<template>
  <div class="method">
    <h4>{{ methodData.name }}</h4>
    <code class="code-block">▸ {{ methodData.name }}(): <code v-html="methodData.type"></code></code>
    <p v-if="methodData.comment">{{ methodData.comment }}</p>
    <div class="method-parameters" v-if="methodData.parameters && methodData.parameters.length > 0">
      <h6>Parameters</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="param in methodData.parameters" :key="param.name">
            <td>{{ param.name }}</td>
            <td v-html="param.type"></td>
          </tr>
        </tbody>
      </table>
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
export default {
  name: 'MethodComponent',
  props: {
    methodData: {
      type: Object,
      required: true,
    },
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
