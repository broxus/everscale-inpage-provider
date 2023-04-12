<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  export default {
    name: 'Stream',
    data() {
      return {
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
      this.tableOfContent = await buildTableOfContent(project, 'Stream');
      this.pageContent = await buildPage(project, 'Stream', this.tableOfContent);

    },
  };
</script>

# Stream

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
