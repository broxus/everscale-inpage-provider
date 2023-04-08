<template>
  <section class="interface-info" v-for="interfaceData in interfaces" :key="interfaceData.name">
    <h2 :id="interfaceData.name">{{ interfaceData.name }}</h2>
    <div v-if="interfaceData.properties && interfaceData.properties.length > 0">
      <h6 id="properties">Properties</h6>
      <PropertyTable :properties="interfaceData.properties" />
    </div>
    <div v-if="interfaceData.methods && interfaceData.methods.length > 0">
      <h6 id="methods">Methods</h6>
      <PropertyTable :properties="interfaceData.methods" />
    </div>
    <h6>Defined in</h6>
    <a :href="interfaceData.definedInUrl" target="_blank" rel="noopener">{{ interfaceData.definedIn }}</a>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { InterfaceInfo } from './../../ast-utils';
import PropertyTable from './../shared/PropertyTable.vue';

export default defineComponent({
  name: 'InterfaceComponent',
  props: {
    interfaces: {
      type: Array as () => InterfaceInfo[],
      required: true,
    },
  },
  components: {
    PropertyTable,
  },
  methods: {
    hasComments() {
      return this.interfaces.some(interfaceData => {
        const hasPropertyComments =
          interfaceData.properties && interfaceData.properties.some(property => property.comment);
        const hasMethodComments = interfaceData.methods && interfaceData.methods.some(method => method.comment);
        return hasPropertyComments || hasMethodComments;
      });
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
