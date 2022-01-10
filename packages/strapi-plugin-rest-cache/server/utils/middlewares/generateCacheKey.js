/**
 * @typedef {import('../../types').CacheRouteConfig} CacheRouteConfig
 * @typedef {import('koa').Context} Context
 */

/**
 * Generates a cache key for the current request
 *
 * @param {CacheRouteConfig} cacheRouteConfig
 * @param {Context} ctx
 * @return {string}
 */
function generateCacheKey(cacheRouteConfig, ctx) {
  const querySuffix = Object.keys(ctx.query)
    .sort()
    .map((k) => `${k}=${JSON.stringify(ctx.query[k])}`) // query strings are key sensitive
    .join(',');
  const headersSuffix = cacheRouteConfig.headers
    .sort()
    .filter((k) => ctx.request.header[k.toLowerCase()] !== undefined)
    .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
    .join(',');

  return `${querySuffix}&${headersSuffix}`;
}

module.exports = generateCacheKey;
