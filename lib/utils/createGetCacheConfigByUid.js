const resolveModelUidRegex = /^(application|plugins)::([^.]+).([a-z-]+)$/;

/**
 * Get related ModelCacheConfig with an uid
 *
 * uid:
 * - application::sport.sport
 * - plugins::users-permissions.user
 *
 * @param {{(model: string, plugin?: string): ModelCacheConfig | undefined}} getCacheConfig
 * @returns {{(uid: string): ModelCacheConfig | undefined}}
 */
function createGetCacheConfigByUid(getCacheConfig) {
  return function getCacheConfigByUid(uid) {
    const [, type, plugin, model] = resolveModelUidRegex.exec(uid) || [];

    if (
      typeof type !== 'string' ||
      typeof plugin !== 'string' ||
      typeof model !== 'string'
    ) {
      return;
    }

    return getCacheConfig(model, type === 'plugins' ? plugin : undefined);
  };
}

module.exports = createGetCacheConfigByUid;
