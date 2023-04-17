<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  export default {
    name: 'Stream',
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

      this.tableOfContent = await buildTableOfContent(project, 'Stream');
      this.pageContent = await buildPage(project, 'Stream', this.tableOfContent);

    },
  };
</script>

# Stream

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
