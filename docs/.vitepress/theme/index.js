import DefaultTheme from 'vitepress/theme';
import ClassComponent from './../components/class/Class.vue';
import ConstructorComponent from './../components/class/components/Constructor.vue';
import AccessorComponent from './../components/class/components/Accessor.vue';
import MethodComponent from './../components/class/components/Method.vue';
import PropertyComponent from './../components/class/components/Property.vue';
import TypeAliasComponent from './../components/type-alias/TypeAlias.vue';
import InterfaceComponent from './../components/interface/Interface.vue';
import FunctionComponent from './../components/function/Function.vue';
import TableOfContentComponent from './../components/shared/TableOfContent.vue';
import PropertyTableComponent from './../components/shared/PropertyTable.vue';
import DefinedInLinkComponent from './../components/shared/DefinedInLink.vue';
import ComponentSwitcher from './../components/component-switcher/ComponentSwitcher.vue';
import PageContentComponent from './../components/page-content/PageContent.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp({ app });
    app.component('ClassComponent', ClassComponent);
    app.component('ConstructorComponent', ConstructorComponent);
    app.component('AccessorComponent', AccessorComponent);
    app.component('MethodComponent', MethodComponent);
    app.component('PropertyComponent', PropertyComponent);
    app.component('TypeAliasComponent', TypeAliasComponent);
    app.component('InterfaceComponent', InterfaceComponent);
    app.component('FunctionComponent', FunctionComponent);
    app.component('TableOfContentComponent', TableOfContentComponent);
    app.component('PropertyTableComponent', PropertyTableComponent);
    app.component('DefinedInLinkComponent', DefinedInLinkComponent);
    app.component('ComponentSwitcher', ComponentSwitcher);
    app.component('PageContentComponent', PageContentComponent);
  },
};
