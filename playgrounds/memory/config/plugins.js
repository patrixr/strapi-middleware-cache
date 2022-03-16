"use strict";

module.exports = ({ env }) => ({
  "rest-cache": {
    enabled: env.bool("ENABLE_CACHE", true),
    config: {
      provider: {
        name: "memory",
        max: 32767,
      },
      strategy: {
        enableEtag: env.bool("ENABLE_ETAG", true),
        enableXCacheHeaders: env.bool("ENABLE_XCACHE_HEADERS", true),
        contentTypes: [
          "api::article.article",
          "api::global.global",
          "api::homepage.homepage",
          {
            contentType: "api::category.category",
            maxAge: 3600000,
            hitpass: false,
            keys: {
              useQueryParams: false,
              useHeaders: ["accept-encoding"],
            },
            routes: [
              {
                path: "/api/categories/slug/:slug+",
                keys: {
                  useQueryParams: ["populate", "locale"],
                  useHeaders: [],
                },
                maxAge: 18000,
                method: "GET",
              },
            ],
          },
        ],
      },
    },
  },
});
