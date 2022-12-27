'use strict';

/**
 * @typedef {import('koa').Context} Context
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const debug = require('debug')('strapi:strapi-plugin-rest-cache');
const { getRelatedModelsUid } = require('./getRelatedModelsUid');
const { deepFreeze } = require('./deepFreeze');
const { routeExists } = require('./routeExists');
const {
  CachePluginStrategy,
  CacheRouteConfig,
  CacheContentTypeConfig,
  CacheKeysConfig,
} = require('../../types');

const routeParamNameRegex = /:([^/]+)/g;

/**
 * @param {Strapi} strapi
 * @param {any} userOptions
 * @return {CachePluginStrategy}
 */
function resolveUserStrategy(strapi, userOptions) {
  const { contentTypes = [] } = userOptions;

  /**
   * @type {CacheContentTypeConfig[]}
   */
  const cacheConfigs = [];

  const defaultModelConfig = {
    singleType: false,
    injectDefaultRoutes: true,
    keys: userOptions.keys,
    hitpass: userOptions.hitpass,
    maxAge: userOptions.maxAge,
  };

  for (const contentTypeOption of contentTypes) {
    if (typeof contentTypeOption === 'string') {
      cacheConfigs.push({
        ...defaultModelConfig,
        routes: [],
        contentType: contentTypeOption,
        keys: new CacheKeysConfig(defaultModelConfig.keys),
      });
      continue;
    }

    /**
     * @type {CacheRouteConfig[]}
     */
    const routes = [];
    const contentTypeKeys = contentTypeOption?.keys ?? defaultModelConfig.keys;

    contentTypeOption.routes?.reduce((acc, value) => {
      if (typeof value === 'string') {
        acc.push(
          new CacheRouteConfig({
            path: value,
            method: 'GET',
            keys: new CacheKeysConfig(contentTypeKeys),
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
            maxAge: defaultModelConfig.maxAge,
            hitpass: defaultModelConfig.hitpass,
            paramNames: (value.path.match(routeParamNameRegex) ?? []).map(
              (param) => param.replace(':', '')
            ),
            ...value,
            keys: value.keys
              ? new CacheKeysConfig(value.keys)
              : new CacheKeysConfig(contentTypeKeys),
          })
        );
      }

      return acc;
    }, routes);

    cacheConfigs.push({
      ...defaultModelConfig,
      ...contentTypeOption,
      routes,
      keys: new CacheKeysConfig(contentTypeKeys),
    });
  }

  for (const cacheConfig of cacheConfigs) {
    // validate contentTypes
    const contentType = strapi.contentType(cacheConfig.contentType);
    if (!contentType) {
      throw new Error(
        `Unable to resolve rest-cache options: contentType uid "${cacheConfig.contentType}" not found`
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

    // get strapi api prefix
    const apiPrefix = strapi.config.get('api.rest.prefix');

    // https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#api-endpoints
    // https://github.com/strapi/strapi/blob/master/packages/core/strapi/lib/core-api/routes/index.js
    if (cacheConfig.singleType) {
      const base = `${apiPrefix}/${contentType.info.singularName}`;

      // delete
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'DELETE',
          keys: new CacheKeysConfig(cacheConfig.keys),
        })
      );
      // update
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'PUT',
          keys: new CacheKeysConfig(cacheConfig.keys),
        })
      );
      // find
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'GET',
          keys: new CacheKeysConfig(cacheConfig.keys),
          maxAge: cacheConfig.maxAge,
          hitpass: cacheConfig.hitpass,
        })
      );
    } else {
      const base = `${apiPrefix}/${contentType.info.pluralName}`;

      // create
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'POST',
          keys: new CacheKeysConfig(cacheConfig.keys),
        })
      );
      // delete
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'DELETE',
          keys: new CacheKeysConfig(cacheConfig.keys),
          paramNames: ['id'],
        })
      );
      // update
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: `${base}/:id`,
          method: 'PUT',
          keys: new CacheKeysConfig(cacheConfig.keys),
          paramNames: ['id'],
        })
      );

      // find
      cacheConfig.routes.push(
        new CacheRouteConfig({
          path: base,
          method: 'GET',
          keys: new CacheKeysConfig(cacheConfig.keys),
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
          keys: new CacheKeysConfig(cacheConfig.keys),
          maxAge: cacheConfig.maxAge,
          hitpass: cacheConfig.hitpass,
        })
      );
    }
  }

  for (const cacheConfig of cacheConfigs) {
    cacheConfig.routes = cacheConfig.routes.filter((route) => {
      const exist = routeExists(strapi, route);

      if (!exist) {
        debug(
          '[WARNING] route "[%s] %s" not registered in strapi, ignoring...',
          route.method,
          route.path
        );
      }

      return exist;
    });
  }

  return deepFreeze(
    new CachePluginStrategy({
      ...userOptions,
      keys: new CacheKeysConfig(userOptions.keys),
      contentTypes: cacheConfigs.map(
        (cacheConfig) => new CacheContentTypeConfig(cacheConfig)
      ),
    })
  );
}

module.exports = { resolveUserStrategy };
