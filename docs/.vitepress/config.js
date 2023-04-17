import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

module.exports = {
  title: 'Everscale Inpage Provider',
  description: 'Web3-like interface to the Everscale blockchain.',
  plugins: [vue(), typescript()],
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
          {
            text: 'Core Components',
            collapsable: false,
            items: [
              { text: 'Working with Cells', link: '/pages/guides/3.1-working-with-cells.md' },
              { text: 'Working with Contracts', link: '/pages/working-with-contracts.md' },
              { text: 'Subscriptions', link: '/pages/subscriptions.md' },
              { text: 'Cryptography', link: '/pages/cryptography.md' },
            ],
          },
          { text: 'Standalone Section', link: '/pages/standalone-section.md' },
          {
            text: 'Real-life Examples',
            collapsable: false,
            items: [
              { text: 'Contract Deployment', link: '/pages/contract-deployment.md' },
              { text: 'Working with tip3', link: '/pages/working-with-tip3.md' },
              // { text: 'Working with NFTs', link: '/pages/working-with-nfts.md' },
              { text: 'Authorization through signing a string', link: '/pages/authorization.md' },
              { text: 'Additional frequently used examples', link: '/pages/additional-examples.md' },
            ],
          },
          { text: 'Additional Resources and Links', link: '/pages/additional-resources.md' },
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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lightTheme: resolve(__dirname, 'styles/light-theme.css'),
        darkTheme: resolve(__dirname, 'styles/dark-theme.css'),
      },
    },
  },

  esbuild: {
    target: ['chrome89', 'edge89', 'firefox79', 'safari14.1'],
  },
  optimizeDeps: {
    exclude: ['typedoc'],
  },
};
