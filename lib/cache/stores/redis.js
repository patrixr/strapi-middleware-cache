const _         = require('lodash');
const Redis     = require('ioredis');
const lru       = require('redis-lru');

module.exports = (strapi, opts = {}) => {
  const redisOpts = _.get(opts, 'redisConfig', {});
  const allowLogs = _.get(opts, 'logs', true);
  const prefix = (key) => `strapi-middleware-cache:${key}`;
  const unprefix = (key) => key.replace(/^strapi-middleware-cache:/, '')

  const client    = new Redis(redisOpts);
  const cache     = lru(client, opts.max);
  let reconnected = false;

  client.on("ready", () => {
    if (allowLogs) {
      strapi.log.debug('[Cache] Redis connection established')
    }
    if (reconnected) {
      cache.reset();
    }
  });

  client.on("error", (e) => {
    strapi.log.error(`[Cache] Redis connection failed`)
    strapi.log.error(e);
  });

  client.on("reconnecting", (e) => {
    reconnected = true;
  });
  
  return  {
    get(key) {
      return cache.get(prefix(key));
    },
    set(key, val, maxAge) {
      return cache.set(prefix(key), val, maxAge);
    },
    peek(key) {
      return cache.peek(prefix(key));
    },
    del(key) {
      return cache.del(prefix(key));
    },
    async keys() {
      const keys = await cache.keys();
      return keys.map(unprefix);
    },
    reset() {
      return cache.reset();
    },
    get ready() {
      return client.status === 'ready';
    }
  };
}