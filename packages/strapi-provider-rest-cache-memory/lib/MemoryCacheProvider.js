/* eslint-disable class-methods-use-this */
const cacheManager = require("cache-manager");
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class MemoryCacheProvider extends CacheProvider {
  constructor(options) {
    super();
    this.cache = cacheManager.caching({ store: "memory", ...options });
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

  async keys() {
    return this.cache.keys();
  }

  get ready() {
    return true;
  }
}

module.exports = {
  MemoryCacheProvider,
};
