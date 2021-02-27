// @ts-check

const LRU = require("lru-cache");

/**
 *
 * @param {any} strapi
 * @param {import('../../index').MiddlewareCacheConfig} options
 * @param {import('../../index').Logger} logger
 */
module.exports = (strapi, options, logger) => {
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
};
