module.exports = {
  "strapi-plugin-rest-cache": {
    enabled: true,
    config: {
      enableXCacheHeaders: true,
      clearRelatedCache: true,
      contentTypes: [
        "api::article.article",
        "api::category.category",
        "api::global.global",
        "api::homepage.homepage",
      ],
    },
  },
};
