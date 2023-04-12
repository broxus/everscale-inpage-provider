<template>
  <section class="interface-component">
    <h3 :id="item.name">{{ item.name }}</h3>
    <div v-if="item.properties && item.properties.length > 0">
      <h6 id="properties">Properties</h6>
      <PropertyTable :properties="item.properties" />
    </div>
    <div v-if="item.methods && item.methods.length > 0">
      <h6 id="methods">Methods</h6>
      <PropertyTable :properties="item.methods" />
    </div>
    <DefinedInLink :definedIn="item.definedIn" :definedInUrl="item.definedInUrl" />
  </section>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from 'vue';
import { InterfaceInfo } from './../../ast-utils';
import PropertyTable from './../shared/PropertyTable.vue';
import DefinedInLink from './../shared/DefinedInLink.vue';

export default defineComponent({
  name: 'InterfaceComponent',
  props: {
    item: {
      type: Object as () => InterfaceInfo,
      required: true,
    },
  },
  components: {
    PropertyTable,
    DefinedInLink,
  },
  methods: {
    hasComments() {
      return (
        (this.item.properties && this.item.properties.some(prop => prop.comment)) ||
        (this.item.methods && this.item.methods.some(method => method.comment))
      );
    },
  },
});
</script>

<style scoped>
.interface-info {
  border-bottom: 1px solid rgba(82, 82, 89, 0.32);
  padding-top: 0.75rem;
}
.interface-info:last-child {
  border-bottom: none;
}
</style>
