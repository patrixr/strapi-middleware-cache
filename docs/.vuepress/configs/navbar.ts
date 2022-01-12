import type { NavbarConfig } from "@vuepress/theme-default";
import { version } from "./meta";

export const navbar: NavbarConfig = [
  {
    text: "Getting started",
    link: "/getting-started/",
    activeMatch: "^/getting-started/",
  },
  {
    text: "Documentation",
    link: "/documentation/",
    activeMatch: "^/documentation/",
  },
  {
    text: `v${version}`,
    children: [
      {
        text: "Releases",
        link: "https://github.com/patrixr/strapi-middleware-cache/releases",
      },
    ],
  },
];
