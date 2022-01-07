module.exports = ({ strapi }) => ({
  async index(ctx) {
    strapi.log.debug('Hello purge World!');

    // called by GET /hello
    ctx.body = 'Hello purge World!'; // we could also send a JSON
  },
});
