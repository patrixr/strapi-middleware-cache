/**
 * @typedef {import('strapi-middleware-cache').MiddlewareCacheConfig} MiddlewareCacheConfig
 * @typedef {import('strapi-middleware-cache').GetCacheConfigFn} GetCacheConfigFn
 * @typedef {import('strapi-middleware-cache').ModelCacheConfig} ModelCacheConfig
 * @typedef {import('strapi-middleware-cache').ModelCacheParams} ModelCacheParams
 */

/**
 * @param {MiddlewareCacheConfig} options
 * @return {GetCacheConfigFn}
 */
function createGetCacheConfig(options) {
  /**
   * Get related ModelCacheConfig
   *
   * @param {string} model
   * @param {string=} plugin
   * @return {ModelCacheConfig | undefined}
   */
  return function getCacheConfig(model, plugin) {
    return options.models.find((cacheConf) => {
      return cacheConf.model === model && cacheConf.plugin === plugin;
    });
  };
}

module.exports = createGetCacheConfig;
