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
import { findClassesWithMembers, ClassInfo, findTypeAliases, TypeAliasInfo } from './../../ast-utils';
import { ProjectReflection, Reflection, ContainerReflection, ReflectionKind } from 'typedoc';

export default defineComponent({
  name: 'TypeAliasComponent',
  props: {
    typeAliasData: {
      type: Object,
      required: true,
    },
  },
  async setup() {
    const ast = (await import(/* @vite-ignore */ './../../../build/typedoc-ast.json').then(
      module => module.default,
    )) as ProjectReflection;
    const typeAliases: TypeAliasInfo[] = await findTypeAliases(ast);

    return { typeAliases };
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
