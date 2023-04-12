<template>
  <section class="class-component">
    <h2 :id="item.name">{{ item.name }}</h2>

    <section v-if="item.properties && item.properties.length > 0" class="properties-section">
      <h3 id="properties">Properties</h3>
      <PropertyComponent v-for="prop in item.properties" :key="prop.name" :propertyData="prop" />
    </section>

    <section v-if="item.constructors" class="constructor-section">
      <h3 id="constructors">Constructors</h3>
      <ConstructorComponent
        v-for="constructor in item.constructors"
        :key="constructor.title"
        :constructorData="constructor"
      />
    </section>

    <section v-if="item.accessors?.length && item.accessors?.length > 0" class="accessors-section">
      <h3 id="accessors">Accessors</h3>
      <div class="accessors">
        <AccessorComponent v-for="accessor in item.accessors" :key="accessor.name" :accessorData="accessor" />
      </div>
    </section>

    <section v-if="item.methods" class="methods-section">
      <h3 id="methods">Methods</h3>
      <MethodComponent v-for="method in item.methods" :key="method.name" :methodData="method" />
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ClassInfo } from './../../ast-utils';
import ConstructorComponent from './components/Constructor.vue';
import AccessorComponent from './components/Accessor.vue';
import MethodComponent from './components/Method.vue';
import PropertyComponent from './components/Property.vue';

export default defineComponent({
  name: 'classComponent',
  props: {
    item: {
      type: Object as () => ClassInfo,
      required: true,
    },
  },
  components: {
    ConstructorComponent,
    AccessorComponent,
    MethodComponent,
    PropertyComponent,
  },
});
</script>

<style scoped>
/* .class-component {
  font-family: 'Roboto', sans-serif;
} */

.class-header {
  font-weight: bold;
  font-size: 1.5em;
  margin-bottom: 1em;
}

.class-content > section {
  margin-bottom: 1.5em;
}

h2 {
  font-size: 1.2em;
  margin-bottom: 0.5em;
}

h3 {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
</style>
