/**
 * @typedef {import('strapi-middleware-cache').CacheStore} CacheStore
 * @typedef {import('strapi-middleware-cache').MiddlewareCacheConfig} MiddlewareCacheConfig
 * @typedef {import('strapi-middleware-cache').GetCacheConfigByUidFn} GetCacheConfigByUidFn
 * @typedef {import('strapi-middleware-cache').ClearCacheFn} ClearCacheFn
 * @typedef {import('strapi-middleware-cache').ModelCacheConfig} ModelCacheConfig
 * @typedef {import('strapi-middleware-cache').ModelCacheParams} ModelCacheParams
 */

const getCacheConfRegExp = require('./getCacheConfRegExp');
const getRelatedModelsUid = require('./getRelatedModelsUid');

/**
 * @param {CacheStore} store
 * @param {MiddlewareCacheConfig} options
 * @param {GetCacheConfigByUidFn} getCacheConfigByUid
 * @return {ClearCacheFn}
 */
function createClearCache(store, options, getCacheConfigByUid) {
  /**
   * Clear cache with uri parameters
   *
   * @param {ModelCacheConfig} cacheConf
   * @param {ModelCacheParams} params
   * @return {Promise<void>}
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

    /**
     * @param {string} key
     */
    const shouldDel = (key) => regExps.find((r) => r.test(key));

    /**
     * @param {string} key
     */
    const del = (key) => store.del(key);

    await Promise.all(keys.filter(shouldDel).map(del));
  };
}

module.exports = createClearCache;
