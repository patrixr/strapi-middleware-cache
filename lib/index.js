const createCache   = require('./cache');
const Router        = require('koa-router');
const _             = require('lodash');
const pluralize     = require('pluralize');

const PLUGIN_NAME = 'cache';

const cacheKeyPrefix = ({ model, id = null}) => {
  return id ? `/${model}/${id}` : `/${model}`;
}

/**
 * Generates a cache key for the current request
 *
 * @param {object} ctx
 * @returns
 */
const generateCacheKey = (model, ctx) => {
  const { params, query = {} } = ctx;
  const { id } = params;

  const prefix = cacheKeyPrefix({ model, id })
  const suffix = Object
    .keys(query)
    .sort()
    .map(k => `${k}=${JSON.stringify(query[k])}`)
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
  const options               = _.get(strapi, `config.middleware.settings.${PLUGIN_NAME}`, {});
  const type                  = _.get(options, 'type', 'mem');
  const allowLogs             = _.get(options, 'logs', true);
  const withKoaContext        = _.get(options, 'populateContext', false);
  const withStrapiMiddleware  = _.get(options, 'populateStrapiMiddleware', false);
  const defaultModelOptions   = { singleType: false };

  const info = (msg) => allowLogs && strapi.log.debug(`[Cache] ${msg}`);

  const toCache  = _.chain(options)
    .get('models', [])
    .map(model => _.isString(model) ? { model } : model)
    .map(cfg => ({ ...defaultModelOptions, ...cfg }))
    .map(cfg => ({
      ...cfg,
      model: cfg.singleType ? cfg.model : pluralize(cfg.model)
    }))
    .value();

  return {
    cache: null,

    initialize() {
      info('Mounting LRU cache middleware');
      info(`Storage engine: ${type}`);

      const router  = new Router();
      const cache   = createCache(strapi, type, options);

      this.cache = cache;

      // --- Helpers

      /**
       *
       * @param {Object} params
       * @param {string} params.model The model to bust the cache of
       * @param {string} [params.id] The (optional) ID we want to bust the cache for
       */
      const clearCache = async ({ model, id = null }) => {
        const keys     = await cache.keys() || [];
        const rexps    = []

        if (!id) {
          rexps.push(new RegExp(`^/${model}`))        // Bust anything in relation to that model
        } else {
          rexps.push(new RegExp(`^/${model}/${id}`))  // Bust the record itself
          rexps.push(new RegExp(`^/${model}\\?`))     // Bust the collections, but not other individual records
        }

        const shouldBust = key => _.find(rexps, r => r.test(key))
        const bust = key => cache.del(key)

        await Promise.all(
          _.filter(keys, shouldBust).map(bust)
        );
      }


      // --- Populate Koa Context with cache entry point

      if (withKoaContext) {
        strapi.app.use((ctx, next) => {
          _.set(ctx, 'middleware.cache', {
            bust:   clearCache,
            store:  cache
          })
          return next();
        });
      }

      // --- Populate Strapi Middleware with cache entry point

      if (withStrapiMiddleware) {
        _.set(strapi, 'middleware.cache', {
          bust:   clearCache, 
          store:  cache
        })
      }

      // --- Standard REST endpoints

      /**
       * Creates a Koa middleware that busts the cache of a given model
       *
       * @param {string} model
       */
      const bust = (model) => async (ctx, next) => {
        const { params } = ctx;
        const { id } = params;

        await next();

        if (!_.inRange(ctx.status, 200, 300)) return;

        await clearCache({ model, id })
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

      // --- Admin REST endpoints

      /**
       * Busts the cache on receiving a modification from the admin panel
       *
       * @param {Koa.BaseContext} ctx
       * @param {Function} next
       */
      const bustAdmin = async (ctx, next) => {
        const model = _.chain(ctx).get('params.scope').split('.').last().value();

        const cacheCfg = _.find(toCache, (cfg) => {
          return cfg.model === (cfg.singleType ? model : pluralize(model));
        });

        const isCached = !!cacheCfg;

        if (isCached) {
          await bust(cacheCfg.model)(ctx, next)
        } else {
          await next();
        }
      };

      router.post('/content-manager/explorer/:scope',                 bustAdmin);
      router.post('/content-manager/explorer/:scope/publish/:id*',    bustAdmin);
      router.post('/content-manager/explorer/:scope/unpublish/:id*',  bustAdmin);
      router.put('/content-manager/explorer/:scope/:id*',             bustAdmin);
      router.delete('/content-manager/explorer/:scope/:id*',          bustAdmin);

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;
