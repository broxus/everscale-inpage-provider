<script lang="ts">
  import { findClasses, findTypeAliases, findInterfaces, findFunctions, ClassInfo, ReflectionKind, } from './../.vitepress/ast-utils';
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Provider Api', await buildTableOfContent(project, 'Provider Api')))

  export default {
    name: 'Provider Api',
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
      this.classes = await findClasses(project, 'Provider Api');
      this.classesNames = this.classes.map((c: ClassInfo) => c.name);
      this.interfaces = await findInterfaces(project, 'Provider Api');

      this.interfacesNames = this.interfaces.map((c: ClassInfo) => c.name);
      this.typeAliases = await findTypeAliases(project, 'Provider Api');
      this.typeAliasesNames = this.typeAliases.map((c: ClassInfo) => c.name);
      this.functions = await findFunctions(project, 'Provider Api');
      this.functionsNames = this.functions.map((c: ClassInfo) => c.name);
      this.tableOfContent = await buildTableOfContent(project, 'Provider Api');
      this.pageContent = await buildPage(project, 'Provider Api', this.tableOfContent);

    },
  };
</script>

# Provider API

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
