// @ts-check

const createStore = require('./cache');

const {
  createClearCache,
  createGetCacheConfig,
  createGetCacheConfigByUid,
  getRelatedModelsUid,
  createLogger,
  createPurge,
  createPurgeAdmin,
  createRecv,
  createRouter,
  resolveUserOptions,
  getCacheConfRegExp,
  getRouteRegExp,
} = require('./utils');

/**
 * Creates the caching middleware for strapi
 *
 * @param {any} strapi
 * @return {MiddlewareCache}
 */
const Cache = (strapi) => {
  /**
   * @type {UserMiddlewareCacheConfig}
   */
  const userOptions = strapi?.config?.middleware?.settings?.cache || {};
  const options = resolveUserOptions(userOptions);
  const logger = createLogger(options);
  const getCacheConfig = createGetCacheConfig(options);
  const getCacheConfigByUid = createGetCacheConfigByUid(getCacheConfig);

  return {
    store: null,

    initialize() {
      logger.info('Mounting LRU cache middleware');
      logger.info(`Storage engine: ${options.type}`);

      const store = createStore(options, logger);

      this.store = store;

      // --- REST cache middlewares
      const clearCache = createClearCache(store, options, getCacheConfigByUid);
      const purge = createPurge(clearCache);
      const purgeAdmin = createPurgeAdmin(clearCache, getCacheConfigByUid);
      const recv = createRecv(store, options, logger);

      // --- Populate Koa Context with cache entry point
      if (options.withKoaContext) {
        strapi.app.use((ctx, next) => {
          if (ctx.middleware) {
            ctx.middleware.cache = {
              store,
              options,
              clearCache,
              getCacheConfig,
              getCacheConfigByUid,
              getRelatedModelsUid,
              getCacheConfRegExp,
              getRouteRegExp,
            };
          }

          return next();
        });
      }

      // --- Populate Strapi Middleware with cache entry point
      if (options.withStrapiMiddleware) {
        strapi.middleware.cache = {
          store,
          options,
          clearCache,
          getCacheConfig,
          getCacheConfigByUid,
          getRelatedModelsUid,
          getCacheConfRegExp,
          getRouteRegExp,
        };
      }

      // --- Public REST endpoints
      const router = createRouter(options, logger, {
        purge,
        purgeAdmin,
        recv,
      });

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;
