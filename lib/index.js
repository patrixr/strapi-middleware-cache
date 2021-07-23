// @ts-check

/** @typedef { import('koa').Context } KoaContext */

const createStore = require("./cache");
const Router = require("koa-router");
const crypto = require("crypto");
const pluralize = require("pluralize");
const chalk = require("chalk");

const resolveModelUidRegex = /^(application|plugins)::([^.]+).([a-z-]+)$/;
const routeParamNameRegex = /:([^/]+)/g;

/**
 * Generates a cache key for the current request
 *
 * @param {ModelCacheConfig} cacheConf
 * @param {KoaContext} ctx
 * @returns
 */
const generateCacheKey = (cacheConf, ctx) => {
  const querySuffix = Object.keys(ctx.query)
    .sort()
    .map((k) => `${k}=${ctx.query[k]}`) // query strings are key sensitive
    .join(",");
  const headersSuffix = cacheConf.headers
    .sort()
    .filter((k) => ctx.request.header[k.toLowerCase()] !== undefined)
    .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
    .join(",");

  return `${ctx.request.path}?${querySuffix}&${headersSuffix}`;
};

/**
 *
 * @param {string[]} a
 * @param {string[]} b
 */
function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}
/**
 * @callback KoaRouteMiddleware
 * @param {KoaContext} ctx
 * @param {Function} next
 * @returns {Promise<void>}
 */

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
 * @param {UserMiddlewareCacheConfig} userOptions
 * @returns {MiddlewareCacheConfig}
 */
const resolveUserOptions = (userOptions) => {
  /**
   * @type {MiddlewareCacheConfig}
   */
  const defaultOptions = {
    type: "mem",
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
    if (typeof model === "string") {
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
        if (typeof value === "string") {
          acc.push({
            path: value,
            method: "GET",
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
        method: "DELETE",
      });
      model.routes.push({
        path: base,
        method: "PUT",
      });
      model.routes.push({
        path: base,
        method: "GET",
      });
    } else {
      const base = `/${pluralize(model.model)}`;

      model.routes.push({
        path: base,
        method: "POST",
      });
      model.routes.push({
        path: `${base}/:id`,
        method: "DELETE",
      });
      model.routes.push({
        path: `${base}/:id`,
        method: "PUT",
      });

      model.routes.push({
        path: base,
        method: "GET",
      });
      model.routes.push({
        path: `${base}/:id`,
        method: "GET",
      });
      model.routes.push({
        path: `${base}/count`,
        method: "GET",
      });
    }
  }

  return {
    ...defaultOptions,
    ...userOptions,
    models: resolvedModels,
  };
};

/**
 * Get regexs to match CustomRoute keys with given params
 *
 * @param {CustomRoute} route
 * @param {{ [key: string]: string; }=} params
 * @param {boolean=} wildcard
 * @returns {RegExp[]}
 */
const getRouteRegExp = (route, params, wildcard = false) => {
  // route not contains any params -> clear
  if (!route.paramNames || !route.paramNames.length) {
    return [new RegExp(`^${route.path}\\?`)];
  }

  // wildcard: clear all routes
  if (wildcard) {
    let pattern = route.path;
    for (const paramName of route.paramNames) {
      pattern = pattern.replace(`:${paramName}`, '([^/]+)');
    }

    return [new RegExp(`^${pattern}\\?`)];
  } 

  
  if (!params) {
    return [];
  }

  const paramNames = Object.keys(params);
  const regExps = [];

  // route contains :xxx -> check if xxx is in params key -> clear
  if (arrayEquals(route.paramNames, paramNames)) {
    let pattern = route.path;
    for (const paramName of paramNames) {
      pattern = pattern.replace(`:${paramName}`, params[paramName]);
    }
    regExps.push(new RegExp(`^${pattern}\\?`));
  }

  return regExps;
};

/**
 * Get regexs to match all ModelCacheConfig keys with given params
 * 
 * @param {ModelCacheConfig} cacheConf
 * @param {{ [key: string]: string; }=} params
 * @param {boolean=} wildcard
 * @returns {RegExp[]}
 */
const getCacheConfRegExp = (cacheConf, params, wildcard = false) => {
  const regExps = [];

  const routes = cacheConf.routes.filter((route) => {
    return route.method === "GET";
  });

  for (const route of routes) {
    regExps.push(...getRouteRegExp(route, params, wildcard));
  }

  return regExps;
};

/**
 * Creates the caching middleware for strapi
 *
 * @param {Object} strapi
 */
const Cache = (strapi) => {
  /**
   * @type {UserMiddlewareCacheConfig}
   */
  const userOptions = strapi?.config?.middleware?.settings?.cache || {};
  const options = resolveUserOptions(userOptions);

  /**
   * @type {Logger}
   */
  const logger = {
    info: (msg) => options.logs && strapi.log.info(`[cache] ${msg}`),
    debug: (msg) => options.logs && strapi.log.debug(`[cache] ${msg}`),
    warn: (msg, ...rest) =>
      options.logs && strapi.log.warn(`[cache] ${msg}`, ...rest),
    error: (msg, ...rest) =>
      options.logs && strapi.log.error(`[cache] ${msg}`, ...rest),
  };

  /**
   * Get related ModelCacheConfig
   *
   * @param {string} model
   * @param {string=} plugin
   * @returns {ModelCacheConfig=}
   */
  const getCacheConfig = (model, plugin) => {
    return options.models.find((cacheConf) => {
      return cacheConf.model === model && cacheConf.plugin === plugin;
    });
  };

  /**
   * Get related ModelCacheConfig with an uid
   * 
   * uid:
   * - application::sport.sport
   * - plugins::users-permissions.user
   *
   * @param {string} uid
   * @returns {ModelCacheConfig=}
   */
  const getCacheConfigByUid = (uid) => {
    const [, type, plugin, model] = resolveModelUidRegex.exec(uid) || [];

    if (
      typeof type !== "string" ||
      typeof plugin !== "string" ||
      typeof model !== "string"
    ) {
      return;
    }

    return getCacheConfig(model, type === "plugins" ? plugin : undefined);
  };

  /**
   * Get models uid that is related to a ModelCacheConfig
   *
   * @param {ModelCacheConfig} cacheConf The model used to find related caches to purge
   * @return {string[]} Array of related models uid
   */
  const getRelatedModelsUid = (cacheConf) => {
    const models = Object.assign(
      {},
      strapi.models,
      Object.values(strapi.plugins).reduce((acc, plugin) => {
        if (plugin.models) {
          return {
            ...acc,
            ...plugin.models,
          };
        }

        return acc;
      }, {})
    );
    const components = strapi.components;
    const modelObj = models[cacheConf.model];
    const attributes = modelObj?.allAttributes ?? {};
    const relatedComponents = [];
    /**
     * @type {any}
     */
    const relatedModels = {};

    // first, look for direct relations
    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue
      }

      const attr = attributes[key];

      if (!attr.via) continue;
      if (attr.plugin !== cacheConf.plugin) continue;

      if (attr.collection) {
        relatedModels[attr.collection] = models[attr.collection];
      } else if (attr.model && attr.model !== "file") {
        relatedModels[attr.model] = models[attr.model];
      }
    }

    // second, look for relations to current model in components
    for (const compKey in components) {
      if (!Object.hasOwnProperty.call(components, compKey)) {
        continue
      }

      const compObj = components[compKey];
      const attributes = compObj?.allAttributes ?? {};

      // look for the current model
      for (const key in attributes) {
        if (!Object.hasOwnProperty.call(attributes, key)) {
          continue
        }
        
        const attr = attributes[key];

        for (const _key in attr) {
          if (!Object.hasOwnProperty.call(attr, _key)) {
            continue
          }

          const field = attr[_key];

          if (_key !== "model") continue;
          if (attr.plugin !== cacheConf.plugin) continue;

          if (field === cacheConf.model) {
            relatedComponents.push(compKey);
          }
        }
      }

      // look one level deeper
      for (const key in attributes) {
        if (!Object.hasOwnProperty.call(attributes, key)) {
          continue
        }

        const attr = attributes[key];

        for (const _key in attr) {
          if (!Object.hasOwnProperty.call(attr, _key)) {
            continue
          }
          const field = attr[_key];

          if (_key !== "component" && _key !== "components") continue;

          if (
            !Object.hasOwnProperty.call(relatedModels, cacheConf.model) &&
            (relatedComponents.includes(field) ||
              (Array.isArray(field) &&
                field.filter((x) => relatedComponents.includes(x)).length))
          ) {
            // plugin ?
            relatedComponents.push(compKey);
          }
        }
      }
    }

    // finally locate all the models that have the related components in their models
    for (const modelKey in models) {
      if (!Object.hasOwnProperty.call(models, modelKey)) {
        continue
      }

      const modelObj = models[modelKey];
      const attributes = modelObj?.allAttributes ?? {};

      for (const key in attributes) {
        if (!Object.hasOwnProperty.call(attributes, key)) {
          continue
        }
        const attr = attributes[key];

        for (const _key in attr) {
          if (!Object.hasOwnProperty.call(attr, _key)) {
            continue
          }

          const field = attr[key];

          if (key !== "component" && key !== "components") continue;

          if (
            !Object.hasOwnProperty.call(relatedModels, modelKey) &&
            (relatedComponents.includes(field) ||
              (Array.isArray(field) &&
                field.filter((x) => relatedComponents.includes(x)).length))
          ) {
            // plugin ?
            relatedModels[modelKey] = models[modelKey];
          }
        }
      }
    }

    return Object.values(relatedModels).reduce((acc, model) => {
      if (model.uid) {
        acc.push(model.uid);
      }
      return acc;
    }, []);
  };

  /**
   * Check if a custom route is registered in strapi
   *
   * @param {Object} strapi
   * @param {CustomRoute} route
   * @return {boolean}
   */
  const routeExists = (strapi, route) => {
    // check api routes
    const match = strapi.config.routes.find((apiRoute) => {
      return (
        apiRoute.method === route.method &&
        apiRoute.path.match(new RegExp(`${route.path}/?`)) // match with optional leading slash
      );
    });

    if (match) {
      return true;
    }

    const plugins = Object.keys(strapi.plugins);

    // check plugins routes
    for (const plugin of plugins) {
      if (!strapi.plugins[plugin]?.config?.routes) {
        continue;
      }

      const matchPlugin = strapi.plugins[plugin].config.routes.find(
        (pluginRoute) => {
          return (
            pluginRoute.method === route.method &&
            `/${plugin}${pluginRoute.path}`.match(new RegExp(`${route.path}/?`)) // match with optional leading slash
          );
        }
      );

      if (matchPlugin) {
        return true;
      }
    }

    return false;
  };

  return {
    store: null,

    initialize() {
      logger.info("Mounting LRU cache middleware");
      logger.info(`Storage engine: ${options.type}`);

      const router = new Router();
      const store = createStore(strapi, options, logger);

      this.store = store;

      /**
       * Clear cache with uri parameters
       * 
       * @param {ModelCacheConfig} cacheConf
       * @param {{ [key: string]: string; }=} params
       */
      const clearCache = async (cacheConf, params = {}) => {
        const keys = (await store.keys()) || [];
        const regExps = getCacheConfRegExp(cacheConf, params);

        if (options.clearRelatedCache) {
          const relatedModelsUid = getRelatedModelsUid(cacheConf);

          for (const uid of relatedModelsUid) {
            const relatedCacheConf = getCacheConfigByUid(uid);

            if (relatedCacheConf) {
              // clear all cache because we can't predict uri params
              regExps.push(...getCacheConfRegExp(relatedCacheConf, {}, true));
            }
          }
        }

        const shouldDel = (key) => regExps.find((r) => r.test(key));
        const del = (key) => store.del(key);

        await Promise.all(keys.filter(shouldDel).map(del));
      };

      // --- Populate Koa Context with cache entry point

      if (options.withKoaContext) {
        strapi.app.use((ctx, next) => {
          if (ctx.middleware) {
            ctx.middleware.cache = {
              store,
              options,
              clearCache,
              getCacheConfig,
              getCacheConfigByUid,
              getRelatedModelsUid,
              getCacheConfRegExp,
              getRouteRegExp,
            };
          }

          return next();
        });
      }

      // --- Populate Strapi Middleware with cache entry point

      if (options.withStrapiMiddleware) {
        strapi.middleware.cache = {
          store,
          options,
          clearCache,
          getCacheConfig,
          getCacheConfigByUid,
          getRelatedModelsUid,
          getCacheConfRegExp,
          getRouteRegExp,
        };
      }

      // --- REST cache middlewares

      /**
       * Creates a Koa middleware that busts the cache of a given model
       *
       * @param {ModelCacheConfig} cacheConf
       * @returns {KoaRouteMiddleware}
       */
      const purge = (cacheConf) => async (ctx, next) => {
        await next();

        if (!(ctx.status >= 200 && ctx.status <= 300)) return;

        await clearCache(cacheConf, ctx.params);
      };

      /**
       * Busts the cache on receiving a modification from the admin panel
       *
       * @type {KoaRouteMiddleware}
       */
      const purgeAdmin = async (ctx, next) => {
        // uid:
        // - application::sport.sport
        // - plugins::users-permissions.user
        const { model: uid, ...params } = ctx.params;

        if (!uid) {
          await next();
          return;
        }

        const cacheConf = getCacheConfigByUid(uid);

        const isCached = !!cacheConf;

        if (!isCached) {
          await next();
          return;
        }

        await next();

        if (!(ctx.status >= 200 && ctx.status <= 300)) return;

        await clearCache(cacheConf, params);
      };

      /**
       * Creates a Koa middleware that receive cachable requests of a given model
       *
       * @param {ModelCacheConfig} cacheConf
       * @returns {KoaRouteMiddleware}
       */
      const recv = (cacheConf) => async (ctx, next) => {
        // hash
        const cacheKey = generateCacheKey(cacheConf, ctx);

        // hitpass check
        const lookup = !(
          (typeof cacheConf.hitpass === "function" && cacheConf.hitpass(ctx)) ||
          (typeof cacheConf.hitpass === "boolean" && cacheConf.hitpass)
        );

        if (lookup) {
          // lookup
          if (options.enableEtagSupport) {
            const ifNoneMatch = ctx.request.headers["if-none-match"];
            const etagEntry = await store.get(`${cacheKey}_etag`);
            const etagMatch = ifNoneMatch === etagEntry;

            if (!etagMatch) {
              ctx.set("ETag", etagEntry);
            } else {
              logger.debug(`GET ${ctx.path} ${chalk.green("HIT")}`);

              if (options.enableXCacheHeaders) {
                ctx.set("X-Cache", "HIT");
              }

              ctx.status = 304;
              return;
            }
          }

          const cacheEntry = await store.get(cacheKey);

          // hit cache
          if (cacheEntry) {
            logger.debug(`GET ${ctx.path} ${chalk.green("HIT")}`);

            if (options.enableXCacheHeaders) {
              ctx.set("X-Cache", "HIT");
            }

            ctx.status = 200;
            ctx.body = cacheEntry;
            return;
          }
        }

        // fetch backend
        await next();

        // fetch done
        if (!lookup) {
          logger.debug(`GET ${ctx.path} ${chalk.magenta("HITPASS")}`);

          if (options.enableXCacheHeaders) {
            ctx.set("X-Cache", "HITPASS");
          }

          // do not store hitpass response content
          return;
        }

        // deliver
        logger.debug(`GET ${ctx.path} ${chalk.yellow("MISS")}`);

        if (options.enableXCacheHeaders) {
          ctx.set("X-Cache", "MISS");
        }

        if (ctx.body && ctx.status == 200) {
          // @TODO check Cache-Control response header
          await store.set(cacheKey, ctx.body, cacheConf.maxAge);

          if (options.enableEtagSupport) {
            const etag = crypto
              .createHash("md5")
              .update(JSON.stringify(ctx.body))
              .digest("hex");

            ctx.set("ETag", `"${etag}"`);

            await store.set(`${cacheKey}_etag`, `"${etag}"`, cacheConf.maxAge);
          }
        }
      };

      // --- Public REST endpoints
      for (const cacheConf of options.models) {
        logger.debug(
          `Register ${chalk.cyan(
            cacheConf.plugin
              ? cacheConf.plugin + ":" + cacheConf.model
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

          const [, ...routeParamNames] =
            routeParamNameRegex.exec(route.path) || [];
          route.paramNames = routeParamNames;

          switch (route.method) {
            case "DELETE": {
              logger.debug(`DELETE ${route.path} ${chalk.redBright("purge")}`);
              router.delete(route.path, purge(cacheConf));
              break;
            }
            case "PUT": {
              logger.debug(`PUT ${route.path} ${chalk.redBright("purge")}`);
              router.put(route.path, purge(cacheConf));
              break;
            }
            case "PATCH": {
              logger.debug(`PATCH ${route.path} ${chalk.redBright("purge")}`);
              router.patch(route.path, purge(cacheConf));
              break;
            }
            case "POST": {
              logger.debug(`POST ${route.path} ${chalk.redBright("purge")}`);
              router.post(route.path, purge(cacheConf));
              break;
            }
            case "GET": {
              const vary = cacheConf.headers
                .map((name) => name.toLowerCase())
                .join(",");

              logger.debug(
                `GET ${route.path} ${chalk.green("recv")} ${chalk.grey(
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
      logger.debug(
        `Register ${chalk.magentaBright("admin")} routes middlewares`
      );

      for (const route of adminRoutes.post) {
        logger.debug(`POST ${route} ${chalk.magentaBright("purge-admin")}`);
        router.post(route, purgeAdmin);
      }
      for (const route of adminRoutes.put) {
        logger.debug(`PUT ${route} ${chalk.magentaBright("purge-admin")}`);
        router.put(route, purgeAdmin);
      }
      for (const route of adminRoutes.delete) {
        logger.debug(`DELETE ${route} ${chalk.magentaBright("purge-admin")}`);
        router.delete(route, purgeAdmin);
      }

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;
