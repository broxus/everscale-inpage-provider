<script setup lang="ts">
import { onMounted, computed, ref, Ref, onUpdated } from 'vue';
import { useRoute, useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import Outline from './../components/shared/outline/Outline.vue';
import WalletControl from './../components/WalletControl.vue';
import { getApiReference } from '../../api';

const { Layout } = DefaultTheme;
const route = useRoute();
const { frontmatter } = useData();
const dynamicContent = ref('');

const projectName = 'everscale-inpage-provider';
let pageName = computed(() => {
  let name = route.path.split('/').pop() ?? '';
  return name.replace('.html', '');
});

let apiReference: Ref<{ content: string }> = ref({ content: '' });

const isApiReferencePage = computed(() => {
  return frontmatter.value.apiReference ?? false;
});

onMounted(async () => {
  console.log(route.path, isApiReferencePage.value);
  if (!isApiReferencePage) return;

  const response = await getApiReference(projectName, pageName.value);
  apiReference.value = await response;
  dynamicContent.value = apiReference.value.content;
});

onUpdated(async () => {
  console.log(route.path, isApiReferencePage.value);
  if (!isApiReferencePage) return;

  const response = await getApiReference(projectName, pageName.value);
  apiReference.value = await response;
  dynamicContent.value = apiReference.value.content;
});
</script>

<template>
  <Layout>
    <template #nav-bar-content-after
      ><Suspense><WalletControl /></Suspense
    ></template>
    <template #aside-outline-before v-if="isApiReferencePage">
      <Outline :content="dynamicContent" />
    </template>
  </Layout>
</template>
