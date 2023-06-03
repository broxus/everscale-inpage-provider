<template>
  <div v-if="!apiReference.content">Loading...</div>
  <div v-else v-html="apiReference.content"></div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getApiReference } from './../../api';

export default defineComponent({
  props: {
    projectName: String,
    pageName: String,
  },
  setup(props) {
    const apiReference = ref({} as any);
    const { projectName, pageName } = props;

    onMounted(async () => {
      const response = await getApiReference(projectName!, pageName!);
      apiReference.value = await response;
    });

    return { apiReference };
  },
});
</script>
