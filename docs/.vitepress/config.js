import { createRequire } from 'module'
import { defineConfig } from 'vitepress'

const require = createRequire(import.meta.url)
const pkg = require('strapi-plugin-rest-cache/package.json')

export default defineConfig({
  title: "REST Cache",
  description: "Speed-up HTTP requests with LRU cache",
  base: "/strapi-plugin-rest-cache/",
  lastUpdated: true,
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/strapi-community/strapi-plugin-rest-cache' },
    ],
    editLink: {
      pattern: 'https://github.com/strapi-community/strapi-plugin-rest-cache/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    logo: {
      src: "/icon.png",
    },
    outline: [2,3],
    footer: {
      message: 'Made with ❤️ by <a href="https://github.com/strapi-community/">Strapi Community</a>'
    },
    nav: [
      {
        text: "Guide",
        link: "/guide/", 
        activeMatch: '/guide/',
      },
      {
        text: pkg.version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/strapi-community/strapi-plugin-rest-cache/blob/main/CHANGELOG.md'
          },
          {
            text: 'Strapi Community',
            link: 'https://github.com/strapi-community'
          }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
          ]
        },
        {
          text: 'Provider',
          collapsible: true,
          items: [
            { text: 'Provider configuration', link: '/guide/provider/' },
            { text: 'Provider: Memory', link: '/guide/provider/memory' },
            { text: 'Provider: Redis', link: '/guide/provider/redis' },
            { text: 'Provider: Couchbase', link: '/guide/provider/couchbase' },
            { text: 'Custom provider', link: '/guide/provider/custom-provider' },
          ]
        },
        {
          text: 'Strategy',
          collapsible: true,
          items: [
            { text: 'Strategy configuration', link: '/guide/strategy/' },
            { text: 'Cache content type', link: '/guide/strategy/cache-content-type' },
            { text: 'Cache custom routes', link: '/guide/strategy/cache-custom-routes' },
            { text: 'Cache keys', link: '/guide/strategy/cache-keys' },
            { text: 'Debug mode', link: '/guide/strategy/debug' },
          ]
        },
        {
          text: 'API',
          collapsible: true,
          items: [
            { text: 'Services', link: '/guide/api/' },
            { text: 'Admin Routes', link: '/guide/api/admin-routes' },
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          collapsible: true,
          items: [
            { text: 'Configuration', link: '/reference/configuration' },
            { text: 'Routes', link: '/reference/routes' },
            { text: 'Services', link: '/reference/services' },
          ]
        }
      ]
    }
  }
})
