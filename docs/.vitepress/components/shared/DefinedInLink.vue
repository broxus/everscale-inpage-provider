<template>
  <div>
    <span style="font-size: 1em"><b>Defined in: </b></span>
    <a :href="definedInUrl" target="_blank" rel="noopener" style="font-size: 1em; text-decoration: none">{{
      definedIn
    }}</a>
  </div>
</template>

<script>
export default {
  name: 'DefinedInLink',
  props: {
    definedIn: {
      type: String,
      required: true,
    },
    definedInUrl: {
      type: String,
      required: true,
    },
  },
};
</script>
