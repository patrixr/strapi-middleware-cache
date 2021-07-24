const Router = require('koa-router');
const chalk = require('chalk');

const routeExists = require('./routeExists');

const routeParamNameRegex = /:([^/]+)/g;

// @see https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-content-manager/config/routes.json
const adminRoutes = {
  post: [
    `/content-manager/single-types/:model/actions/publish`,
    `/content-manager/single-types/:model/actions/unpublish`,
    `/content-manager/collection-types/:model`,
    `/content-manager/collection-types/:model/:id/actions/publish`,
    `/content-manager/collection-types/:model/:id/actions/unpublish`,
    `/content-manager/collection-types/:model/actions/bulkDelete`,
  ],
  put: [
    `/content-manager/single-types/:model`,
    `/content-manager/collection-types/:model/:id`,
  ],
  delete: [
    `/content-manager/single-types/:model`,
    `/content-manager/collection-types/:model/:id`,
  ],
};

/**
 * @param {MiddlewareCacheConfig} options
 * @param {Logger} logger
 * @param {CacheMiddlewares} middlewares
 * @return {Router}
 */
function createRouter(options, logger, { purge, purgeAdmin, recv }) {
  const router = new Router();

  for (const cacheConf of options.models) {
    logger.debug(
      `Register ${chalk.cyan(
        cacheConf.plugin
          ? cacheConf.plugin + ':' + cacheConf.model
          : cacheConf.model
      )} routes middlewares`
    );

    for (const route of cacheConf.routes) {
      if (!routeExists(strapi, route)) {
        logger.warn(
          `${route.method} ${route.path} has no matching endpoint, skipping`
        );
        continue;
      }

      const [, ...routeParamNames] = routeParamNameRegex.exec(route.path) || [];
      route.paramNames = routeParamNames;

      switch (route.method) {
        case 'DELETE': {
          logger.debug(`DELETE ${route.path} ${chalk.redBright('purge')}`);
          router.delete(route.path, purge(cacheConf));
          break;
        }
        case 'PUT': {
          logger.debug(`PUT ${route.path} ${chalk.redBright('purge')}`);
          router.put(route.path, purge(cacheConf));
          break;
        }
        case 'PATCH': {
          logger.debug(`PATCH ${route.path} ${chalk.redBright('purge')}`);
          router.patch(route.path, purge(cacheConf));
          break;
        }
        case 'POST': {
          logger.debug(`POST ${route.path} ${chalk.redBright('purge')}`);
          router.post(route.path, purge(cacheConf));
          break;
        }
        case 'GET': {
          const vary = cacheConf.headers
            .map((name) => name.toLowerCase())
            .join(',');

          logger.debug(
            `GET ${route.path} ${chalk.green('recv')} ${chalk.grey(
              `maxAge=${cacheConf.maxAge}`
            )}${vary && chalk.grey(` vary=${vary}`)}`
          );

          router.get(route.path, recv(cacheConf));
          break;
        }
      }
    }
  }

  // --- Admin REST endpoints
  logger.debug(`Register ${chalk.magentaBright('admin')} routes middlewares`);

  for (const route of adminRoutes.post) {
    logger.debug(`POST ${route} ${chalk.magentaBright('purge-admin')}`);
    router.post(route, purgeAdmin);
  }
  for (const route of adminRoutes.put) {
    logger.debug(`PUT ${route} ${chalk.magentaBright('purge-admin')}`);
    router.put(route, purgeAdmin);
  }
  for (const route of adminRoutes.delete) {
    logger.debug(`DELETE ${route} ${chalk.magentaBright('purge-admin')}`);
    router.delete(route, purgeAdmin);
  }

  return router;
}

module.exports = createRouter;
