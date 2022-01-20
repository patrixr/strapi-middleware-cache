import path from "path";
import { defineUserConfig } from "vuepress";
import type { DefaultThemeOptions } from "vuepress";

import { navbar } from "./configs/navbar";
import { sidebar } from "./configs/sidebar";

export default defineUserConfig<DefaultThemeOptions>({
  title: "REST Cache",
  description: "Speed-up HTTP requests with LRU cache",
  lang: "en-US",

  head: [
    ["link", { rel: "icon", type: "image/png", href: "/icon.png" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,600,0,700&display=swap",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fira+Code&display=swap",
      },
    ],
  ],
  plugins: [
    "@vuepress/plugin-search",
    [
      "@vuepress/register-components",
      {
        componentsDir: path.resolve(__dirname, "./components"),
      },
    ],
  ],

  theme: "@vuepress/default",
  themeConfig: {
    docsRepo: "strapi-community/strapi-plugin-rest-cache",
    docsDir: "docs",
    docsBranch: "feature/strapi-v4",
    editLinks: true,
    logo: "/icon.png",
    repo: "strapi-community/strapi-plugin-rest-cache",
    lastUpdated: true,
    contributors: true,
    navbar,
    sidebar,
  },
});
