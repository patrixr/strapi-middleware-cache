"use strict";

module.exports = ({ env }) => ({
  "rest-cache": {
    enabled: env.bool("ENABLE_CACHE", true),
    config: {
      provider: {
        name: "memory",
        max: 32767,
      },
      // loads shared config (from /shared folder)
      strategy: require("./cache-strategy")({ env }),
    },
  },
});
