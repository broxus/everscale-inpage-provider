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
  title: ' ', // It's hack to different navBarTitle's
  base: '/',
  description: 'Web3-like interface to the TVM-compatible blockchains.',
  rewrites: {
    'src/index.md': 'index.md',
    //everscale-inpage-provider
    'src/everscale-inpage-provider/overview.md': 'everscale-inpage-provider/overview.md',
    'src/everscale-inpage-provider/guides/introduction.md': 'everscale-inpage-provider/guides/introduction.md',
    'src/everscale-inpage-provider/guides/installation.md': 'everscale-inpage-provider/guides/installation.md',
    'src/everscale-inpage-provider/guides/working-with-cells.md':
      'everscale-inpage-provider/guides/working-with-cells.md',
    'src/everscale-inpage-provider/guides/working-with-contracts.md':
      'everscale-inpage-provider/guides/working-with-contracts.md',
    'src/everscale-inpage-provider/guides/subscriptions.md': 'everscale-inpage-provider/guides/subscriptions.md',
    'src/everscale-inpage-provider/guides/cryptography.md': 'everscale-inpage-provider/guides/cryptography.md',
    'src/everscale-inpage-provider/guides/deploy.md': 'everscale-inpage-provider/guides/deploy.md',
    //api-reference
    'src/everscale-inpage-provider/api-reference/index.md': 'everscale-inpage-provider/api-reference/index.md',
    'src/everscale-inpage-provider/api-reference/provider.md': 'everscale-inpage-provider/api-reference/provider.md',
    'src/everscale-inpage-provider/api-reference/contract.md': 'everscale-inpage-provider/api-reference/contract.md',
    'src/everscale-inpage-provider/api-reference/stream.md': 'everscale-inpage-provider/api-reference/stream.md',
    'src/everscale-inpage-provider/api-reference/models.md': 'everscale-inpage-provider/api-reference/models.md',
    'src/everscale-inpage-provider/api-reference/provider-api.md':
      'everscale-inpage-provider/api-reference/provider-api.md',
    'src/everscale-inpage-provider/api-reference/utils.md': 'everscale-inpage-provider/api-reference/utils.md',
    'src/everscale-inpage-provider/api-reference/other.md': 'everscale-inpage-provider/api-reference/other.md',

    //standalone
    'src/everscale-inpage-provider/guides/standalone/introduction.md':
      'everscale-inpage-provider/guides/standalone/introduction.md',
    'src/everscale-inpage-provider/guides/standalone/installation-and-setup.md':
      'everscale-inpage-provider/guides/standalone/installation-and-setup.md',
    'src/everscale-inpage-provider/guides/standalone/keystore.md':
      'everscale-inpage-provider/guides/standalone/keystore.md',
    'src/everscale-inpage-provider/guides/standalone/account-storage.md':
      'everscale-inpage-provider/guides/standalone/account-storage.md',
    'src/everscale-inpage-provider/guides/standalone/time-manipulation.md':
      'everscale-inpage-provider/guides/standalone/time-manipulation.md',
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
  plugins: [
    virtualPlainText(['fs', 'typedoc']),
    vue(),
    vueJsx(),
    typescript(),
    nodePolyfills({ fs: true }),

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
      provider: 'local',
      // options: {
      //   appId: 'PO35QKO8BH',
      //   apiKey: 'a05de06a8a39cc367ef6bdd478b7e64b',
      //   indexName: 'my_first_index',
      // },
    },
    nav: [
      { text: 'Feedback', link: `${FEEDBACK_URL}` },
      { text: 'Community', link: `${HELP_URL}` },
    ],
    sidebar: {
      '/': [
        {
          text: 'Everscale Inpage Provider',

          link: '/everscale-inpage-provider/overview.md',
        },
        {
          text: 'OctusBridge Integration',

          link: 'https://octus-bridge-integration-demo.vercel.app/',
        },
        { text: 'Locklift', link: 'https://locklift-docs.netlify.app/' },
      ],
      '/everscale-inpage-provider/': [
        { text: 'Overview', link: '/everscale-inpage-provider/overview.md' },
        {
          text: 'Guide',
          collapsable: false,
          items: [
            { text: 'Introduction', link: '/everscale-inpage-provider/guides/introduction.md' },
            { text: 'Installation & Setup', link: '/everscale-inpage-provider/guides/installation.md' },
            { text: 'Working with Cells', link: '/everscale-inpage-provider/guides/working-with-cells.md' },
            { text: 'Interaction with Contracts', link: '/everscale-inpage-provider/guides/working-with-contracts.md' },
            { text: 'Subscriptions', link: '/everscale-inpage-provider/guides/subscriptions.md' },
            { text: 'Cryptography & Security', link: '/everscale-inpage-provider/guides/cryptography.md' },
            { text: 'Deploy a Contract', link: '/everscale-inpage-provider/guides/deploy.md' },
          ],
        },
        {
          text: 'Standalone Client',
          collapsable: false,

          items: [
            { text: 'Introduction', link: '/everscale-inpage-provider/guides/standalone/introduction.md' },
            {
              text: 'Installation & Setup',
              link: '/everscale-inpage-provider/guides/standalone/installation-and-setup.md',
            },
            { text: 'Keystore', link: '/everscale-inpage-provider/guides/standalone/keystore.md' },
            { text: 'Account Storage', link: '/everscale-inpage-provider/guides/standalone/account-storage.md' },
            { text: 'Time manipulation', link: '/everscale-inpage-provider/guides/standalone/time-manipulation.md' },
          ],
        },

        {
          text: 'API Reference',
          collapsable: false,

          items: [
            {
              text: 'Everscale Inpage Provider',
              collapsable: false,
              link: '/everscale-inpage-provider/api-reference/index.md',
              items: [
                { text: 'Provider', link: '/everscale-inpage-provider/api-reference/provider.md' },
                { text: 'Contract', link: '/everscale-inpage-provider/api-reference/contract.md' },
                { text: 'Stream', link: '/everscale-inpage-provider/api-reference/stream.md' },
                { text: 'Models', link: '/everscale-inpage-provider/api-reference/models.md' },
                { text: 'Provider API', link: '/everscale-inpage-provider/api-reference/provider-api.md' },
                { text: 'Utils', link: '/everscale-inpage-provider/api-reference/utils.md' },
                { text: 'Other', link: '/everscale-inpage-provider/api-reference/other.md' },
              ],
            },
          ],
        },
      ],
    },
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
