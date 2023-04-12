<template>
  <div class="property">
    <h4 :id="propertyData.name">{{ propertyData.name }}</h4>
    <code class="code-block">
      ▸ {{ propertyData.isOptional ? 'Optional' : '' }} {{ propertyData.name }}:
      <code v-html="propertyData.type"></code>
    </code>
    <p v-if="propertyData.comment">{{ propertyData.comment }}</p>
    <div v-if="propertyData.inheritedFrom">
      <h6>Inherited from</h6>
      <p v-html="propertyData.inheritedFrom"></p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyComponent',
  props: {
    propertyData: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.property {
  margin-bottom: 1.5rem;
}

.code-block {
  margin: 0.7rem 0;
}
</style>
