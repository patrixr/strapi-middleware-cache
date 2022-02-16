/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */
const { CouchbaseCacheProvider } = require("./CouchbaseCacheProvider");

module.exports = {
  provider: "couchbase",
  name: "Couchbase",

  async init(options, { strapi }) {
    if (!strapi.couchbase) {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". The package "strapi-plugin-couchbase" is required.`
      );
    }

    return new CouchbaseCacheProvider(options);
  },
};
