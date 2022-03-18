'use strict';

/**
 * @param {{ contentType: string }} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }} context
 */

function createPurge(options, { strapi }) {
  if (!options.contentType) {
    throw new Error(
      'REST Cache: unable to initialize purge middleware: options.contentType is required'
    );
  }

  const cacheConf = strapi.plugin('rest-cache').service('cacheConfig');
  const cacheStore = strapi.plugin('rest-cache').service('cacheStore');

  if (!cacheConf.isCached(options.contentType)) {
    throw new Error(
      `REST Cache: unable to initialize purge middleware: no configuration found for contentType "${options.contentType}"`
    );
  }

  return async function purge(ctx, next) {
    await next();

    if (!(ctx.status >= 200 && ctx.status <= 300)) return;

    await cacheStore.clearByUid(options.contentType, ctx.params);
  };
}

module.exports = {
  createPurge,
};
