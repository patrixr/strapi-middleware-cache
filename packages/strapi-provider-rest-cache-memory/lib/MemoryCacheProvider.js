const LRU = require("lru-cache");
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class MemoryCacheProvider extends CacheProvider {
  constructor(options = { max: 10, maxAge: 3600 }) {
    super();
    this.cache = new LRU(options);
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
}

module.exports = {
  MemoryCacheProvider,
};
