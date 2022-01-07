/**
 * @typedef {import('koa').Context} Context
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { getRelatedModelsUid } = require('./getRelatedModelsUid');
const { deepFreeze } = require('./deepFreeze');
const { routeExists } = require('./routeExists');
const {
  CachePluginConfig,
  CacheRouteConfig,
  CacheContentTypeConfig,
} = require('../../types');

/**
 * @param {Strapi} strapi
 * @param {any} userOptions
 * @return {CachePluginConfig}
 */
function resolveUserOptions(strapi, userOptions) {
  /**
   * @type {CachePluginConfig}
   */
  const defaultOptions = {
    type: 'mem',
    logs: true,
    enabled: false,
    populateContext: false,
    populateStrapiMiddleware: false,
    enableEtagSupport: false,
    enableXCacheHeaders: false,
    clearRelatedCache: false,
    withKoaContext: false,
    withStrapiMiddleware: false,
    headers: [],
    max: 500,
    maxAge: 3600000,
    cacheTimeout: 500,
    contentTypes: [],
  };

  const { contentTypes = [] } = userOptions;
  /**
   * @type {CacheContentTypeConfig[]}
   */
  const cacheConfigs = [];

  const defaultModelConfig = {
    singleType: false,
    /**
     * @param {Context} ctx
     */
    hitpass: (ctx) =>
      Boolean(ctx.request.headers.authorization || ctx.request.headers.cookie),
    injectDefaultRoutes: true,
    headers: userOptions.headers || defaultOptions.headers,
    maxAge: userOptions.maxAge || defaultOptions.maxAge,
  };

  for (const contentTypeOption of contentTypes) {
    if (typeof contentTypeOption === 'string') {
      cacheConfigs.push({
        ...defaultModelConfig,
        routes: [],
        contentType: contentTypeOption,
      });
      continue;
    }

    /**
     * @type {CacheRouteConfig[]}
     */
    const routes = [];
    contentTypeOption.routes?.reduce((acc, value) => {
      if (typeof value === 'string') {
        acc.push({
          path: value,
          method: 'GET',
        });
      } else {
        acc.push(value);
      }

      return acc;
    }, routes);

    cacheConfigs.push({
      ...defaultModelConfig,
      ...contentTypeOption,
      routes: routes.map((routeConfig) =>
        Object.assign(new CacheRouteConfig(), routeConfig)
      ),
    });
  }

  for (const cacheConfig of cacheConfigs) {
    // validate contentTypes
    const contentType = strapi.contentType(cacheConfig.contentType);
    if (!contentType) {
      throw new Error(
        `Unable to resolve strapi-middleware-cache options: contentType uid "${cacheConfig.contentType}" not found`
      );
    }

    // compute contentType kind, plugin, relationship
    cacheConfig.singleType = Boolean(contentType.kind === 'singleType');
    cacheConfig.plugin = contentType.plugin;
    cacheConfig.relatedContentTypeUid = getRelatedModelsUid(
      strapi,
      cacheConfig.contentType
    );

    // inject defaults api routes
    if (!cacheConfig.injectDefaultRoutes) {
      continue;
    }
    // plugins does not have defaults routes
    if (cacheConfig.plugin) {
      continue;
    }

    // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#api-endpoints
    // https://github.com/strapi/strapi/blob/master/packages/core/strapi/lib/core-api/routes/index.js
    if (cacheConfig.singleType) {
      const base = `/api/${contentType.info.singularName}`;

      // delete
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'DELETE',
        })
      );
      // update
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'PUT',
        })
      );
      // find
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'GET',
        })
      );
    } else {
      const base = `/api/${contentType.info.pluralName}`;

      // create
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'POST',
        })
      );
      // delete
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'DELETE',
        })
      );
      // update
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'PUT',
        })
      );

      // find
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'GET',
        })
      );
      // findOne
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'GET',
        })
      );
    }
  }

  for (const cacheConfig of cacheConfigs) {
    for (const route of cacheConfig.routes) {
      if (!routeExists(strapi, route)) {
        throw new Error(
          `Unable to resolve strapi-middleware-cache options: ${route.method} ${route.path} has no matching endpoint`
        );
      }
    }
  }

  return deepFreeze(
    Object.assign(new CachePluginConfig(), {
      ...defaultOptions,
      ...userOptions,
      contentTypes: cacheConfigs.map((cacheConfig) =>
        Object.assign(new CacheContentTypeConfig(), cacheConfig)
      ),
    })
  );
}

module.exports = { resolveUserOptions };
