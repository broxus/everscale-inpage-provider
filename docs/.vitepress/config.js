import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

import dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, './../', '.env') });

const env = process.env;

const HELP_URL = env.HELP_URL || '';
const FEEDBACK_URL = env.FEEDBACK_URL || '';

const NAV = [
  {
    text: 'Broxus Docs',
    items: [
      { text: 'Home', link: 'https://docs.broxus.com' },
      { text: 'Inpage Provider', link: '/' },
      { text: 'Locklift', link: 'https://docs.locklift.io/' },
      { text: 'OctusBridge Integration', link: 'https://integrate.octusbridge.io/' },
      {
        text: 'TIP-3 Api Reference',
        link: 'https://tip3-api-reference.netlify.app/',
      },
    ],
  },
  { text: 'Feedback', link: FEEDBACK_URL },
  { text: 'Community', link: HELP_URL },
];

module.exports = {
  title: 'Everscale Inpage Provider',
  base: '/',
  description: 'Web3-like interface to the TVM-compatible blockchains.',
  lastUpdated: true,
  rewrites: {
    'src/pages/index.md': 'index.md',
    //everscale-inpage-provider
    //'src/pages/everscale-inpage-provider/overview.md': 'everscale-inpage-provider/overview.md',
    'src/pages/guides/introduction.md': 'guides/introduction.md',
    'src/pages/guides/installation.md': 'guides/installation.md',
    'src/pages/guides/working-with-cells.md': 'guides/working-with-cells.md',
    'src/pages/guides/working-with-contracts.md': 'guides/working-with-contracts.md',
    'src/pages/guides/subscriptions.md': 'guides/subscriptions.md',
    'src/pages/guides/cryptography.md': 'guides/cryptography.md',
    'src/pages/guides/deploy.md': 'guides/deploy.md',
    //api-reference
    'src/pages/api-reference/index.md': 'api-reference/index.md',
    'src/pages/api-reference/provider.md': 'api-reference/provider.md',
    'src/pages/api-reference/contract.md': 'api-reference/contract.md',
    'src/pages/api-reference/stream.md': 'api-reference/stream.md',
    'src/pages/api-reference/models.md': 'api-reference/models.md',
    'src/pages/api-reference/provider-api.md': 'api-reference/provider-api.md',
    'src/pages/api-reference/utils.md': 'api-reference/utils.md',
    'src/pages/api-reference/other.md': 'api-reference/other.md',

    //standalone
    'src/pages/guides/standalone/introduction.md': 'guides/standalone/introduction.md',
    'src/pages/guides/standalone/installation-and-setup.md': 'guides/standalone/installation-and-setup.md',
    'src/pages/guides/standalone/keystore.md': 'guides/standalone/keystore.md',
    'src/pages/guides/standalone/account-storage.md': 'guides/standalone/account-storage.md',
    'src/pages/guides/standalone/time-manipulation.md': 'guides/standalone/time-manipulation.md',
  },
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
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-SL17528F6E');",
    ],
  ],
  plugins: [vue(), typescript()],
  resolve: {
    SimpleSearch: {},
    alias: {
      './components/AlgoliaSearchBox.vue': 'vitepress-plugin-search/src/pages/Search.vue',
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
    editLink: {
      pattern: 'https://github.com/cyace84/everscale-inpage-provider/edit/docs/docs/:path',
    },
    search: {
      provider: 'local',
      // options: {
      //   appId: 'PO35QKO8BH',
      //   apiKey: 'a05de06a8a39cc367ef6bdd478b7e64b',
      //   indexName: 'my_first_index',
      // },
    },
    nav: NAV,
    sidebar: [
      { text: 'Overview', link: '/' },
      {
        text: 'Guide',
        collapsable: false,
        items: [
          { text: 'Introduction', link: '/guides/introduction.md' },
          { text: 'Installation & Setup', link: '/guides/installation.md' },
          { text: 'Working with Cells', link: '/guides/working-with-cells.md' },
          { text: 'Interaction with Contracts', link: '/guides/working-with-contracts.md' },
          { text: 'Subscriptions', link: '/guides/subscriptions.md' },
          { text: 'Cryptography & Security', link: '/guides/cryptography.md' },
          { text: 'Deploy a Contract', link: '/guides/deploy.md' },
        ],
      },
      {
        text: 'Standalone Client',
        collapsable: false,

        items: [
          { text: 'Introduction', link: '/guides/standalone/introduction.md' },
          {
            text: 'Installation & Setup',
            link: '/guides/standalone/installation-and-setup.md',
          },
          { text: 'Keystore', link: '/guides/standalone/keystore.md' },
          { text: 'Account Storage', link: '/guides/standalone/account-storage.md' },
          { text: 'Time manipulation', link: '/guides/standalone/time-manipulation.md' },
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
