// @ts-check

const Redis = require('ioredis');
const lru = require('redis-lru');

/**
 * @param {MiddlewareCacheConfig} options
 * @param {Logger} logger
 * @return {InternalCacheStore}
 */
function createRedisStore(options, logger) {
  const prefix = (key) => `strapi-middleware-cache:${key}`;
  const unprefix = (key) => key.replace(/^strapi-middleware-cache:/, '');

  const client = new Redis(options.redisConfig);
  const cache = lru(client, options.max);
  let reconnected = false;

  client.on('ready', () => {
    logger.debug('redis connection established');

    if (reconnected) {
      cache.reset();
    }
  });

  client.on('error', (error) => {
    logger.error(`redis connection failed`, error);
  });

  client.on('reconnecting', (e) => {
    reconnected = true;
  });

  return {
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
    },
  };
}

module.exports = createRedisStore;
