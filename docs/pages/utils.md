<script lang="ts">
  import { findClasses, findTypeAliases, findInterfaces, findFunctions, ClassInfo, ReflectionKind, } from './../.vitepress/ast-utils';
  import { buildTableOfContent, buildPage } from './../scripts/build';

  const project = (await import(/* @vite-ignore */ './../build/typedoc-ast.json').then(
    module => module.default,
  )) as ProjectReflection;

  // console.log(await buildPage(project, 'Utils', await buildTableOfContent(project, 'Utils')))

  export default {
    name: 'Utils',
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
      this.classes = await findClasses(project, 'Utils');
      this.classesNames = this.classes.map((c: ClassInfo) => c.name);
      this.interfaces = await findInterfaces(project, 'Utils');

      this.interfacesNames = this.interfaces.map((c: ClassInfo) => c.name);
      this.typeAliases = await findTypeAliases(project, 'Utils');
      this.typeAliasesNames = this.typeAliases.map((c: ClassInfo) => c.name);
      this.functions = await findFunctions(project, 'Utils');
      this.functionsNames = this.functions.map((c: ClassInfo) => c.name);
      this.tableOfContent = await buildTableOfContent(project, 'Utils');
      this.pageContent = await buildPage(project, 'Utils', this.tableOfContent);

    },
  };
</script>

# Utils

## Table of Contents

<TableOfContentComponent :tocData="tableOfContent" />

<PageContentComponent :page="pageContent" />
