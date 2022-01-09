module.exports = {
  "strapi-plugin-rest-cache": {
    enabled: true,
    config: {
      provider: {
        name: "memory",
        options: { max: 10, maxAge: 3600 },
      },
      strategy: {
        enableXCacheHeaders: true,
        clearRelatedCache: true,
        injectAdminMiddlewares: false,
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
