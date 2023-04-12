<template>
  <ul class="table-of-content">
    <li v-for="(section, sectionIndex) in tocData.sections" :key="section.id" class="toc-section">
      <div class="item-container" @click="toggleExpanded(sectionIndex)">
        <AnchorLink :idName="section.title" class="section-title"></AnchorLink>
        <Arrow
          v-if="hasCategories(section)"
          :class="['arrow', isExpanded(sectionIndex) ? 'expanded' : 'collapsed']"
        ></Arrow>
      </div>
      <ul v-if="isExpanded(sectionIndex)">
        <li v-for="(element, elementIndex) in section.elements" :key="element.id" class="toc-element">
          <div class="item-container" @click="toggleExpanded(`${sectionIndex}-${elementIndex}`)">
            <AnchorLink :idName="element.title" class="element-title"></AnchorLink>
            <Arrow
              v-if="hasCategories(element)"
              :class="['arrow', isExpanded(`${sectionIndex}-${elementIndex}`) ? 'expanded' : 'collapsed']"
            ></Arrow>
          </div>
          <ul v-if="isExpanded(`${sectionIndex}-${elementIndex}`)">
            <li v-for="(category, categoryIndex) in element.categories" :key="category.name" class="toc-category">
              <div class="item-container" @click="toggleExpanded(`${sectionIndex}-${elementIndex}-${categoryIndex}`)">
                <AnchorLink :idName="category.name" class="category-title"></AnchorLink>
                <Arrow
                  v-if="hasCategories(category)"
                  :class="[
                    'arrow',
                    isExpanded(`${sectionIndex}-${elementIndex}-${categoryIndex}`) ? 'expanded' : 'collapsed',
                  ]"
                ></Arrow>
              </div>
              <ul v-if="isExpanded(`${sectionIndex}-${elementIndex}-${categoryIndex}`)">
                <li
                  :id="subCategory.name"
                  v-for="subCategory in category.subCategories"
                  :key="subCategory.name"
                  class="toc-subCategory"
                >
                  <AnchorLink :idName="subCategory.name" class="subCategory-title"></AnchorLink>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { TableOfContent } from './../../../scripts/build';
import AnchorLink from './AnchorLink.vue';
import Arrow from './Arrow.vue';

export default defineComponent({
  name: 'TableOfContent',
  props: {
    tocData: {
      type: Object as () => TableOfContent,
      required: true,
    },
  },
  data() {
    return {
      expanded: {},
    };
  },
  methods: {
    toggleExpanded(index) {
      this.expanded[index] = !this.expanded[index];
    },
    isExpanded(index) {
      return this.expanded[index];
    },
    hasCategories(element) {
      return (
        (element.categories && element.categories.length > 0) ||
        (element.subCategories && element.subCategories.length > 0) ||
        (element.elements && element.elements.length > 0)
      );
    },
  },
  components: {
    AnchorLink,
    Arrow,
  },
  computed: {
    arrowColor() {
      // Определите цвет стрелки на основе текущей темы
      return this.theme.value === 'dark' ? 'white' : 'black';
    },
  },
});
</script>
<style scoped>
.item-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.arrow {
  margin-left: 5px;
  border: solid;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.3s;
}

:root.dark .arrow {
  border-color: var(--vp-c-text-1) !important;
}

.collapsed {
  transform: rotate(45deg);
}

.expanded {
  transform: rotate(135deg);
}
</style>
