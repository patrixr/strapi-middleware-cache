/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const LRU = require('lru-cache');
const { serialize } = require('../utils/store/serialize');
const { deserialize } = require('../utils/store/deserialize');

// @todo: use cache provider instead of hard-coded LRU

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  const cache = new LRU({ max: 10, maxAge: 3600 });

  const cacheConfigService = strapi
    .plugin('strapi-middleware-cache')
    .service('cacheConfig');

  return {
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

    async clearCache(uid, params = {}) {
      const pluginOptions = strapi.config.get('plugin.strapi-middleware-cache');

      const cacheConf = cacheConfigService.get(uid);

      if (!cacheConf) {
        throw new Error(
          `Unable to clear cache: no configuration found for contentType "${uid}"`
        );
      }

      const keys = (await this.keys()) || [];
      const regExps = cacheConfigService.getCacheKeysRegexp(uid, params);

      if (pluginOptions.clearRelatedCache) {
        for (const relatedUid of cacheConf.relatedContentTypeUid) {
          if (cacheConfigService.isCached(relatedUid)) {
            // clear all cache because we can't predict uri params
            regExps.push(
              ...cacheConfigService.getCacheKeysRegexp(relatedUid, {}, true)
            );
          }
        }
      }

      /**
       * @param {string} key
       */
      const shouldDel = (key) => regExps.find((r) => r.test(key));

      /**
       * @param {string} key
       */
      const del = (key) => this.del(key);

      await Promise.all(keys.filter(shouldDel).map(del));
    },
  };
};
