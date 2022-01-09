/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 * @typedef {import('../types').CacheProvider} CacheProvider
 */

const { serialize } = require('../utils/store/serialize');
const { deserialize } = require('../utils/store/deserialize');
const { withTimeout } = require('../utils/store/withTimeout');

// @todo: use cache provider instead of hard-coded LRU

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  /**
   * @type {CacheProvider}
   */
  let cache;
  let initialized = false;

  const pluginConfig = strapi.config.get('plugin.strapi-plugin-rest-cache');
  const { cacheTimeout } = pluginConfig.strategy;

  return {
    /**
     * @param {CacheProvider} provider
     */
    async init(provider) {
      cache = provider;
      initialized = true;
    },

    /**
     * @param {string} key
     */
    async get(key) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return withTimeout(
        async () => deserialize(await cache.get(key)),
        cacheTimeout
      ).catch((error) => {
        if (error?.message === 'timeout') {
          strapi.log.error(
            `REST Cache provider timed-out after ${cacheTimeout}ms.`
          );
        } else {
          strapi.log.error(`REST Cache provider errored:`);
          strapi.log.error(error);
        }
      });
    },

    /**
     * @param {string} key
     * @param {any} val
     * @param {number=} maxAge
     */
    async set(key, val, maxAge = 3600) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return cache.set(key, serialize(val), maxAge);
    },

    /**
     * @param {string} key
     */
    async peek(key) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return deserialize(await cache.peek(key));
    },

    /**
     * @param {string} key
     */
    async del(key) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return cache.del(key);
    },

    async keys() {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return cache.keys();
    },

    async reset() {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      return cache.reset();
    },
  };
};
