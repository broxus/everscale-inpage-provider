<template>
  <section class="interface-info" v-for="interfaceData in interfaces" :key="interfaceData.name">
    <h2 :id="interfaceData.name">{{ interfaceData.name }}</h2>
    <div v-if="interfaceData.properties && interfaceData.properties.length > 0">
      <h6 id="properties">Properties</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="property in interfaceData.properties" :key="property.name">
            <td>{{ property.name }}</td>
            <td>{{ property.type }}</td>
            <td v-if="property.comment">{{ property.comment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="interfaceData.methods && interfaceData.methods.length > 0">
      <h6 id="methods">Methods</h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="method in interfaceData.methods" :key="method.name">
            <td>{{ method.name }}</td>
            <td v-if="method.comment">{{ method.comment }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h6>Defined in</h6>
    <a :href="interfaceData.definedInUrl" target="_blank" rel="noopener">{{ interfaceData.definedIn }}</a>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { findInterfaces, InterfaceInfo } from './../../ast-utils';
import { ProjectReflection } from 'typedoc';

export default defineComponent({
  name: 'InterfaceComponent',
  async setup() {
    const interfacesLoaded = ref(false);

    const ast = (await import(/* @vite-ignore */ './../../../build/typedoc-ast.json').then(
      module => module.default,
    )) as ProjectReflection;

    const interfaces: InterfaceInfo[] = await findInterfaces(ast);

    interfacesLoaded.value = true;

    return { interfaces, interfacesLoaded };
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
