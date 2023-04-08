<template>
  <section class="type-alias" v-for="typeAliasData in typeAliases" :key="typeAliasData.name">
    <h2 :id="typeAliasData.name">{{ typeAliasData.name }}</h2>
    <div v-if="typeAliasData.typeParameters && typeAliasData.typeParameters.length > 0">
      <h6 id="type-parameters">Type parameters</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th v-if="typeAliasData.typeParameters && typeAliasData.typeParameters.length > 0">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="param in typeAliasData.typeParameters" :key="param.name">
            <td>{{ param.name }}</td>
            <td v-html="param.type"></td>
            <td v-if="param.comment">{{ param.comment }}</td>
            <td v-else-if="typeAliasData.typeParameters && typeAliasData.typeParameters.length > 0">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="typeAliasData.typeDeclaration">
      <h6 id="type-declaration">Type declaration</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in typeAliasData.typeDeclaration" :key="property.name">
            <td>{{ property.name }}</td>
            <td v-html="property.type"></td>
            <td v-if="property.comment">{{ property.comment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h6>Defined in</h6>
    <a :href="typeAliasData.definedInUrl" target="_blank" rel="noopener">{{ typeAliasData.definedIn }}</a>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TypeAliasInfo } from './../../ast-utils';

export default defineComponent({
  name: 'TypeAliasComponent',
  props: {
    typeAliases: {
      type: Array as () => TypeAliasInfo[],
      required: true,
    },
  },
});
</script>

<style scoped>
.type-alias {
  border-bottom: 1px solid rgba(82, 82, 89, 0.32);
  padding-top: 0.75rem;
}
.type-alias .name {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.type-alias:last-child {
  border-bottom: none;
}
.code-block {
  margin: 0.7rem 0;
}
</style>
