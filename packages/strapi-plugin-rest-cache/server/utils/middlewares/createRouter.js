const Router = require('koa-router');
// eslint-disable-next-line import/no-unresolved
const chalk = require('chalk');

/**
 * @typedef {import('../../types').CachePluginStrategy} CachePluginStrategy
 * @typedef {import('strapi-supercharged').Strapi} Strapi
 */

// @see https://github.com/strapi/strapi/blob/master/packages/core/content-manager/server/routes/admin.js
const adminRoutes = {
  post: [
    '/content-manager/single-types/:model/actions/publish',
    '/content-manager/single-types/:model/actions/unpublish',
    '/content-manager/collection-types/:model',
    '/content-manager/collection-types/:model/:id/actions/publish',
    '/content-manager/collection-types/:model/:id/actions/unpublish',
    '/content-manager/collection-types/:model/actions/bulkDelete',
  ],
  put: [
    '/content-manager/single-types/:model',
    '/content-manager/collection-types/:model/:id',
  ],
  delete: [
    '/content-manager/single-types/:model',
    '/content-manager/collection-types/:model/:id',
  ],
};

/**
 * @param {Strapi} strapi
 * @param {CachePluginStrategy} options
 * @return {Router}
 */
function createRouter(strapi, options) {
  const router = new Router();

  const createRecvMiddleware = strapi
    .plugin('strapi-plugin-rest-cache')
    .middleware('recv');
  const createPurgeMiddleware = strapi
    .plugin('strapi-plugin-rest-cache')
    .middleware('purge');
  const createPurgeAdminMiddleware = strapi
    .plugin('strapi-plugin-rest-cache')
    .middleware('purgeAdmin');
  const purgeAdminMiddleware = createPurgeAdminMiddleware({}, { strapi });

  for (const cacheConf of options.contentTypes) {
    strapi.log.debug(
      `Register ${chalk.cyan(cacheConf.contentType)} routes middlewares`
    );

    const purgeMiddleware = createPurgeMiddleware(
      { contentType: cacheConf.contentType },
      { strapi, cacheConf }
    );
    const recvMiddleware = createRecvMiddleware(
      { contentType: cacheConf.contentType },
      { strapi, cacheConf }
    );

    for (const route of cacheConf.routes) {
      switch (route.method) {
        case 'DELETE': {
          strapi.log.debug(`DELETE ${route.path} ${chalk.redBright('purge')}`);
          router.delete(route.path, purgeMiddleware);
          break;
        }
        case 'PUT': {
          strapi.log.debug(`PUT ${route.path} ${chalk.redBright('purge')}`);
          router.put(route.path, purgeMiddleware);
          break;
        }
        case 'PATCH': {
          strapi.log.debug(`PATCH ${route.path} ${chalk.redBright('purge')}`);
          router.patch(route.path, purgeMiddleware);
          break;
        }
        case 'POST': {
          strapi.log.debug(`POST ${route.path} ${chalk.redBright('purge')}`);
          router.post(route.path, purgeMiddleware);
          break;
        }
        case 'GET': {
          const vary = cacheConf.headers
            .map((name) => name.toLowerCase())
            .join(',');

          strapi.log.debug(
            `GET ${route.path} ${chalk.green('recv')} ${chalk.grey(
              `maxAge=${cacheConf.maxAge}`
            )}${vary && chalk.grey(` vary=${vary}`)}`
          );

          router.get(route.path, recvMiddleware);
          break;
        }
        default:
          break;
      }
    }
  }

  // --- Admin REST endpoints
  strapi.log.debug(
    `Register ${chalk.magentaBright('admin')} routes middlewares`
  );

  for (const route of adminRoutes.post) {
    strapi.log.debug(`POST ${route} ${chalk.magentaBright('purge-admin')}`);
    router.post(route, purgeAdminMiddleware);
  }
  for (const route of adminRoutes.put) {
    strapi.log.debug(`PUT ${route} ${chalk.magentaBright('purge-admin')}`);
    router.put(route, purgeAdminMiddleware);
  }
  for (const route of adminRoutes.delete) {
    strapi.log.debug(`DELETE ${route} ${chalk.magentaBright('purge-admin')}`);
    router.delete(route, purgeAdminMiddleware);
  }

  return router;
}

module.exports = { createRouter };
