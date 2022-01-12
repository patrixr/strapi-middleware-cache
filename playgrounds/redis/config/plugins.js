module.exports = {
  redis: {
    config: {
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
  "strapi-plugin-rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 100,
          connection: "default",
        },
      },
      strategy: {
        enableXCacheHeaders: true,
        clearRelatedCache: true,
        injectAdminMiddlewares: true,
        contentTypes: [
          "api::article.article",
          "api::category.category",
          "api::global.global",
          "api::homepage.homepage",
        ],
      },
    },
  },
};
