declare module '*.vue' {
  import type { ComponentOptions } from 'vue';
  const Component: ComponentOptions;
  export default Component;
}

declare module '*.md' {
  import type { ComponentOptions } from 'vue';
  const Component: ComponentOptions;
  export default Component;
}

declare module 'vue-toastification/dist/index.mjs' {
  export * from 'vue-toastification';
}
