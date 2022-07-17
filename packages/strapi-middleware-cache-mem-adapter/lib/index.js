/**
 * @typedef {import('strapi-middleware-cache').Logger} Logger
 * @typedef {import('strapi-middleware-cache').MiddlewareCacheConfig} MiddlewareCacheConfig
 * @typedef {import('strapi-middleware-cache').InternalCacheStore} InternalCacheStore
 */

const LRU = require('lru-cache');

/**
 * @param {MiddlewareCacheConfig} options
 * @return {InternalCacheStore}
 */
function createMemStore(options) {
  const cache = new LRU({ max: options.max, maxAge: options.maxAge });

  return {
    get: (key) => cache.get(key),
    set: (key, val, maxAge) => cache.set(key, val, maxAge),
    peek: (key) => cache.peek(key),
    del: (key) => cache.del(key),
    keys: () => cache.keys(),
    reset: () => cache.reset(),
    ready: true,
  };
}

module.exports = createMemStore;
