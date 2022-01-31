// file: /config/plugins.js

module.exports = {
  // Step 1: Configure the redis connection
  // @see https://github.com/derrickmehaffy/strapi-plugin-redis
  redis: {
    // ...
  },
  // Step 2: Configure the redis cache plugin
  "strapi-plugin-rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 32767,
          connection: "default",
        },
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
