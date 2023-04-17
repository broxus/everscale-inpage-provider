<script lang="ts">
  import { buildTableOfContent, buildPage } from './../scripts/build';
  import { ProjectReflection, ReflectionKind, DeclarationReflection } from 'typedoc';
  export default {
    name: 'Utils',
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
      const pr = new ProjectReflection('sanya');
  const dc = new DeclarationReflection('sanya2', ReflectionKind.Class, pr);
  dc.children = []

  pr.registerReflection(dc);
  console.log(pr.children);

      this.tableOfContent = await buildTableOfContent(project, 'Utils');
      this.pageContent = await buildPage(project, 'Utils', this.tableOfContent);

    },
  };
</script>

# Utils

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
