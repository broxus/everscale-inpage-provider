<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  export default {
    name: 'Models',
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

      this.tableOfContent = await buildTableOfContent(project, 'Models');
      this.pageContent = await buildPage(project, 'Models', this.tableOfContent);

    },
  };
</script>

# Models

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
