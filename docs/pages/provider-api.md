<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  export default {
    name: 'Provider Api',
    data() {
      return {
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
      const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
        module => module.default,
      )) as ProjectReflection;

      this.tableOfContent = await buildTableOfContent(project, 'Provider Api');
      this.pageContent = await buildPage(project, 'Provider Api', this.tableOfContent);

    },
  };
</script>

# Provider API

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
