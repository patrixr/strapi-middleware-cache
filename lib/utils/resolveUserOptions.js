const pluralize = require('pluralize');

/**
 * @param {UserMiddlewareCacheConfig} userOptions
 * @return {MiddlewareCacheConfig}
 */
function resolveUserOptions(userOptions) {
  /**
   * @type {MiddlewareCacheConfig}
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
    models: [],
  };

  const { models = [] } = userOptions;
  /**
   * @type {ModelCacheConfig[]}
   */
  const resolvedModels = [];

  const defaultModelConfig = {
    singleType: false,
    hitpass: (ctx) =>
      ctx.request.headers.authorization || ctx.request.headers.cookie,
    injectDefaultRoutes: true,
    headers: userOptions.headers || defaultOptions.headers,
    maxAge: userOptions.maxAge || defaultOptions.maxAge,
  };

  for (const model of models) {
    if (typeof model === 'string') {
      resolvedModels.push({
        ...defaultModelConfig,
        routes: [],
        model,
      });
      continue;
    }

    /**
     * @type {CustomRoute[]}
     */
    const routes =
      model.routes?.reduce((acc, value) => {
        if (typeof value === 'string') {
          acc.push({
            path: value,
            method: 'GET',
          });
        } else {
          acc.push(value);
        }

        return acc;
      }, []) || [];

    resolvedModels.push({
      ...defaultModelConfig,
      ...model,
      routes,
    });
  }

  // inject defaults api routes
  for (const model of resolvedModels) {
    // plugins does not have defaults routes
    if (model.plugin) {
      continue;
    }
    if (!model.injectDefaultRoutes) {
      continue;
    }

    if (model.singleType) {
      const base = `/${model.model}`;

      model.routes.push({
        path: base,
        method: 'DELETE',
      });
      model.routes.push({
        path: base,
        method: 'PUT',
      });
      model.routes.push({
        path: base,
        method: 'GET',
      });
    } else {
      const base = `/${pluralize(model.model)}`;

      model.routes.push({
        path: base,
        method: 'POST',
      });
      model.routes.push({
        path: `${base}/:id`,
        method: 'DELETE',
      });
      model.routes.push({
        path: `${base}/:id`,
        method: 'PUT',
      });

      model.routes.push({
        path: base,
        method: 'GET',
      });
      model.routes.push({
        path: `${base}/:id`,
        method: 'GET',
      });
      model.routes.push({
        path: `${base}/count`,
        method: 'GET',
      });
    }
  }

  return {
    ...defaultOptions,
    ...userOptions,
    models: resolvedModels,
  };
}

module.exports = resolveUserOptions;
