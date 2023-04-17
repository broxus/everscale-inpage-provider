<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';



  export default {
    name: 'Contract',
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

      this.tableOfContent = await buildTableOfContent(project, 'Contract');
      this.pageContent = await buildPage(project, 'Contract', this.tableOfContent);

    },
  };
</script>

# Contract

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
