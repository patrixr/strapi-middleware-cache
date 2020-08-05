const _ = require('lodash');

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

  const store = require(`./stores/${type}`)(strapi, opts);

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
      if (!await store.ready) {
        return null;
      }
      return await fn(...args);
    } catch(e) {
      strapi.log.warn('[Cache] There was an error with Redis', e);
      return null;
    }
  });
}