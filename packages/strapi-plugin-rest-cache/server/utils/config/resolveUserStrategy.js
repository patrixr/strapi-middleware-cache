/**
 * @typedef {import('koa').Context} Context
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { getRelatedModelsUid } = require('./getRelatedModelsUid');
const { deepFreeze } = require('./deepFreeze');
const { routeExists } = require('./routeExists');
const {
  CachePluginStrategy,
  defaultHitpass,
  CacheRouteConfig,
  CacheContentTypeConfig,
} = require('../../types');

const routeParamNameRegex = /:([^/]+)/g;

/**
 * @param {Strapi} strapi
 * @param {any} userOptions
 * @return {CachePluginStrategy}
 */
function resolveUserStrategy(strapi, userOptions) {
  /**
   * @type {CachePluginStrategy}
   */
  const defaultOptions = {
    enableEtag: false,
    enableXCacheHeaders: false,
    clearRelatedCache: false,
    injectAdminMiddlewares: true,
    headers: [],
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
    hitpass: defaultHitpass,
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
        acc.push(
          new CacheRouteConfig({
            path: value,
            method: 'GET',
            headers: [...defaultModelConfig.headers],
            maxAge: defaultModelConfig.maxAge,
            hitpass: defaultModelConfig.hitpass,
            paramNames: (value.match(routeParamNameRegex) ?? []).map((param) =>
              param.replace(':', '')
            ),
          })
        );
      } else {
        acc.push(
          new CacheRouteConfig({
            headers: [...defaultModelConfig.headers],
            maxAge: defaultModelConfig.maxAge,
            hitpass: defaultModelConfig.hitpass,
            paramNames: (value.path.match(routeParamNameRegex) ?? []).map(
              (param) => param.replace(':', '')
            ),
            ...value,
          })
        );
      }

      return acc;
    }, routes);

    cacheConfigs.push({
      ...defaultModelConfig,
      ...contentTypeOption,
      routes,
    });
  }

  for (const cacheConfig of cacheConfigs) {
    // validate contentTypes
    const contentType = strapi.contentType(cacheConfig.contentType);
    if (!contentType) {
      throw new Error(
        `Unable to resolve strapi-plugin-rest-cache options: contentType uid "${cacheConfig.contentType}" not found`
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
          headers: [...cacheConfig.headers],
          maxAge: cacheConfig.maxAge,
          hitpass: cacheConfig.hitpass,
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
          paramNames: ['id'],
        })
      );
      // update
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'PUT',
          paramNames: ['id'],
        })
      );

      // find
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'GET',
          headers: [...cacheConfig.headers],
          maxAge: cacheConfig.maxAge,
          hitpass: cacheConfig.hitpass,
        })
      );
      // findOne
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'GET',
          paramNames: ['id'],
          headers: [...cacheConfig.headers],
          maxAge: cacheConfig.maxAge,
          hitpass: cacheConfig.hitpass,
        })
      );
    }
  }

  for (const cacheConfig of cacheConfigs) {
    for (const route of cacheConfig.routes) {
      if (!routeExists(strapi, route)) {
        throw new Error(
          `Unable to resolve strapi-plugin-rest-cache options: ${route.method} ${route.path} has no matching endpoint`
        );
      }
    }
  }

  return deepFreeze(
    Object.assign(new CachePluginStrategy(), {
      ...defaultOptions,
      ...userOptions,
      contentTypes: cacheConfigs.map((cacheConfig) =>
        Object.assign(new CacheContentTypeConfig(), cacheConfig)
      ),
    })
  );
}

module.exports = { resolveUserStrategy };
