'use strict';

const Router = require('@koa/router');
const chalk = require('chalk');
const debug = require('debug')('strapi:strapi-plugin-rest-cache');

/**
 * @typedef {import('../../types').CachePluginStrategy} CachePluginStrategy
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
 * @param {CachePluginStrategy} strategy
 * @return {Router}
 */
function createRouter(strapi, strategy) {
  const router = new Router();

  const createRecvMiddleware = strapi.plugin('rest-cache').middleware('recv');
  const createPurgeMiddleware = strapi.plugin('rest-cache').middleware('purge');
  const createPurgeAdminMiddleware = strapi
    .plugin('rest-cache')
    .middleware('purgeAdmin');
  const purgeAdminMiddleware = createPurgeAdminMiddleware({}, { strapi });

  for (const cacheConf of strategy.contentTypes) {
    debug(`[REGISTER] ${chalk.cyan(cacheConf.contentType)} routes middlewares`);

    const purgeMiddleware = createPurgeMiddleware(
      { contentType: cacheConf.contentType },
      { strapi }
    );

    for (const route of cacheConf.routes) {
      switch (route.method) {
        case 'DELETE': {
          debug(`[REGISTER] DELETE ${route.path} ${chalk.redBright('purge')}`);
          router.delete(route.path, purgeMiddleware);
          break;
        }
        case 'PUT': {
          debug(`[REGISTER] PUT ${route.path} ${chalk.redBright('purge')}`);
          router.put(route.path, purgeMiddleware);
          break;
        }
        case 'PATCH': {
          debug(`[REGISTER] PATCH ${route.path} ${chalk.redBright('purge')}`);
          router.patch(route.path, purgeMiddleware);
          break;
        }
        case 'POST': {
          debug(`[REGISTER] POST ${route.path} ${chalk.redBright('purge')}`);
          router.post(route.path, purgeMiddleware);
          break;
        }
        case 'GET': {
          const vary = route.keys.useHeaders
            .map((name) => name.toLowerCase())
            .join(',');

          debug(
            `[REGISTER] GET ${route.path} ${chalk.green('recv')} ${chalk.grey(
              `maxAge=${route.maxAge}`
            )}${vary && chalk.grey(` vary=${vary}`)}`
          );

          router.get(
            route.path,
            createRecvMiddleware({ cacheRouteConfig: route }, { strapi })
          );
          break;
        }
        default:
          break;
      }
    }
  }

  // --- Admin REST endpoints
  if (strategy.enableAdminCTBMiddleware) {
    debug(`[REGISTER] ${chalk.magentaBright('admin')} routes middlewares`);

    for (const route of adminRoutes.post) {
      debug(`[REGISTER] POST ${route} ${chalk.magentaBright('purge-admin')}`);
      router.post(route, purgeAdminMiddleware);
    }
    for (const route of adminRoutes.put) {
      debug(`[REGISTER] PUT ${route} ${chalk.magentaBright('purge-admin')}`);
      router.put(route, purgeAdminMiddleware);
    }
    for (const route of adminRoutes.delete) {
      debug(`[REGISTER] DELETE ${route} ${chalk.magentaBright('purge-admin')}`);
      router.delete(route, purgeAdminMiddleware);
    }
  }

  return router;
}

module.exports = { createRouter };
