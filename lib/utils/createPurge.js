/**
 * @typedef {import('strapi-middleware-cache').ClearCacheFn} ClearCacheFn
 * @typedef {import('strapi-middleware-cache').PurgeFn} PurgeFn
 * @typedef {import('strapi-middleware-cache').ModelCacheConfig} ModelCacheConfig
 * @typedef {import('koa').Middleware} Middleware
 */

/**
 * @param {ClearCacheFn} clearCache
 * @return {PurgeFn}
 */
function createPurge(clearCache) {
  /**
   * Creates a Koa middleware that busts the cache of a given model
   *
   * @param {ModelCacheConfig} cacheConf
   * @return {Middleware}
   */
  return function purge(cacheConf) {
    return async function purgeMiddleware(ctx, next) {
      await next();

      if (!(ctx.status >= 200 && ctx.status <= 300)) return;

      await clearCache(cacheConf, ctx.params);
    };
  };
}

module.exports = createPurge;
