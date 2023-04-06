<template>
  <div class="class-constructor">
    <h4 v-if="constructorData.title">{{ constructorData.title }}</h4>
    <p v-if="constructorData.signatureDescription">{{ constructorData.signatureDescription.comment }}</p>
    <div class="constuctor-type-params" v-if="constructorData.signatureDescription.typeParameter.length > 0">
      <h5>Type parameters</h5>
      <table>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="param in constructorData.signatureDescription.typeParameter" :key="param.name">
            <td>{{ param.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="constuctor-params" v-if="constructorData.parameters.length > 0">
      <h5>Parameters</h5>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(param, paramName) in constructorData.formattedParameters" :key="paramName">
            <td>{{ paramName }}</td>
            <td v-html="param"></td>
            <td>{{ constructorData.formattedParameterComments[paramName] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h5>Defined in</h5>
    <p v-if="constructorData.definedIn">
      <a :href="constructorData.definedInUrl" target="_blank" rel="noopener">{{ constructorData.definedIn }}</a>
    </p>
  </div>
</template>

<script>
export default {
  name: 'ConstructorComponent',
  props: {
    constructorData: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.class-constructor {
  /* ваш CSS здесь */
}
</style>
