<template>
  <div class="component-switcher">
    <component :is="getComponentType(contentData)" :item="contentData"></component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ComponentKind, ClassInfo, InterfaceInfo, FunctionInfo, TypeAliasInfo } from './../../ast-utils';

import ClassComponent from './../class/Class.vue';
import FunctionComponent from './../function/Function.vue';
import InterfaceComponent from './../interface/Interface.vue';
import TypeAliasComponent from './../type-alias/TypeAlias.vue';
import { TableOfContent, ContentItem } from './../../../scripts/build';

export default defineComponent({
  name: 'ComponentSwitcher',
  components: {
    ClassComponent,
    FunctionComponent,
    InterfaceComponent,
    TypeAliasComponent,
  },
  props: {
    contentData: {
      type: Object as () => ContentItem,
      required: true,
    },
  },
  methods: {
    getComponentType(item: ContentItem) {
      switch (item.kind) {
        case ComponentKind.Class:
          return 'ClassComponent';
        case ComponentKind.Function:
          return 'FunctionComponent';
        case ComponentKind.Interface:
          return 'InterfaceComponent';
        case ComponentKind.TypeAlias:
          return 'TypeAliasComponent';
        default:
          return 'div';
      }
    },
  },
});
</script>

<style scoped>
/* Здесь добавьте свои стили */
</style>
