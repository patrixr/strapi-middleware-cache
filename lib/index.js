const createCache   = require('./cache');
const Router        = require('koa-router');
const _             = require('lodash');

const PLUGIN_NAME = 'cache';

/**
 * Generates a cache key for the current request
 *
 * @param {object} ctx
 * @returns
 */
const generateCacheKey = (model, ctx) => {
  const { params, query = {} } = ctx;
  const { id } = params;

  const prefix = params.id ? `/${model}/${id}` : `/${model}`;
  const suffix = Object
    .keys(query)
    .sort()
    .map(k => `${k}=${query[k]}`)
    .join(',');
  const cacheKey = `${prefix}?${suffix}`;

  return { prefix, suffix, cacheKey };
};

/**
 * Creates the caching middleware for strapi
 *
 * @param {Strapi} strapi
 */
const Cache = (strapi) => {
  const options = _.get(strapi, `config.middleware.settings.${PLUGIN_NAME}`, {});
  const type    = _.get(options, 'type', 'mem');

  const info = (msg) => strapi.log.info(`[Cache] ${msg}`)

  const toCache  = _.chain(options)
    .get('models', [])
    .map(model => _.isString(model) ? { model } : model)
    .value();

  return {
    initialize() {
      info('Mounting LRU cache middleware');
      info(`Storage engine: ${type}`);

      const router  = new Router();
      const cache   = createCache(strapi, type, options);


      /**
       * Creates a Koa middleware that busts the cache of a given model
       *
       * @param {string} model
       */
      const bust = (model) => async (ctx, next) => {
        const pattern     = new RegExp(`^/${model}`);
        const keys        = await cache.keys();

        await next();

        if (!_.inRange(ctx.status, 200, 300)) return;

        for (let key of keys) {
          if (pattern.test(key)) {
            cache.del(key);
          }
        }
      }

      _.each(toCache, (cacheConf) => {
        const { model, maxAge = options.maxAge } = cacheConf;
        const endpoint = `/${model}/:id*`;

        info(`Caching route ${endpoint} [maxAge=${maxAge}]`);

        router.delete(endpoint, bust(model));
        router.post(endpoint, bust(model));
        router.put(endpoint, bust(model));
        router.get(endpoint, async (ctx, next) => {
          const { cacheKey } = generateCacheKey(model, ctx);

          const cacheEntry = await cache.get(cacheKey);

          if (cacheEntry) {
            ctx.status  = 200;
            ctx.body    = cacheEntry;
            return;
          }

          await next();

          if (ctx.body && ctx.status == 200) {
            await cache.set(cacheKey, ctx.body, maxAge);
          }
        });
      });

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;