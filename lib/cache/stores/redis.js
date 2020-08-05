const _         = require('lodash');
const Redis     = require('ioredis');
const lru       = require('redis-lru');
const { defer } = require('../../async');

module.exports = (strapi, opts = {}) => {
  const redisOpts = _.get(opts, 'redisConfig', {});
  const allowLogs = _.get(opts, 'logs', true);
  const prefix = (key) => `strapi-middleware-cache:${key}`;
  const unprefix = (key) => key.replace(/^strapi-middleware-cache:/, '')

  const deferred  = defer();
  const client    = new Redis(redisOpts);
  const cache     = lru(client, opts.max);

  client.once("ready", () => {
    if (allowLogs) {
      strapi.log.debug('[Cache] Redis connection established')
    }
    deferred.resolve(true)
  });

  client.once("error", (e) => {
    strapi.log.error(`[Cache] Redis connection failed`)
    strapi.log.error(e);
    deferred.resolve(false)
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
    ready: deferred.promise
  };
}