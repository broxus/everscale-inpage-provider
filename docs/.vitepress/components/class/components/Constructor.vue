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
            <th v-if="hasComments()">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(param, paramName) in constructorData.formattedParameters" :key="paramName">
            <td>{{ paramName }}</td>
            <td v-html="param"></td>
            <td v-if="constructorData.formattedParameterComments[paramName]">
              {{ constructorData.formattedParameterComments[paramName] }}
            </td>
            <td v-else-if="hasComments()">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
    <DefinedInLink :definedIn="constructorData.definedIn" :definedInUrl="constructorData.definedInUrl" />
  </div>
</template>

<script>
import DefinedInLink from './../../shared/DefinedInLink.vue';

export default {
  name: 'ConstructorComponent',
  props: {
    constructorData: {
      type: Object,
      required: true,
    },
  },
  methods: {
    hasComments() {
      return Object.keys(this.constructorData.formattedParameterComments).length > 0;
    },
  },
  components: {
    DefinedInLink,
  },
};
</script>

<style scoped>
.class-constructor {
  /* ваш CSS здесь */
}
</style>
