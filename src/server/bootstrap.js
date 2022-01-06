'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { resolveUserOptions } = require('./utils/config/resolveUserOptions');
const { createRouter } = require('./utils/middlewares/createRouter');

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  // resolve user configuration, check for missing or invalid options
  const cacheConfig = strapi.config.get('plugin.strapi-middleware-cache');
  const options = resolveUserOptions(strapi, cacheConfig);
  strapi.config.set('plugin.strapi-middleware-cache', options);

  // register cache middlewares to server
  const router = createRouter(strapi, options);
  strapi.server.use(router.routes());
};
