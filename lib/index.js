const createCache   = require('./cache');
const Router        = require('koa-router');
const crypto        = require('crypto');
const _             = require('lodash');
const pluralize     = require('pluralize');
const semver        = require('semver');
const {
  getPermissionMiddlewares
} = require('./permissions')

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
const generateCacheKey = (model, ctx, headers) => {
  const { params, query = {} } = ctx;
  const { id } = params;

  const prefix = cacheKeyPrefix({ model, id })
  const querySuffix = Object.keys(query)
    .sort()
    .map((k) => `${k}=${JSON.stringify(query[k])}`)
    .join(",");
  const headersSuffix = headers
    .sort()
    .filter((k) => ctx.request.header[k.toLowerCase()] !== undefined)
    .map((k) => `${k}=${JSON.stringify(ctx.request.header[k.toLowerCase()])}`)
    .join(",");

  const suffix = `${querySuffix}${headersSuffix}`;
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
  const enableEtagSupport     = _.get(options, 'enableEtagSupport', false);
  const clearRelatedCache     = _.get(options, 'clearRelatedCache', false);
  const checkPermissions      = _.get(options, 'checkPermissions',  true);
  const defaultModelOptions   = { singleType: false, headers: [] };

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
       * @param {string} model The model used to find related caches to bust
       * @return {array} Array of related models
       */
      const getRelatedModels = (model) => {
        const models = Object.assign(strapi.models, strapi.plugins['users-permissions'].models);
        const components = strapi.components;
        const modelKey = _.findKey(models, { 'collectionName': model }) || model;
        const modelObj = models[modelKey];
        const attributes = _.get(modelObj, 'allAttributes', {});
        const relatedComponents = [];
        const relatedModels = {};

        // first, look for direct relations
        for (const key in attributes) {
          const attr = attributes[key];

          if (!attr.via) continue;

          if (attr.collection) {
            relatedModels[attr.collection] = models[attr.collection];
          } else if (attr.model && attr.model !== 'file') {
            relatedModels[attr.model] = models[attr.model];
          }
        }

        // second, look for relations to current model in components
        for (const compKey in components) {
          const compObj = components[compKey];
          const attributes = _.get(compObj, 'allAttributes', {});

          // look for the current model
          for (const key in attributes) {
            const attr = attributes[key];

            for (const key in attr) {
              const field = attr[key];

              if (key !== 'model') continue;

              if (field === modelKey) {
                relatedComponents.push(compKey);
              }
            }
          }

          // look one level deeper
          for (const key in attributes) {
            const attr = attributes[key];

            for (const key in attr) {
              const field = attr[key];

              if (key !== 'component' && key !== 'components') continue;

              if (!relatedModels.hasOwnProperty(modelKey) &&
                  (relatedComponents.includes(field) ||
                    (Array.isArray(field) && field.filter(x => relatedComponents.includes(x)).length))) {
                relatedComponents.push(compKey);
              }
            }
          }
        }

        // finally locate all the models that have the related components in their models
        for (const modelKey in models) {
          const modelObj = models[modelKey];
          const attributes = _.get(modelObj, 'allAttributes', {});

          for (const key in attributes) {
            const attr = attributes[key];

            for (const key in attr) {
              const field = attr[key];

              if (key !== 'component' && key !== 'components') continue;

              if (!relatedModels.hasOwnProperty(modelKey) &&
                  (relatedComponents.includes(field) ||
                    (Array.isArray(field) && field.filter(x => relatedComponents.includes(x)).length))) {
                relatedModels[modelKey] = models[modelKey];
              }
            }
          }
        }

        return relatedModels;
      }

      /**
       *
       * @param {Object} params
       * @param {string} params.model The model to bust the cache of
       * @param {string} [params.id] The (optional) ID we want to bust the cache for
       */
      const clearCache = async ({ model, id = null }) => {
        const keys     = await cache.keys() || [];
        const rexps    = [];

        if (!id) {
          rexps.push(new RegExp(`^/${model}`));        // Bust anything in relation to that model
        } else {
          rexps.push(new RegExp(`^/${model}/${id}`));  // Bust the record itself
          rexps.push(new RegExp(`^/${model}\\?`));     // Bust the collections, but not other individual records
        }

        if (clearRelatedCache) {
          const relatedModels = getRelatedModels(model);

          // prep related models to have their whole cache busted
          _.each(relatedModels, (relatedModel, key) => {
            const relatedModelSlug = relatedModel.kind === 'collectionType'
              ? relatedModel.collectionName
              : key;

            rexps.push(new RegExp(`^/${relatedModelSlug}`));  // Bust all entries from models that have relations with that model
          });
        }

        const shouldBust = key => _.find(rexps, r => r.test(key));
        const bust = key => cache.del(key);

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

        await clearCache({ model, id });
      }

      _.each(toCache, (cacheConf) => {
        const { model, maxAge = options.maxAge, headers = options.headers } = cacheConf;
        const endpoint = `/${model}/:id*`;

        info(`Caching route ${endpoint} [maxAge=${maxAge}]`);

        const permissionsMiddlewares = checkPermissions ? getPermissionMiddlewares('GET', `/${model}`) : []

        router.delete(endpoint, bust(model));
        router.post(endpoint, bust(model));
        router.put(endpoint, bust(model));
        router.get(endpoint, ...permissionsMiddlewares, async (ctx, next) => {
          const { cacheKey } = generateCacheKey(model, ctx, headers);

          const cacheEntry = await cache.get(cacheKey);

          if (enableEtagSupport) {
            const ifNoneMatch = ctx.request.headers['if-none-match'];
            const etagEntry = await cache.get(`${cacheKey}_etag`);
            const etagMatch = ifNoneMatch === etagEntry;

            if (!etagMatch) {
              ctx.set('ETag', etagEntry)
            } else {
              ctx.status = 304;
              return;
            }
          }

          if (cacheEntry) {
            ctx.status  = 200;
            ctx.body    = cacheEntry;
            return;
          }

          await next();

          if (ctx.body && ctx.status == 200) {
            await cache.set(cacheKey, ctx.body, maxAge);

            if (enableEtagSupport) {
              const etag = crypto.createHash('md5').update(JSON.stringify(ctx.body)).digest('hex');

              ctx.set('ETag', `"${etag}"`)

              await cache.set(`${cacheKey}_etag`, `"${etag}"`, maxAge);
            }
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

      if (semver.lt(process.version, '3.4.0')) {
        router.post('/content-manager/explorer/:scope',                 bustAdmin);
        router.post('/content-manager/explorer/:scope/publish/:id*',    bustAdmin);
        router.post('/content-manager/explorer/:scope/unpublish/:id*',  bustAdmin);
        router.put('/content-manager/explorer/:scope/:id*',             bustAdmin);
        router.delete('/content-manager/explorer/:scope/:id*',          bustAdmin);
      } else {
        ['collection-types', 'single-types'].forEach(type => {
          router.post(`/content-manager/${type}/:scope`,                 bustAdmin);
          router.post(`/content-manager/${type}/:scope/publish/:id*`,    bustAdmin);
          router.post(`/content-manager/${type}/:scope/unpublish/:id*`,  bustAdmin);
          router.put(`/content-manager/${type}/:scope/:id*`,             bustAdmin);
          router.delete(`/content-manager/${type}/:scope/:id*`,          bustAdmin);
        });
      }

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;
