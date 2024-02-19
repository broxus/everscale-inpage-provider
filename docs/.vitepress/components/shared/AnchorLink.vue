<template>
  <div>
    <a :href="`#${idName}`" rel="noopener" style="font-size: 1em; text-decoration: none">{{ idName }}</a>
  </div>
</template>

<script>
export default {
  name: 'AnchorLink',
  props: {
    idName: {
      type: String,
      required: true,
    },
  },
};
</script>
