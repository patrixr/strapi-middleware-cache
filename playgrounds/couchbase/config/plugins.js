"use strict";

module.exports = ({ env }) => ({
  "rest-cache": {
    enabled: env.bool("ENABLE_CACHE", true),
    config: {
      provider: {
        name: "couchbase",
        max: 32767,
        options: {
          connectionString: "couchbase://127.0.0.1:8091",
          connectionOptions: {
            username: "Administrator",
            password: "Administrator",
          },
          bucket: "testbucket",
          ttl: 2,
        },
      },

      // loads shared config (from /shared folder)
      strategy: require("./cache-strategy")({ env }),
    },
  },
});
