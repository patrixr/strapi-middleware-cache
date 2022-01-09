const lru = require("redis-lru");
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class RedisCacheProvider extends CacheProvider {
  constructor(
    client,
    options = { max: 10, namespace: "strapi-plugin-rest-cache" }
  ) {
    super();
    this.client = client;
    this.cache = lru(client, options);
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
    return this.cache.set(key, val, maxAge);
  }

  /**
   * @param {string} key
   */
  async peek(key) {
    return this.cache.peek(key);
  }

  /**
   * @param {string} key
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
    return this.client.status === "ready";
  }
}

module.exports = {
  RedisCacheProvider,
};
