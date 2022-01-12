// file: /config/plugins.js

module.exports = {
  // Step 1: Configure the redis connection
  // @see https://github.com/derrickmehaffy/strapi-plugin-redis
  redis: {
    // ...
  },
  // Step 2: Configure the redis cache plugin
  "rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 100,
          connection: "default",
        },
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
