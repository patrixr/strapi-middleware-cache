"use strict";

module.exports = {
  redis: {
    config: {
      debug: true,
      connections: {
        default: {
          connection: {
            host: "127.0.0.1",
            port: 6379,
            db: 0,
          },
          settings: {
            debug: false,
            cluster: false,
          },
        },
      },
      redlock: {
        enabled: true,
        databases: ["default"],
        options: {
          driftFactor: 0.01,
          retryCount: 10,
          retryDelay: 200,
          retryJitter: 200,
          automaticExtensionThreshold: 500,
        },
      },
    },
  },
  "rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 32767,
          connection: "default",
        },
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
                path: "/api/categories/slug/:slug",
                keys: {
                  useQueryParams: false,
                  useHeaders: ["accept-encoding", "authorization"],
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
