/**
 * @typedef {import('strapi-middleware-cache').GetCacheConfigFn} GetCacheConfigFn
 * @typedef {import('strapi-middleware-cache').GetCacheConfigByUidFn} GetCacheConfigByUidFn
 * @typedef {import('strapi-middleware-cache').ModelCacheConfig} ModelCacheConfig
 */

const resolveModelUidRegex = /^(application|plugins)::([^.]+).([a-z-]+)$/;

/**
 * @param {GetCacheConfigFn} getCacheConfig
 * @return {GetCacheConfigByUidFn}
 */
function createGetCacheConfigByUid(getCacheConfig) {
  /**
   * Get related ModelCacheConfig with an uid
   *
   * uid:
   * - application::sport.sport
   * - plugins::users-permissions.user
   *
   * @param {string} uid
   * @return {ModelCacheConfig | undefined}
   */
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
