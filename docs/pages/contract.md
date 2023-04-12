<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  export default {
    name: 'Contract',
    data() {
      return {
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
      this.tableOfContent = await buildTableOfContent(project, 'Contract');
      this.pageContent = await buildPage(project, 'Contract', this.tableOfContent);

    },
  };
</script>

# Contract

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
