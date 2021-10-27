const getRouteRegExp = require('./getRouteRegExp');

/**
 * @typedef {import('strapi-middleware-cache').ModelCacheConfig} ModelCacheConfig
 * @typedef {import('strapi-middleware-cache').ModelCacheParams} ModelCacheParams
 */

/**
 * Get regexs to match all ModelCacheConfig keys with given params
 *
 * @param {ModelCacheConfig} cacheConf
 * @param {ModelCacheParams} params
 * @param {boolean=} wildcard
 * @return {RegExp[]}
 */
function getCacheConfRegExp(cacheConf, params, wildcard = false) {
  const regExps = [];

  const routes = cacheConf.routes.filter((route) => {
    return route.method === 'GET';
  });

  for (const route of routes) {
    regExps.push(...getRouteRegExp(route, params, wildcard));
  }

  return regExps;
}

module.exports = getCacheConfRegExp;
