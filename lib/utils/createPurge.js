/**
 * @param {{(cacheConf: ModelCacheConfig, params?: {[key: string]: string;} ): Promise<void>}} clearCache
 */
function createPurge(clearCache) {
  /**
   * Creates a Koa middleware that busts the cache of a given model
   *
   * @param {ModelCacheConfig} cacheConf
   * @returns {KoaRouteMiddleware}
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
