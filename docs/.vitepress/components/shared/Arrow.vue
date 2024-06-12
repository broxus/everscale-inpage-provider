<!-- Arrow.vue -->
<template>
  <span
    class="arrow"
    :class="{
      expanded: isExpanded,
      collapsed: !isExpanded,
    }"
    :style="{ borderColor: arrowColor }"
  ></span>
</template>

<script>
export default {
  props: {
    isExpanded: {
      type: Boolean,
      default: false,
    },
    arrowColor: {
      type: String,
      default: 'black',
    },
  },
};
</script>

<style scoped>
.arrow {
  margin-left: 5px;
  border: solid;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.3s;
}

.expanded {
  transform: rotate(-135deg);
}

.collapsed {
  transform: rotate(45deg);
}
</style>
