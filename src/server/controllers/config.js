/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => ({
  async index(ctx) {
    strapi.log.debug('Hello config World!');

    // called by GET /hello
    ctx.body = 'Hello config World!'; // we could also send a JSON
  },
});
