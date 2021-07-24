/**
 * @param {ClearCacheFn} clearCache
 * @param {GetCacheConfigByUidFn} getCacheConfigByUid
 * @return {PurgeAdminFn}
 */
function createPurgeAdmin(clearCache, getCacheConfigByUid) {
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
