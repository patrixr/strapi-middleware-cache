/**
 * Generates a cache key for the current request
 *
 * @param {ModelCacheConfig} cacheConf
 * @param {KoaContext} ctx
 * @return {string}
 */
function generateCacheKey(cacheConf, ctx) {
  const querySuffix = Object.keys(ctx.query)
    .sort()
    .map((k) => `${k}=${ctx.query[k]}`) // query strings are key sensitive
    .join(',');
  const headersSuffix = cacheConf.headers
    .sort()
    .filter((k) => ctx.request.header[k.toLowerCase()] !== undefined)
    .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
    .join(',');

  return `${ctx.request.path}?${querySuffix}&${headersSuffix}`;
}

module.exports = generateCacheKey;
