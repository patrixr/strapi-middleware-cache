'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 * @typedef {import('koa').Context} Context
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
function createPurgeController({ strapi }) {
  return {
    /**
     * @param {Context} ctx
     */
    async index(ctx) {
      const { contentType, params, wildcard } = ctx.request.body;

      if (!contentType) {
        ctx.badRequest('contentType is required');
        return;
      }

      const cacheConfigService = strapi
        .plugin('rest-cache')
        .service('cacheConfig');

      const cacheStoreService = strapi
        .plugin('rest-cache')
        .service('cacheStore');

      if (!cacheConfigService.isCached(contentType)) {
        ctx.badRequest('contentType is not cached', { contentType });
        return;
      }

      await cacheStoreService.clearByUid(contentType, params, wildcard);

      // send no-content status
      // ctx.status = 204;
      ctx.body = {};
    },
  };
}

module.exports = {
  createPurgeController,
};
