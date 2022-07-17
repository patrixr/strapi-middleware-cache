/**
 * @typedef {import('strapi-middleware-cache').CacheStore} CacheStore
 * @typedef {import('strapi-middleware-cache').MiddlewareCacheConfig} MiddlewareCacheConfig
 * @typedef {import('strapi-middleware-cache').Logger} Logger
 */

const mapValues = require('lodash/mapValues');

const { serialize, deserialize, rejectAfterTimeout } = require('../utils');

/**
 * @param {MiddlewareCacheConfig} options
 * @param {Logger} logger
 * @return {CacheStore}
 */
function createStore(options, logger) {
  const store = require(`strapi-middleware-cache-${options.type}-adapter`)(
    options,
    logger
  );

  return mapValues(
    {
      /**
       * @param {string} key
       */
      async get(key) {
        return deserialize(await store.get(key));
      },
      /**
       * @param {string} key
       * @param {any} val
       * @param {number=} maxAge
       */
      async set(key, val, maxAge = options.maxAge) {
        return await store.set(key, serialize(val), maxAge);
      },
      /**
       * @param {string} key
       */
      async peek(key) {
        return deserialize(await store.peek(key));
      },
      /**
       * @param {string} key
       */
      async del(key) {
        await store.del(key);
      },
      async keys() {
        return await store.keys();
      },
      async reset() {
        return await store.reset();
      },
    },
    (fn) =>
      /**
       * @param  {any[]} args
       */
      async (...args) => {
        try {
          if (!store.ready) {
            logger.warn('the store is not ready');
            return null;
          }
          return await Promise.race([
            // @ts-ignore
            fn(...args),
            rejectAfterTimeout(options.cacheTimeout),
          ]);
        } catch (e) {
          if (e) {
            logger.warn('there was an error with the store', e);
          }
          logger.warn('the cache request timed out');

          return null;
        }
      }
  );
}

module.exports = createStore;
