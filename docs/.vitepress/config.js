import vue from '@vitejs/plugin-vue';
// import enchanceApp from './theme';
// import resolveExtensionVue from 'vite-plugin-resolve-extension-vue';
import { resolve } from 'path';

module.exports = {
  title: 'Everscale Inpage Provider',
  description: 'Web3-like interface to the Everscale blockchain.',
  plugins: [vue()],
  // theme: enchanceApp,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/pages/hello.md' },
      //{ text: 'Guide', link: '/pages/hello.md' },
    ],
    sidebar: [
      {
        text: 'API Reference',
        collapsable: false,

        items: [
          {
            text: 'Everscale Inpage Provider',
            collapsable: false,
            link: '/pages/index.md',
            items: [
              { text: 'Provider', link: '/pages/provider.md' },
              { text: 'Provider API', link: '/pages/provider-api.md' },
              { text: 'Models', link: '/pages/models.md' },
              { text: 'Stream', link: '/pages/stream.md' },
              { text: 'Utils', link: '/pages/utils.md' },
            ],
          },
        ],
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lightTheme: resolve(__dirname, 'styles/light-theme.css'),
        darkTheme: resolve(__dirname, 'styles/dark-theme.css'),
      },
    },
  },
};
