import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

import nodeExternals from 'vite-plugin-node-externals';
import { viteExternalsPlugin as externals } from 'vite-plugin-externals';

module.exports = {
  title: 'Everscale Inpage Provider',
  base: '/everscale-inpage-provider/docs/',
  description: 'Web3-like interface to the Everscale blockchain.',
  plugins: [
    vue(),
    typescript(),
    nodeExternals({
      allowList: ['vue', 'vue-toastification', 'js-base64'],
    }),
    // externals({
    //   externals: ['fs', 'path', 'assert', 'util', 'typedoc'],
    // }),
  ],
  // resolve: {
  //   alias: {
  //     alias: {
  //       http: require.resolve('rollup-plugin-node-builtins'),
  //       path: require.resolve('rollup-plugin-node-builtins'),
  //       fs: require.resolve('rollup-plugin-node-builtins'),
  //       os: require.resolve('rollup-plugin-node-builtins'),
  //       tslib: require.resolve('rollup-plugin-node-builtins'),
  //       child_process: require.resolve('rollup-plugin-node-builtins'),
  //       crypto: require.resolve('rollup-plugin-node-builtins'),
  //       stream: require.resolve('rollup-plugin-node-builtins'),
  //       https: require.resolve('rollup-plugin-node-builtins'),
  //       http2: require.resolve('rollup-plugin-node-builtins'),
  //       process: require.resolve('rollup-plugin-node-builtins'),
  //     },
  //   },
  // },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/pages/overview.md' },
      // { text: 'Guide', link: '/pages/guide.md' },
    ],
    sidebar: [
      { text: 'Overview', link: '/pages/overview.md' },
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
  // build: {
  //   rollupOptions: {
  //     input: {
  //       main: resolve(__dirname, 'index.html'),
  //       lightTheme: resolve(__dirname, 'styles/light-theme.css'),
  //       darkTheme: resolve(__dirname, 'styles/dark-theme.css'),
  //       external: ['fs', 'path', 'assert', 'util'],
  //     },
  //   },
  // },

  esbuild: {
    target: ['chrome89', 'edge89', 'firefox79', 'safari14.1'],
  },
  optimizeDeps: {
    exclude: ['typedoc'],
  },
};
