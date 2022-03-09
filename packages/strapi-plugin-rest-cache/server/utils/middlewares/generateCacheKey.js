'use strict';

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
  let querySuffix = '';

  if (cacheRouteConfig.keys.useQueryParams !== false) {
    let keys = [];

    if (cacheRouteConfig.keys.useQueryParams === true) {
      keys = Object.keys(ctx.query);
    } else if (cacheRouteConfig.keys.useQueryParams.length > 0) {
      keys = Object.keys(ctx.query).filter((key) =>
        cacheRouteConfig.keys.useQueryParams.includes(key)
      );
    }

    querySuffix = keys
      .sort()
      .map((k) => `${k}=${JSON.stringify(ctx.query[k])}`) // query strings are key sensitive
      .join(',');
  }

  const headersSuffix = [...cacheRouteConfig.keys.useHeaders]
    .sort()
    .filter((k) => ctx.request.header[k.toLowerCase()] !== undefined)
    .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
    .join(',');

  return `${querySuffix}&${headersSuffix}`;
}

module.exports = generateCacheKey;
