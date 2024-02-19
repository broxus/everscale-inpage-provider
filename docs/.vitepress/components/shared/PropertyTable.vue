<template>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th v-if="hasTypes()">Type</th>
        <th v-if="hasComments()">Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="property in properties" :key="property.name">
        <td>{{ property.name }}</td>
        <td v-if="property.type" v-html="property.type"></td>
        <td v-if="property.comment">{{ property.comment }}</td>
        <td v-else-if="hasComments()">&nbsp;</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PropertyTable',
  props: {
    properties: {
      type: Array as () => any[],
      required: true,
    },
  },
  methods: {
    hasComments() {
      return this.properties.some(property => property.comment);
    },
    hasTypes() {
      return this.properties.some(property => property.type);
    },
  },
});
</script>
