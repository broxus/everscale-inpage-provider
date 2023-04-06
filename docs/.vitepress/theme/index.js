import DefaultTheme from 'vitepress/theme';
import ClassComponent from './../components/class/Class.vue';
import ConstructorComponent from './../components/class/components/Constructor.vue';
import AccessorComponent from './../components/class/components/Accessor.vue';
import MethodComponent from './../components/class/components/Method.vue';
import PropertyComponent from './../components/class/components/Property.vue';
import TypeAliasComponent from './../components/type-alias/TypeAlias.vue';
import InterfaceComponent from './../components/interface/Interface.vue';

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
  },
};
