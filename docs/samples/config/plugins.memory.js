// file: /config/plugins.js

module.exports = {
  "strapi-plugin-rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: { max: 10, maxAge: 3600 },
      },
      strategy: {
        contentTypes: [
          // list of Content-Types UID to cache
          "api::category.category",
          "api::article.article",
          "api::global.global",
          "api::homepage.homepage",
        ],
      },
    },
  },
};
