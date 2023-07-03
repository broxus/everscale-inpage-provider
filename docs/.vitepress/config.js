import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

// import { createHtmlPlugin as html } from 'vite-plugin-html';
import { viteExternalsPlugin as externals } from 'vite-plugin-externals';
//import vueJsx from '@vitejs/plugin-vue-jsx';
import dotenv from 'dotenv';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import virtualPlainText from 'vite-plugin-virtual-plain-text';
import vueJsx from '@vitejs/plugin-vue-jsx';

dotenv.config({ path: resolve(__dirname, './../', '.env') });

const env = process.env;

const HELP_URL = env.HELP_URL || '';
const FEEDBACK_URL = env.FEEDBACK_URL || '';

module.exports = {
  title: 'Everscale Inpage Provider',
  base: '/',
  description: 'Web3-like interface to the TVM-compatible blockchains.',

  head: [
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-SL17528F6E',
      },
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-T6WMP40ZQ6');",
    ],
  ],
  plugins: [
    virtualPlainText(['fs', 'typedoc']),
    vue(),
    vueJsx(),
    typescript(),
    nodePolyfills({ fs: true }),
    // nodeExternals({
    //   allowList: ['vue', 'vue-toastification', 'js-base64'],
    // }),

    externals({
      externals: ['fs', 'path', 'assert', 'util', 'typedoc'],
    }),
  ],
  resolve: {
    SimpleSearch: {},
    alias: {
      './components/AlgoliaSearchBox.vue': 'vitepress-plugin-search/src/Search.vue',
      // http: require.resolve('rollup-plugin-node-builtins'),
      // path: require.resolve('rollup-plugin-node-builtins'),
      fs: 'empty-module',
      //fs: require.resolve('rollup-plugin-node-builtins'),
      // os: require.resolve('rollup-plugin-node-builtins'),
      // tslib: require.resolve('rollup-plugin-node-builtins'),
      // child_process: require.resolve('rollup-plugin-node-builtins'),
      // crypto: require.resolve('rollup-plugin-node-builtins'),
      // stream: require.resolve('rollup-plugin-node-builtins'),
      // https: require.resolve('rollup-plugin-node-builtins'),
      // http2: require.resolve('rollup-plugin-node-builtins'),
      // process: require.resolve('rollup-plugin-node-builtins'),
    },
  },
  themeConfig: {
    search: {
      provider: 'algolia',
      options: {
        appId: 'PO35QKO8BH',
        apiKey: 'a05de06a8a39cc367ef6bdd478b7e64b',
        indexName: 'my_first_index',
      },
    },
    nav: [
      { text: 'Feedback', link: `${FEEDBACK_URL}` },
      { text: 'Community', link: `${HELP_URL}` },
    ],
    sidebar: [
      { text: 'Overview', link: '/' },
      {
        text: 'Guide',
        collapsable: false,
        items: [
          { text: 'Introduction', link: 'guides/1-introduction.md' },
          { text: 'Installation & Setup', link: 'guides/2-installation.md' },
          { text: 'Working with Cells', link: 'guides/3.1-working-with-cells.md' },
          { text: 'Interaction with Contracts', link: 'guides/3.2-working-with-contracts.md' },
          { text: 'Subscriptions', link: 'guides/3.3-subscriptions.md' },
          { text: 'Cryptography & Security', link: 'guides/3.4-cryptography.md' },
          { text: 'Deploy a Contract', link: 'guides/4-deploy.md' },
        ],
      },
      {
        text: 'Standalone Client',
        collapsable: false,

        items: [
          { text: 'Introduction', link: 'guides/standalone/1-introduction.md' },
          { text: 'Installation & Setup', link: 'guides/standalone/2-installation-and-setup.md' },
          { text: 'Keystore', link: 'guides/standalone/3-keystore.md' },
          { text: 'Account Storage', link: 'guides/standalone/4-account-storage.md' },
          { text: 'Time manipulation', link: 'guides/standalone/5-time-manipulation.md' },
        ],
      },

      {
        text: 'API Reference',
        collapsable: false,

        items: [
          {
            text: 'Everscale Inpage Provider',
            collapsable: false,
            link: '/api-reference/index.md',
            items: [
              { text: 'Provider', link: '/api-reference/provider.md' },
              { text: 'Contract', link: '/api-reference/contract.md' },
              { text: 'Stream', link: '/api-reference/stream.md' },
              { text: 'Models', link: '/api-reference/models.md' },
              { text: 'Provider API', link: '/api-reference/provider-api.md' },
              { text: 'Utils', link: '/api-reference/utils.md' },
              { text: 'Other', link: '/api-reference/other.md' },
            ],
          },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/broxus/everscale-inpage-provider' }],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lightTheme: resolve(__dirname, 'styles/light-theme.css'),
        darkTheme: resolve(__dirname, 'styles/dark-theme.css'),
        external: ['fs', 'path', 'assert', 'util'],
      },
    },
  },

  esbuild: {
    target: ['chrome89', 'edge89', 'firefox79', 'safari14.1'],
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'assert', 'util'],
  },
};
