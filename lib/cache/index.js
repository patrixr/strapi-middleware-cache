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
    }
  }, (fn) => async (...args) => {
    await store.ready;
    return await fn(...args);
  });
}