/**
 * @param {{(uid: string): ModelCacheConfig | undefined}} getCacheConfigByUid
 * @param {{(cacheConf: ModelCacheConfig, params?: {[key: string]: string;} ): Promise<void>}} clearCache
 * @returns {KoaRouteMiddleware}
 */
function createPurgeAdmin(getCacheConfigByUid, clearCache) {
  /**
   * Busts the cache on receiving a modification from the admin panel
   */
  return async function purgeAdmin(ctx, next) {
    // uid:
    // - application::sport.sport
    // - plugins::users-permissions.user
    const { model: uid, ...params } = ctx.params;

    if (!uid) {
      await next();
      return;
    }

    const cacheConf = getCacheConfigByUid(uid);

    const isCached = !!cacheConf;

    if (!isCached) {
      await next();
      return;
    }

    await next();

    if (!(ctx.status >= 200 && ctx.status <= 300)) return;

    await clearCache(cacheConf, params);
  };
}

module.exports = createPurgeAdmin;
