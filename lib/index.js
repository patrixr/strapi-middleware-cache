const createCache   = require('./cache');
const Router        = require('koa-router');
const _             = require('lodash');
const pluralize     = require('pluralize');

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
  const options   = _.get(strapi, `config.middleware.settings.${PLUGIN_NAME}`, {});
  const type      = _.get(options, 'type', 'mem');
  const allowLogs = _.get(options, 'logs', true);

  const info = (msg) => allowLogs && strapi.log.debug(`[Cache] ${msg}`)

  const toCache  = _.chain(options)
    .get('models', [])
    .map(model => _.isString(model) ? { model } : model)
    .value();

  return {
    cache: null,

    initialize() {
      info('Mounting LRU cache middleware');
      info(`Storage engine: ${type}`);

      const router  = new Router();
      const cache   = createCache(strapi, type, options);

      this.cache = cache;

      // --- Standard REST endpoints

      /**
       * Creates a Koa middleware that busts the cache of a given model
       *
       * @param {string} model
       */
      const bust = (model) => async (ctx, next) => {
        const pattern     = new RegExp(`^/${pluralize(model)}`);
        const keys        = await cache.keys();

        await next();

        if (!_.inRange(ctx.status, 200, 300)) return;

        await Promise.all(
          _.filter(keys, k => pattern.test(k))
            .map(k => cache.del(k))
        );
      }

      _.each(toCache, (cacheConf) => {
        const { model, maxAge = options.maxAge } = cacheConf;
        const endpoint = `/${pluralize(model)}/:id*`;

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

      // --- Admin REST endpoints

      /**
       * Busts the cache on receiving a modification from the admin panel
       *
       * @param {Koa.BaseContext} ctx
       * @param {Function} next
       */
      const bustAdmin = async (ctx, next) => {
        const model = _.chain(ctx).get('params.scope').split('.').last().value();

        const isCached = _.find(toCache, ['model', pluralize(model)]);

        if (isCached) {
          await bust(model)(ctx, next)
        } else {
          await next();
        }
      };

      router.post('/content-manager/explorer/:scope', bustAdmin);
      router.put('/content-manager/explorer/:scope/:id*', bustAdmin);
      router.delete('/content-manager/explorer/:scope/:id*', bustAdmin);

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;