/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 * @typedef {import('koa').Context} Context
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => ({
  /**
   * @param {Context} ctx
   */
  async index(ctx) {
    const { contentType, params } = ctx.request.body;

    if (!contentType) {
      ctx.badRequest('contentType is required');
      return;
    }

    const cacheConfigService = strapi
      .plugin('strapi-plugin-rest-cache')
      .service('cacheConfig');

    if (!cacheConfigService.isCached(contentType)) {
      ctx.badRequest('contentType is not cached', { contentType });
      return;
    }

    const store = strapi
      .plugin('strapi-plugin-rest-cache')
      .service('cacheStore');

    await store.clearCache(contentType, params);

    // send no-content status
    ctx.status = 204;
  },
});
