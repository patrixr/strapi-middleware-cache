'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { getRouteRegExp } = require('../utils/config/getRouteRegExp');

/**
 * @param {{ strapi: Strapi }} strapi
 */

function createCacheConfigService({ strapi }) {
  return {
    /**
     * Get all uid of cached contentTypes
     *
     * uid:
     * - api::sport.sport
     * - plugin::users-permissions.user
     *
     * @return {string[]}
     */
    getUids() {
      const { strategy } = strapi.config.get('plugin.rest-cache');
      return strategy.contentTypes.map((cacheConf) => cacheConf.contentType);
    },

    /**
     * Return the intersection of cached contentTypes and the related contentTypes of a given contentType uid
     *
     * uid:
     * - api::sport.sport
     * - plugin::users-permissions.user
     *
     * @return {string[]}
     */
    getRelatedCachedUid(uid) {
      const cacheConf = this.get(uid);
      if (!cacheConf) {
        return [];
      }

      const cached = this.getUids();
      const related = cacheConf.relatedContentTypeUid;

      return related.filter((relatedUid) => cached.includes(relatedUid));
    },

    /**
     * Get related ModelCacheConfig with an uid
     *
     * uid:
     * - api::sport.sport
     * - plugin::users-permissions.user
     *
     * @param {string} uid
     * @return {CacheContentTypeConfig | undefined}
     */
    get(uid) {
      const { strategy } = strapi.config.get('plugin.rest-cache');
      return strategy.contentTypes.find(
        (cacheConf) => cacheConf.contentType === uid
      );
    },

    /**
     * Get regexs to match all ModelCacheConfig keys with given params
     *
     * @param {string} uid
     * @param {any} params
     * @param {boolean=} wildcard
     * @return {RegExp[]}
     */
    getCacheKeysRegexp(uid, params, wildcard = false) {
      const cacheConf = this.get(uid);
      if (!cacheConf) {
        return [];
      }

      const regExps = [];

      const routes = cacheConf.routes.filter((route) => route.method === 'GET');

      for (const route of routes) {
        regExps.push(...getRouteRegExp(route, params, wildcard));
      }

      return regExps;
    },

    /**
     * Check if a cache configuration exists for a contentType uid
     *
     * uid:
     * - api::sport.sport
     * - plugin::users-permissions.user
     *
     * @param {string} uid
     * @return {boolean}
     */
    isCached(uid) {
      return !!this.get(uid);
    },

    /**
     * @deprecated use strapi.plugin('rest-cache').service('cacheStore').clearByUid instead
     */
    async clearCache(uid, params = {}, wildcard = false) {
      strapi.log.warn(
        'REST Cache cacheConfig.clearCache is deprecated, use cacheStore.clearByUid instead'
      );
      strapi
        .plugin('rest-cache')
        .service('cacheStore')
        .clearByUid(uid, params, wildcard);
    },
  };
}

module.exports = { createCacheConfigService };
