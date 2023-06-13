<template>
  <div v-if="!apiReference.content">Loading...</div>
  <div class="page-container" v-else>
    <div class="page-content" v-html="apiReference.content"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick, provide } from 'vue';
import { getApiReference } from './../../api';
// import Outline from './shared/outline/Outline.vue';

export default defineComponent({
  name: 'Page',
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

      await nextTick();

      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return { apiReference };
  },
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: row;

  /* justify-content: space-around; */
}

.page-outline {
  position: fixed;
  top: 96px;
  right: calc(100vw - 85.3%);
  height: 100vh;
  width: 200px;
  overflow-y: auto;
}
@media screen and (max-width: 1279px) {
  .page-outline {
    display: none;
  }
}
</style>
