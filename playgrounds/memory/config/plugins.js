"use strict";

module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        max: 32767,
      },
      strategy: {
        debug: true,
        enableEtag: true,
        enableXCacheHeaders: true,
        enableAdminCTBMiddleware: true,
        clearRelatedCache: true,
        resetOnStartup: true,
        maxAge: 420000,
        keys: {
          useQueryParams: true,
          useHeaders: ["accept-encoding"],
        },
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
                  useHeaders: ["accept-encoding"],
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
