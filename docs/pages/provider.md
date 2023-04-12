<script lang="ts">
  import { findClasses, findTypeAliases, findInterfaces, findFunctions, ClassInfo, ReflectionKind, } from './../.vitepress/ast-utils';
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Provider', await buildTableOfContent(project, 'Provider')))

  export default {
    name: 'Provider',
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
      this.classes = await findClasses(project, 'Provider');
      this.classesNames = this.classes.map((c: ClassInfo) => c.name);
      this.interfaces = await findInterfaces(project, 'Provider');

      this.interfacesNames = this.interfaces.map((c: ClassInfo) => c.name);
      this.typeAliases = await findTypeAliases(project, 'Provider');
      this.typeAliasesNames = this.typeAliases.map((c: ClassInfo) => c.name);
      this.functions = await findFunctions(project, 'Provider');
      this.functionsNames = this.functions.map((c: ClassInfo) => c.name);
      this.tableOfContent = await buildTableOfContent(project, 'Provider');
      this.pageContent = await buildPage(project, 'Provider', this.tableOfContent);

    },
  };
</script>

# Provider

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
