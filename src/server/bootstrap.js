/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { resolveUserOptions } = require('./utils/config/resolveUserOptions');
const { createRouter } = require('./utils/middlewares/createRouter');

const permissionsActions = require('./permissions-actions');

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = async ({ strapi }) => {
  // resolve user configuration, check for missing or invalid options
  const cacheConfig = strapi.config.get('plugin.strapi-middleware-cache');
  const options = resolveUserOptions(strapi, cacheConfig);
  strapi.config.set('plugin.strapi-middleware-cache', options);

  // boostrap plugin permissions
  await strapi.admin.services.permission.actionProvider.registerMany(
    permissionsActions.actions
  );

  // boostrap cache middlewares
  const router = createRouter(strapi, options);
  strapi.server.use(router.routes());
};
