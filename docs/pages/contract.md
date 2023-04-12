<script lang="ts">
  import { findClasses, findTypeAliases, findInterfaces, findFunctions, ClassInfo, ReflectionKind, } from './../.vitepress/ast-utils';
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Contract', await buildTableOfContent(project, 'Contract')))

  export default {
    name: 'Contract',
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
      this.classes = await findClasses(project, 'Contract');
      this.classesNames = this.classes.map((c: ClassInfo) => c.name);
      this.interfaces = await findInterfaces(project, 'Contract');

      this.interfacesNames = this.interfaces.map((c: ClassInfo) => c.name);
      this.typeAliases = await findTypeAliases(project, 'Contract');
      this.typeAliasesNames = this.typeAliases.map((c: ClassInfo) => c.name);
      this.functions = await findFunctions(project, 'Contract');
      this.functionsNames = this.functions.map((c: ClassInfo) => c.name);
      this.tableOfContent = await buildTableOfContent(project, 'Contract');
      this.pageContent = await buildPage(project, 'Contract', this.tableOfContent);

    },
  };
</script>

# Contract

## Table of Contents

<!-- <TableOfContentComponent :tocData="tableOfContent" /> -->

<PageContentComponent :page="pageContent" />
