// @ts-check

const mapValues = require('lodash/mapValues');

const { serialize, deserialize, rejectAfterTimeout } = require('../utils');

/**
 * @param {MiddlewareCacheConfig} options
 * @param {Logger} logger
 * @return {CacheStore}
 */
function createStore(options, logger) {
  const store = require(`./stores/${options.type}`)(options, logger);

  return mapValues(
    {
      async get(key) {
        return deserialize(await store.get(key));
      },
      async set(key, val, maxAge = options.maxAge) {
        return await store.set(key, serialize(val), maxAge);
      },
      async peek(key) {
        return deserialize(await store.peek(key));
      },
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
      async (...args) => {
        try {
          if (!store.ready) {
            logger.warn('the store is not ready');
            return null;
          }
          return await Promise.race([
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
