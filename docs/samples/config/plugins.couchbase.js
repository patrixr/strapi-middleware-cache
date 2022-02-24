module.exports = {
  // Step 1: Configure the couchbase connection
  // @see https://github.com/davidepellegatta/node-cache-manager-couchbase
  couchbase: {
    connectionString: "couchbase://127.0.0.1:8091",
    connectionOptions: {
      username: "Administrator",
      password: "couchbase",
    },
    bucket: "test-bucket",
    ttl: 2,
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
