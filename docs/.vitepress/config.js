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

const flexSearchIndexOptions = {
  preset: 'default',
  tokenize: 'strict',
  cache: true,
  resolution: 9,
  context: false,
  optimize: true,
};

var options = {
  ...flexSearchIndexOptions,
  previewLength: 62,
  buttonLabel: 'Search',
  placeholder: 'Search docs',
  allow: [],
  ignore: [],
};

module.exports = {
  title: 'Everscale Inpage Provider',
  base: '/',
  description: 'Web3-like interface to the TVM-compatible blockchains.',
  head: [
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-T6WMP40ZQ6',
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
      provider: 'local',
    },
    nav: [
      // { text: 'Home', link: '/pages/overview.md' },
      { text: 'Feedback', link: `${FEEDBACK_URL}` },
      { text: 'Community', link: `${HELP_URL}` },
      // { text: 'Guide', link: '/pages/guide.md' },
    ],
    sidebar: [
      { text: 'Overview', link: './../../' },
      {
        text: 'Guide',
        collapsable: false,
        items: [
          { text: 'Introduction', link: '/pages/guides/1-introduction.md' },
          { text: 'Installation and Configuration', link: '/pages/guides/2-installation.md' },
          { text: 'Working with Cells', link: '/pages/guides/3.1-working-with-cells.md' },
          { text: 'Interaction with Contracts', link: '/pages/guides/3.2-working-with-contracts.md' },
          { text: 'Subscriptions', link: '/pages/guides/3.3-subscriptions.md' },
          { text: 'Cryptography & Security', link: '/pages/guides/3.4-cryptography.md' },

          // { text: 'Standalone Section', link: '/pages/standalone-section.md' },
          // {
          //   text: 'Real-life Examples',
          //   collapsable: false,
          //   items: [
          //     { text: 'Working with tip3', link: '/pages/working-with-tip3.md' },
          //     // { text: 'Working with NFTs', link: '/pages/working-with-nfts.md' },
          //     { text: 'Authorization through signing a string', link: '/pages/authorization.md' },
          //     { text: 'Additional frequently used examples', link: '/pages/additional-examples.md' },
          //   ],
          // },
          // { text: 'Additional Resources and Links', link: '/pages/additional-resources.md' },
        ],
      },
      {
        text: 'Standalone Client',
        collapsable: false,

        items: [
          { text: 'Introduction', link: '/pages/guides/standalone/1-introduction.md' },
          { text: 'Installation & Setup', link: '/pages/guides/standalone/2-installation-and-setup.md' },
          { text: 'Keystore', link: '/pages/guides/standalone/3-keystore.md' },
          { text: 'Account Storage', link: '/pages/guides/standalone/4-account-storage.md' },
          { text: 'Time manipulation', link: '/pages/guides/standalone/5-time-manipulation.md' },
        ],
      },

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
              { text: 'Contract', link: '/pages/contract.md' },
              { text: 'Stream', link: '/pages/stream.md' },
              { text: 'Models', link: '/pages/models.md' },
              { text: 'Provider API', link: '/pages/provider-api.md' },
              { text: 'Utils', link: '/pages/utils.md' },
              { text: 'Other', link: '/pages/other.md' },
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
