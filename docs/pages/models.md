<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Models', await buildTableOfContent(project, 'Models')))

  export default {
    name: 'Models',
    data() {
      return {
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
      this.tableOfContent = await buildTableOfContent(project, 'Models');
      this.pageContent = await buildPage(project, 'Models', this.tableOfContent);

    },
  };
</script>

# Models

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
