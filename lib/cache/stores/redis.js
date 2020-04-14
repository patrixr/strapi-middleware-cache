const redis     = require('redis');
const lru       = require('redis-lru');
const { defer } = require('../../async');

module.exports = (strapi, opts = {}) => {
  const {
    max,
    maxAge,
    port = 6379,
    host = 'localhost'
  } = opts;

  const prefix = (key) => `strapi-middleware-cache:${key}`;

  const deferred  = defer();
  const client    = redis.createClient(port, host);
  const cache     = lru(client, max);

  client.once("ready", () => {
    strapi.log.info(`[Cache] Redis connection established (port: ${port}, host: ${host})`)
    deferred.resolve(true)
  });

  client.once("error", (e) => {
    strapi.log.error(`[Cache] Redis connection failed`)
    strapi.log.error(e);
    return deferred.reject(e)
  });

  const charSize  = Buffer.byteLength('c', 'utf8');
  const length    = (n, key) => n.length * charSize;

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
    keys() {
      return cache.keys();
    },
    ready: deferred.promise
  };
}