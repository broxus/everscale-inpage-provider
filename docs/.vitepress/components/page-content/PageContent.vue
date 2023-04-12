<template>
  <section v-for="(section, index) in page.pageContentMap" :key="index" class="toc-element">
    <h2 :id="index.toString()">{{ index }}</h2>

    <section v-for="(element, index) in section" :key="index" class="toc-element">
      <ComponentSwitcher :contentData="element[0]" />
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TableOfContent, Page } from './../../../scripts/build';
import ComponentSwitcher from '../component-switcher/ComponentSwitcher.vue';

export default defineComponent({
  // ...
  name: 'PageContent',
  components: {
    ComponentSwitcher,
  },
  props: {
    page: {
      type: Object as () => Page,
      required: true,
    },
  },
});
</script>
