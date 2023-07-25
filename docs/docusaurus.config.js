// @ts-check
/* eslint-env es6 */

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "REST Cache",
  tagline: "Speed-up HTTP requests with LRU cache",
  favicon: "img/favicon.ico",
  url: "https://strapi-community.github.io/",
  baseUrl: "/strapi-plugin-rest-cache/",
  organizationName: "strapi-community",
  projectName: "strapi-plugin-rest-cache",
  trailingSlash: false,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  plugins: [],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/strapi-community/strapi-plugin-rest-cache/tree/main/",
        },
        blog: false,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      guide: {
        sidebar: {
          hideable: true,
          autoCollapsedCategories: true,
        },
      },
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: "REST Cache Logo",
          src: "img/logo-rest-cache-light.svg",
          srcDark: "img/logo-rest-cache-dark.svg",
        },
        items: [
          {
            type: "doc",
            docId: "guide/index",
            position: "left",
            label: "Guide",
          },
          {
            type: "doc",
            docId: "provider/index",
            position: "left",
            label: "Providers",
          },
          {
            type: "doc",
            docId: "strategy/index",
            position: "left",
            label: "Strategies",
          },
          {
            type: "doc",
            docId: "api/index",
            position: "left",
            label: "API",
          },
          {
            href: "https://github.com/strapi-community/strapi-plugin-rest-cache",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      // footer: {
      //   style: "dark",
      //   links: [
      //     {
      //       title: "Docs",
      //       items: [
      //         {
      //           to: "/guide",
      //           label: "Guide",
      //         },
      //         {
      //           to: "/provider",
      //           label: "Providers",
      //         },
      //         {
      //           to: "/strategy",
      //           label: "Strategies",
      //         },
      //         {
      //           to: "/api",
      //           label: "API",
      //         },
      //       ],
      //     },
      //     {
      //       title: "Community",
      //       items: [
      //         {
      //           label: "Discord",
      //           href: "https://discord.strapi.io/",
      //         },
      //         {
      //           label: "Community Organization",
      //           href: "https://github.com/strapi-community",
      //         },
      //       ],
      //     },
      //   ],
      //   copyright: `Copyright © ${new Date().getFullYear()} Strapi Community Organization`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
