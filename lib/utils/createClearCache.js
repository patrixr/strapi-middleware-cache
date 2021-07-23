const getCacheConfRegExp = require('./getCacheConfRegExp');
const getRelatedModelsUid = require('./getRelatedModelsUid');

/**
 * @param {CacheStore} store
 * @param {MiddlewareCacheConfig} options
 * @param {{(uid: string): ModelCacheConfig | undefined}} getCacheConfigByUid
 * @returns {{(cacheConf: ModelCacheConfig, params?: {[key: string]: string;} ): Promise<void>}}
 */
function createClearCache(store, options, getCacheConfigByUid) {
  /**
   * Clear cache with uri parameters
   */
  return async function clearCache(cacheConf, params = {}) {
    const keys = (await store.keys()) || [];
    const regExps = getCacheConfRegExp(cacheConf, params);

    if (options.clearRelatedCache) {
      const relatedModelsUid = getRelatedModelsUid(cacheConf);

      for (const uid of relatedModelsUid) {
        const relatedCacheConf = getCacheConfigByUid(uid);

        if (relatedCacheConf) {
          // clear all cache because we can't predict uri params
          regExps.push(...getCacheConfRegExp(relatedCacheConf, {}, true));
        }
      }
    }

    const shouldDel = (key) => regExps.find((r) => r.test(key));
    const del = (key) => store.del(key);

    await Promise.all(keys.filter(shouldDel).map(del));
  };
}

module.exports = createClearCache;
