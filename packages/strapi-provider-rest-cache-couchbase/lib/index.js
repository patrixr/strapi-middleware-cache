/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */
const { CouchbaseCacheProvider } = require("./CouchbaseCacheProvider");

module.exports = {
  provider: "couchbase",
  name: "Couchbase",

  async init(options, { strapi }) {
    if (
      options.connectionString == null ||
      options.connectionString === "undefined"
    ) {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". Missing 'connectionString'`
      );
    }
    if (
      options.connectionOptions == null ||
      options.connectionOptions === "undefined"
    ) {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". Missing 'connectionOptions'`
      );
    }
    if (
      options.connectionOptions.username == null ||
      options.connectionOptions.username === "undefined"
    ) {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". Missing 'connectionOptions.username'`
      );
    }
    if (
      options.connectionOptions.password == null ||
      options.connectionOptions.password === "undefined"
    ) {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". Missing 'connectionOptions.password'`
      );
    }
    if (options.bucket == null || options.bucket === "undefined") {
      throw new Error(
        `Could not initialize REST Cache provider "couchbase". Missing 'bucket'`
      );
    }

    const provider = new CouchbaseCacheProvider(options);

    strapi.log.info(
      `CouchbaseCacheProvider initialised with connectionString: "${options.connectionString}", bucket: "${options.bucket}", scope: "${options.scope}", collection: "${options.collection}",`
    );

    return provider;
  },
};
