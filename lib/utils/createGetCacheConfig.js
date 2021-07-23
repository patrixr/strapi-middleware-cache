/**
 * Get related ModelCacheConfig
 *
 * @param {MiddlewareCacheConfig} options
 * @returns {{(model: string, plugin?: string): ModelCacheConfig | undefined}}
 */
function createGetCacheConfig(options) {
  return function getCacheConfig(model, plugin) {
    return options.models.find((cacheConf) => {
      return cacheConf.model === model && cacheConf.plugin === plugin;
    });
  };
}

module.exports = createGetCacheConfig;
