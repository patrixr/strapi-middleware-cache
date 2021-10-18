/**
 * @param {MiddlewareCacheConfig} options
 * @return {GetCacheConfigFn}
 */
function createGetCacheConfig(options) {
  /**
   * Get related ModelCacheConfig
   *
   * @param {ModelCacheConfig} model
   * @param {ModelCacheParams} plugin
   * @return {ModelCacheConfig}
   */
  return function getCacheConfig(model, plugin) {
    return options.models.find((cacheConf) => {
      return cacheConf.model === model && cacheConf.plugin === plugin;
    });
  };
}

module.exports = createGetCacheConfig;
