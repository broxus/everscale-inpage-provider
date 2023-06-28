import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import Components from 'unplugin-vue-components/vite';

const HELP_URL = 'https://t.me/everdev';
const FEEDBACK_URL = '';
const GITHUB_URL = 'https://github.com/broxus/everscale-inpage-provider';

module.exports = {
  title: 'everscale-inpage-provider-docs',
  base: '',
  description: 'everscale-inpage-provider',

  plugins: [vue(), Components({ dst: true })],
  resolve: {
    alias: {
      '@themeComponents': resolve(__dirname, 'broxus-docs-kit-dev/dist/theme/components'),
      '@themeStyles': resolve(__dirname, 'broxus-docs-kit-dev/dist/theme/styles'),
      '@components': './../src/components',
      '@styles': './../src/styles',
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Feedback', link: FEEDBACK_URL },
      { text: 'Community', link: HELP_URL },
    ],
    sidebar: [
      { text: 'Introduction', link: '/' },
      {
        text: 'Guide',
        collapsable: false,

        items: [
          {
            text: 'Sample Page',
            collapsable: false,
            link: '/guides/sample-guide.md',
          },
        ],
      },
      {
        text: 'API Reference',
        collapsable: false,

        items: [
          {
            text: 'Sample Page',
            collapsable: false,
            link: '/api-reference/sample-page.md',
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: GITHUB_URL }],
  },

  esbuild: {
    target: ['chrome89', 'edge89', 'firefox79', 'safari14.1'],
  },
};
