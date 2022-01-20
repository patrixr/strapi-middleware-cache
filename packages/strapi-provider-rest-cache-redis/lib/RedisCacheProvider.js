const cacheManager = require("cache-manager");
const redisStore = require("cache-manager-ioredis");
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class RedisCacheProvider extends CacheProvider {
  constructor(client, options) {
    super();
    this.client = client;
    this.cache = cacheManager.caching({
      store: redisStore,
      redisInstance: client,
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

  async keys() {
    return this.cache.keys();
  }

  async reset() {
    return this.cache.reset();
  }

  get ready() {
    const client = this.cache.store.getClient();
    return client.status === "ready";
  }
}

module.exports = {
  RedisCacheProvider,
};
