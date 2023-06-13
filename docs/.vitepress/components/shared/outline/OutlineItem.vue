<script setup lang="ts">
import { nextTick } from 'vue';
import { type MenuItem } from 'vitepress/dist/client/theme-default/composables/outline';
import { useAside } from 'vitepress/dist/client/theme-default/composables/aside';

import { isAnchorActive } from './outline';

defineProps<{
  headers: MenuItem[];
  root?: boolean;
}>();

const { isAsideEnabled } = useAside();

const emit = defineEmits(['update-marker']);

async function onClick({ target: el }: Event) {
  const id = '#' + (el as HTMLAnchorElement).href!.split('#')[1];
  const heading = document.querySelector<HTMLAnchorElement>(decodeURIComponent(id));
  console.log(heading);
  heading?.focus();
  await nextTick();
  emit('update-marker');
}
</script>

<template>
  <ul :class="root ? 'root' : 'nested'">
    <li v-for="{ children, link, title } in headers">
      <a class="outline-link" :href="link" @click="onClick" :title="title">{{ title }}</a>
      <template v-if="children?.length">
        <OutlineItem :headers="children" />
      </template>
    </li>
  </ul>
</template>

<style scoped>
.root {
  position: relative;
  z-index: 1;
}

.nested {
  padding-left: 13px;
}

.outline-link {
  display: block;
  line-height: 28px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
  font-weight: 500;
}

.outline-link:hover,
.outline-link.active {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.outline-link.nested {
  padding-left: 13px;
}
</style>
