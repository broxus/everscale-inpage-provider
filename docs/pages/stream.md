<script lang="ts">
  import { findClasses, findTypeAliases, findInterfaces, findFunctions, ClassInfo, ReflectionKind, } from './../.vitepress/ast-utils';
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Stream', await buildTableOfContent(project, 'Stream')))

  export default {
    name: 'Stream',
    data() {
      return {
        classes: [],
        classesNames: [],
        interfaces: [],
        interfacesNames: [],
        typeAliases: [],
        typeAliasesNames: [],
        functions: [],
        functionsNames: [],
        tableOfContent: [],
        pageContent: {},
      };
    },
    async created() {
      this.classes = await findClasses(project, 'Stream');
      this.classesNames = this.classes.map((c: ClassInfo) => c.name);
      this.interfaces = await findInterfaces(project, 'Stream');

      this.interfacesNames = this.interfaces.map((c: ClassInfo) => c.name);
      this.typeAliases = await findTypeAliases(project, 'Stream');
      this.typeAliasesNames = this.typeAliases.map((c: ClassInfo) => c.name);
      this.functions = await findFunctions(project, 'Stream');
      this.functionsNames = this.functions.map((c: ClassInfo) => c.name);
      this.tableOfContent = await buildTableOfContent(project, 'Stream');
      this.pageContent = await buildPage(project, 'Stream', this.tableOfContent);

    },
  };
</script>

# Stream

## Table of Contents

<!-- <TableOfContentComponent :tocData="tableOfContent" /> -->

<PageContentComponent :page="pageContent" />
