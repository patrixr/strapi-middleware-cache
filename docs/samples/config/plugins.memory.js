// file: /config/plugins.js

module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: { max: 10, maxAge: 3600 },
      },
      strategy: {
        contentTypes: [
          "api::category.category",
          "api::article.article",
          "api::global.global",
          "api::homepage.homepage",
        ],
      },
    },
  },
};
