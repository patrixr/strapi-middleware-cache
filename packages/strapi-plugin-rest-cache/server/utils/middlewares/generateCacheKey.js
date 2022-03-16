'use strict';

/**
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
  let headersSuffix = '';

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
      .map(
        (k) =>
          `${k}=${
            typeof ctx.query[k] === 'object'
              ? JSON.stringify(ctx.query[k])
              : ctx.query[k]
          }`
      ) // query strings are key sensitive
      .join(',');
  }

  if (cacheRouteConfig.keys.useHeaders.length > 0) {
    headersSuffix = cacheRouteConfig.keys.useHeaders
      .filter((k) => ctx.request.header[k] !== undefined)
      .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
      .join(',');
  }

  return `${querySuffix}&${headersSuffix}`;
}

module.exports = generateCacheKey;
