// @ts-check
/* eslint-env es6 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  default: [
    {
      type: "category",
      collapsed: false,
      label: "Guide",
      items: ["guide/index", "guide/installation"],
      collapsible: false,
    },
    {
      type: "category",
      collapsed: false,
      label: "Provider",
      items: [
        "provider/index",
        "provider/memory",
        "provider/redis",
        "provider/couchbase",
        "provider/custom-provider",
      ],
      collapsible: false,
    },
    {
      type: "category",
      collapsed: false,
      label: "Strategy",
      items: [
        "strategy/index",
        "strategy/cache-content-type",
        "strategy/cache-custom-routes",
        "strategy/cache-keys",
        "strategy/debug",
      ],
      collapsible: false,
    },
    {
      type: "category",
      collapsed: false,
      label: "API",
      items: ["api/index", "api/admin-routes"],
      collapsible: false,
    },
  ],
};

module.exports = sidebars;
