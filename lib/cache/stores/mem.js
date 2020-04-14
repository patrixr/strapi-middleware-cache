const LRU     = require("lru-cache");

module.exports = (strapi, opts = {}) => {
  const cache = new LRU({ max: opts.max, maxAge: opts.maxAge });

  return  {
    get: (key) => cache.get(key),
    set: (key, val, maxAge) => cache.set(key, val, maxAge),
    peek: (key) => cache.peek(key),
    del: (key) => cache.del(key),
    keys: () => cache.keys(),
    reset: () => cache.reset(),
    ready: true
  };
}