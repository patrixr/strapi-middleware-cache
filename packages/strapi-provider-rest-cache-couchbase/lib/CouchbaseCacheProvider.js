"use strict";

const cacheManager = require("cache-manager");
const couchbaseStore = require("cache-manager-couchbase");
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class CouchbaseCacheProvider extends CacheProvider {
  constructor(options) {
    super();
    this.cache = cacheManager.caching({
      store: couchbaseStore,
      ...options,
    });
  }

  /**
   * @param {string} key
   */
  async get(key) {
    return this.cache.get(key);
  }

  /**
   * @param {string} key
   * @param {any} val
   * @param {number=} maxAge
   */
  async set(key, val, maxAge = 3600) {
    const options = {
      ttl: maxAge / 1000,
    };
    return this.cache.set(key, val, options);
  }

  /**
   * @param {string|string[]} key
   */
  async del(key) {
    return this.cache.del(key);
  }

  async keys(prefix = "") {
    return this.cache.keys(`${prefix}.*`);
  }

  get ready() {
    return this.cache.store.getClient() != null;
  }
}

module.exports = {
  CouchbaseCacheProvider,
};
