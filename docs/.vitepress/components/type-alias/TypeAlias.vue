<template>
  <section class="type-alias">
    <h2 :id="item.name">{{ item.name }}</h2>
    <div v-if="item.typeParameters && item.typeParameters.length > 0">
      <h6 id="type-parameters">Type parameters</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th v-if="item.typeParameters && item.typeParameters.length > 0">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="param in item.typeParameters" :key="param.name">
            <td>{{ param.name }}</td>
            <td v-html="param.type"></td>
            <td v-if="param.comment">{{ param.comment }}</td>
            <td v-else-if="item.typeParameters && item.typeParameters.length > 0">&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="item.typeDeclaration">
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
          <tr v-for="property in item.typeDeclaration" :key="property.name">
            <td>{{ property.name }}</td>
            <td v-html="property.type"></td>
            <td v-if="property.comment">{{ property.comment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <DefinedInLink :definedIn="item.definedIn" :definedInUrl="item.definedInUrl" />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TypeAliasInfo } from './../../ast-utils';
import DefinedInLink from '../shared/DefinedInLink.vue';

export default defineComponent({
  name: 'TypeAliasComponent',
  props: {
    item: {
      type: Object as () => TypeAliasInfo,
      required: true,
    },
  },
  components: {
    DefinedInLink,
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
