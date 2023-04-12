<template>
  <div class="table-of-content">
    <div v-for="section in tocData.sections" :key="section.id" class="toc-section">
      <h2 :id="section.title">{{ section.title }}</h2>
      <ul>
        <li v-for="element in section.elements" :key="element.id" class="toc-element">
          <strong :id="element.title">{{ element.title }}</strong>
          <ul>
            <li v-for="category in element.categories" :key="category.name" class="toc-category">
              <span :id="category.name">{{ category.name }}</span>
              <ul>
                <li
                  :id="subCategory.name"
                  v-for="subCategory in category.subCategories"
                  :key="subCategory.name"
                  class="toc-subCategory"
                >
                  {{ subCategory.name }}
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TableOfContent } from './../../../scripts/build';

export default defineComponent({
  name: 'TableOfContent',
  props: {
    tocData: {
      type: Object as () => TableOfContent,
      required: true,
    },
  },
});
</script>

<style scoped>
/* Здесь добавьте свои стили */
</style>
