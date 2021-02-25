// @ts-check

const _ = require("lodash");

const rejectAfterTimeout = (ms) =>
  new Promise((_, reject) => setTimeout(reject, ms));

const serialize = (data) => {
  return JSON.stringify({ data });
};

const deserialize = (str) => {
  if (!str) {
    return null;
  }
  return JSON.parse(str).data;
};

/**
 *
 * @param {any} strapi
 * @param {import('../index').MiddlewareCacheConfig} options
 * @param {import('../index').Logger} logger
 */
module.exports = (strapi, options, logger) => {
  const store = require(`./stores/${options.type}`)(strapi, options);

  return _.mapValues(
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
    (fn) => async (...args) => {
      try {
        if (!store.ready) {
          logger.warn("[Cache] The store is not ready");
          return null;
        }
        return await Promise.race([
          fn(...args),
          rejectAfterTimeout(options.cacheTimeout),
        ]);
      } catch (e) {
        if (e) {
          logger.warn("[Cache] There was an error with the store", e);
        } 
        logger.warn("[Cache] The cache request timed out");
        
        return null;
      }
    }
  );
};
