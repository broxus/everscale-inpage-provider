<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  export default {
    name: 'Utils',
    data() {
      return {
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
  
      this.tableOfContent = await buildTableOfContent(project, 'Utils');
      this.pageContent = await buildPage(project, 'Utils', this.tableOfContent);

    },
  };
</script>

# Utils

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
