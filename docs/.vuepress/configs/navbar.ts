import type { NavbarConfig } from "@vuepress/theme-default";
import { version } from "./meta";

export const navbar: NavbarConfig = [
  {
    text: "Getting started",
    link: "/getting-started/",
    activeMatch: "^/getting-started/",
  },
  {
    text: "Developer Guide",
    link: "/documentation/",
    activeMatch: "^/documentation/",
  },
  {
    text: `v${version}`,
    children: [
      {
        text: "Releases",
        link: "https://github.com/strapi-community/strapi-plugin-rest-cache/releases",
      },
      {
        text: "Strapi v3.x.x version",
        link: "https://github.com/patrixr/strapi-middleware-cache",
      },
    ],
  },
];
