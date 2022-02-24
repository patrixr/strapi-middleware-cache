import type { SidebarConfig } from "@vuepress/theme-default";

export const sidebar: SidebarConfig = {
  "/getting-started/": [],
  "/documentation/": [
    {
      text: "Developer Guide",
      children: [
        "/documentation/README.md",
        "/documentation/how-it-works.md",
        "/documentation/configuration-reference.md",
        "/documentation/memory-provider.md",
        "/documentation/redis-provider.md",
        "/documentation/couchbase-provider.md",
      ],
    },
    {
      text: "Advanced",
      children: [
        "/documentation/services.md",
        "/documentation/routes.md",
        "/documentation/custom-provider.md",
      ],
    },
  ],
};
