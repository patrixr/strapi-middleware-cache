'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 * @typedef {import('koa').Context} Context
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
function createConfigController({ strapi }) {
  return {
    /**
     * @param {Context} ctx
     */
    async strategy(ctx) {
      const { strategy } = strapi.config.get('plugin.rest-cache');
      ctx.body = { strategy };
    },
    /**
     * @param {Context} ctx
     */
    async provider(ctx) {
      const { provider } = strapi.config.get('plugin.rest-cache');
      ctx.body = { provider };
    },
  };
}
module.exports = {
  createConfigController,
};
