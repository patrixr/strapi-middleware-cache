"use strict";

module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        max: 32767,
      },
      strategy: {
        enableEtag: true,
        enableXCacheHeaders: true,
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
};
