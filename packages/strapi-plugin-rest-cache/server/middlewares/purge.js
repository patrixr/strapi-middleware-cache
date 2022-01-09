/**
 * @param {{ contentType: string }} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }} context
 */
module.exports = (options, { strapi }) => {
  if (!options.contentType) {
    throw new Error(
      'Unable to initialize purge cache middleware: options.contentType is required'
    );
  }

  const store = strapi.plugin('strapi-plugin-rest-cache').service('cacheStore');

  const cacheConf = strapi
    .plugin('strapi-plugin-rest-cache')
    .service('cacheConfig')
    .get(options.contentType);

  if (!cacheConf) {
    throw new Error(
      `Unable to initialize purge cache middleware: no configuration found for contentType "${options.contentType}"`
    );
  }

  return async (ctx, next) => {
    await next();

    if (!(ctx.status >= 200 && ctx.status <= 300)) return;

    await store.clearCache(options.contentType, ctx.params);
  };
};
