const _ = require('lodash');

const rejectAfterTimeout = (ms) => new Promise((_, reject) => setTimeout(reject, ms));

const serialize = (data) => {
  return JSON.stringify({ data });
}

const deserialize = (str) => {
  if (!str) {
    return null;
  }
  return JSON.parse(str).data;
}

module.exports = (strapi, type = 'mem', opts = {}) => {

  opts.max = opts.max || 500;
  opts.maxAge = opts.maxAge || 60 * 60 * 1000;
  const allowLogs = _.get(opts, 'logs', true);
  const { cacheTimeout = 500, ...storeOpts } = opts;

  const store = require(`./stores/${type}`)(strapi, storeOpts);

  return _.mapValues({
    async get(key) {
      return deserialize(await store.get(key));
    },
    async set(key, val, maxAge = opts.maxAge) {
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
    }
  }, (fn) => async (...args) => {
    try {
      if (!store.ready) {
        if (allowLogs) {
          strapi.log.warn('[Cache] The store is not ready');
        }
        return null;
      }
      return await Promise.race([
        fn(...args),
        rejectAfterTimeout(cacheTimeout)
      ]);
    } catch(e) {
      if (e && allowLogs) {
        strapi.log.warn('[Cache] There was an error with the store', e);
      } else if (allowLogs) {
        strapi.log.warn('[Cache] The cache request timed out');
      }
      return null;
    }
  });
};
