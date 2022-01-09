/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { serialize } = require('../utils/store/serialize');
const { deserialize } = require('../utils/store/deserialize');

// @todo: use cache provider instead of hard-coded LRU

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = () => {
  let cache;

  return {
    /**
     * @param {string} key
     */
    async init(provider) {
      cache = provider;
    },

    /**
     * @param {string} key
     */
    async get(key) {
      return deserialize(await cache.get(key));
    },

    /**
     * @param {string} key
     * @param {any} val
     * @param {number=} maxAge
     */
    async set(key, val, maxAge = 3600) {
      return cache.set(key, serialize(val), maxAge);
    },

    /**
     * @param {string} key
     */
    async peek(key) {
      return deserialize(await cache.peek(key));
    },

    /**
     * @param {string} key
     */
    async del(key) {
      return cache.del(key);
    },

    async keys() {
      return cache.keys();
    },

    async reset() {
      return cache.reset();
    },
  };
};
