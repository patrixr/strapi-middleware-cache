// @ts-check

/** @typedef { import('koa').Context } KoaContext */

const createCache = require("./cache");
const Router = require("koa-router");
const crypto = require("crypto");
const _ = require("lodash");
const pluralize = require("pluralize");
const semver = require("semver");
const chalk = require("chalk");

const resolveModelRegex = /^(application|plugins)::([^.]+).([a-z-]+)$/;
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
  return a.length === b.length && a.every((val, index) => val === b[index]);
}
/**
 * @callback KoaRouteMiddleware
 * @param {KoaContext} ctx
 * @param {Function} next
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} CustomRoute
 * @property {string} path
 * @property {'GET'|'PUT'|'POST'|'PATCH'|'DELETE'} method
 * @property {string[]=} paramNames
 */

/**
 * @typedef {Object} Logger
 * @property {function(string): void} info
 * @property {function(string): void} debug
 * @property {function(string, ...any): void} warn
 */

/// User input types

/**
 * @typedef {Object} UserModelCacheConfig
 * @property {boolean=} singleType
 * @property {boolean=} injectDefaultRoutes
 * @property {string[]=} headers
 * @property {string} model
 * @property {number=} maxAge
 * @property {string=} plugin
 * @property {(string | CustomRoute)[]=} routes
 */

/**
 * @typedef {Object} UserMiddlewareCacheConfig
 * @property {'mem'|'redis'=} type
 * @property {boolean=} enabled
 * @property {boolean=} logs
 * @property {boolean=} populateContext
 * @property {boolean=} populateStrapiMiddleware
 * @property {boolean=} enableEtagSupport
 * @property {boolean=} clearRelatedCache
 * @property {boolean=} withKoaContext
 * @property {boolean=} withStrapiMiddleware
 * @property {number=} max
 * @property {number=} maxAge
 * @property {number=} cacheTimeout
 * @property {string[]=} headers
 * @property {(UserModelCacheConfig | string)[]=} models
 * @property {Object=} redisConfig
 */

/// Resolved types

/**
 * @typedef {Object} ModelCacheConfig
 * @property {boolean} singleType
 * @property {boolean} injectDefaultRoutes
 * @property {string[]} headers
 * @property {string} model
 * @property {number} maxAge
 * @property {string=} plugin
 * @property {CustomRoute[]} routes
 */

/**
 * @typedef {Object} MiddlewareCacheConfig
 * @property {'mem'|'redis'} type
 * @property {boolean} enabled
 * @property {boolean} logs
 * @property {boolean} populateContext
 * @property {boolean} populateStrapiMiddleware
 * @property {boolean} enableEtagSupport
 * @property {boolean} clearRelatedCache
 * @property {boolean} withKoaContext
 * @property {boolean} withStrapiMiddleware
 * @property {number} max
 * @property {number} maxAge
 * @property {number} cacheTimeout
 * @property {string[]} headers
 * @property {ModelCacheConfig[]} models
 * @property {Object=} redisConfig
 */

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
    injectDefaultRoutes: true,
    headers: userOptions.headers ?? defaultOptions.headers,
    maxAge: userOptions.maxAge ?? defaultOptions.maxAge,
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
    info: (msg) => options.logs && strapi.log.info(`[Cache] ${msg}`),
    debug: (msg) => options.logs && strapi.log.debug(`[Cache] ${msg}`),
    warn: (msg, ...rest) =>
      options.logs && strapi.log.warn(`[Cache] ${msg}`, ...rest),
  };

  /**
   * Get related ModelCacheConfig to a model
   *
   * @param {{ model: string, plugin?: string }} param
   * @returns {ModelCacheConfig=}
   */
  const getModelCacheConfig = ({ model, plugin }) => {
    return options.models.find((cacheConf) => {
      return cacheConf.model === model && cacheConf.plugin === plugin;
    });
  };

  /**
   *
   * @param {{ model: string, plugin?: string }} param The model used to find related caches to purge
   * @return {array} Array of related models
   */
  const getRelatedModels = ({ model, plugin }) => {
    // @TODO: manage model plugin matching
    const models = Object.assign(
      {},
      strapi.models,
      strapi.plugins["users-permissions"].models
    );
    const components = strapi.components;
    const modelKey = _.findKey(models, { collectionName: model }) || model;
    const modelObj = models[modelKey];
    const attributes = _.get(modelObj, "allAttributes", {});
    const relatedComponents = [];
    /**
     * @type {any}
     */
    const relatedModels = {};

    // first, look for direct relations
    for (const key in attributes) {
      const attr = attributes[key];

      if (!attr.via) continue;

      if (attr.collection) {
        // attr.plugin "users-permissions"
        relatedModels[attr.collection] = models[attr.collection];
      } else if (attr.model && attr.model !== "file") {
        // attr.plugin "users-permissions"
        relatedModels[attr.model] = models[attr.model];
      }
    }

    // second, look for relations to current model in components
    for (const compKey in components) {
      const compObj = components[compKey];
      const attributes = _.get(compObj, "allAttributes", {});

      // look for the current model
      for (const key in attributes) {
        const attr = attributes[key];

        for (const key in attr) {
          const field = attr[key];

          if (key !== "model") continue;

          // attr.plugin "users-permissions"
          if (field === modelKey) {
            relatedComponents.push(compKey);
          }
        }
      }

      // look one level deeper
      for (const key in attributes) {
        const attr = attributes[key];

        for (const key in attr) {
          const field = attr[key];

          if (key !== "component" && key !== "components") continue;

          if (
            !relatedModels.hasOwnProperty(modelKey) &&
            (relatedComponents.includes(field) ||
              (Array.isArray(field) &&
                field.filter((x) => relatedComponents.includes(x)).length))
          ) {
            // attr.plugin "users-permissions"
            relatedComponents.push(compKey);
          }
        }
      }
    }

    // finally locate all the models that have the related components in their models
    for (const modelKey in models) {
      const modelObj = models[modelKey];
      const attributes = _.get(modelObj, "allAttributes", {});

      for (const key in attributes) {
        const attr = attributes[key];

        for (const key in attr) {
          const field = attr[key];

          if (key !== "component" && key !== "components") continue;

          if (
            !relatedModels.hasOwnProperty(modelKey) &&
            (relatedComponents.includes(field) ||
              (Array.isArray(field) &&
                field.filter((x) => relatedComponents.includes(x)).length))
          ) {
            relatedModels[modelKey] = models[modelKey];
          }
        }
      }
    }

    return relatedModels;
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
    let match = strapi.config.routes.find((apiRoute) => {
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
      let matchPlugin = strapi.plugins[plugin].config.routes.find(
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
      const store = createCache(strapi, options, logger);

      this.store = store;

      /**
       *
       * @param {ModelCacheConfig} cacheConf
       * @param {any} params
       */
      const clearCache = async (cacheConf, params = {}) => {
        const keys = (await store.keys()) || [];
        const rexps = [];

        const routes = cacheConf.routes.filter((route) => {
          return route.method === "GET";
        });

        const paramNames = Object.keys(params).sort();

        for (const route of routes) {
          // route not contains any params -> clear
          if (!route.paramNames || !route.paramNames.length) {
            rexps.push(new RegExp(`^${route.path}\\?`));
            continue;
          }

          // route contains :xxx -> check if xxx is in params key -> clear
          if (arrayEquals(route.paramNames, paramNames)) {
            let pattern = route.path;
            for (const paramName of paramNames) {
              pattern = pattern.replace(`:${paramName}`, params[paramName]);
            }
            rexps.push(new RegExp(`^${pattern}\\?`));
          }
        }

        // @TODO: clearRelatedCache

        // if (options.clearRelatedCache) {
        //   const relatedModels = getRelatedModels({ model, plugin });

        //   // prep related models to have their whole cache purgeed
        //   _.each(relatedModels, (relatedModel, key) => {
        //     const relatedModelSlug =
        //       relatedModel.kind === "collectionType"
        //         ? relatedModel.collectionName
        //         : key;

        //     rexps.push(new RegExp(`^/${relatedModelSlug}`)); // Bust all entries from models that have relations with that model
        //   });
        // }

        const shouldDel = (key) => rexps.find((r) => r.test(key));
        const del = (key) => store.del(key);

        await Promise.all(keys.filter(shouldDel).map(del));
      };

      // --- Populate Koa Context with cache entry point

      if (options.withKoaContext) {
        strapi.app.use((ctx, next) => {
          _.set(ctx, "middleware.cache", {
            bust: clearCache,
            store,
          });
          return next();
        });
      }

      // --- Populate Strapi Middleware with cache entry point

      if (options.withStrapiMiddleware) {
        _.set(strapi, "middleware.cache", {
          bust: clearCache,
          store,
        });
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
        // params.model:
        // - application::sport.sport
        // - plugins::users-permissions.user
        const { params } = ctx;
        const { model: adminModelId, ...adminParams } = params;

        if (!adminModelId) {
          await next();
          return;
        }

        const [, type, plugin, model] =
          resolveModelRegex.exec(adminModelId) || [];

        if (
          typeof type !== "string" ||
          typeof plugin !== "string" ||
          typeof model !== "string"
        ) {
          await next();
          return;
        }

        const cacheConf = getModelCacheConfig({
          model,
          plugin: type === "plugins" ? plugin : undefined,
        });

        const isCached = !!cacheConf;

        if (!isCached) {
          await next();
          return;
        }

        await next();

        if (!(ctx.status >= 200 && ctx.status <= 300)) return;

        await clearCache(cacheConf, adminParams);
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

        if (options.enableEtagSupport) {
          const ifNoneMatch = ctx.request.headers["if-none-match"];
          const etagEntry = await store.get(`${cacheKey}_etag`);
          const etagMatch = ifNoneMatch === etagEntry;

          if (!etagMatch) {
            ctx.set("ETag", etagEntry);
          } else {
            // @TODO optional x-cache header
            logger.debug(`GET ${ctx.path} ${chalk.green("HIT")}`);
            ctx.set("X-Cache", "HIT");

            ctx.status = 304;
            return;
          }
        }

        // lookup
        const cacheEntry = await store.get(cacheKey);

        // hit cache
        if (cacheEntry) {
          // @TODO optional x-cache header
          logger.debug(`GET ${ctx.path} ${chalk.green("HIT")}`);
          ctx.set("X-Cache", "HIT");

          ctx.status = 200;
          ctx.body = cacheEntry;
          return;
        }

        // miss
        logger.debug(`GET ${ctx.path} ${chalk.yellow("MISS")}`);
        ctx.set("X-Cache", "MISS");

        // fetch backend
        await next();

        // fetch done
        if (ctx.body && ctx.status == 200) {
          //@TODO check Cache-Control response header
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

        // deliver
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
              logger.debug(
                `GET ${route.path} ${chalk.green("recv")} ${chalk.grey(
                  `maxAge=${cacheConf.maxAge}`
                )}`
              );

              router.get(route.path, recv(cacheConf));
              break;
            }
          }
        }
      }

      // --- Admin REST endpoints
      if (semver.lt(process.version, "3.4.0")) {
        // strapi < 3.4.0
        // @see https://github.com/strapi/strapi/blob/v3.3.4/packages/strapi-plugin-content-manager/config/routes.json
        router.post("/content-manager/explorer/:model", purgeAdmin);
        router.put("/content-manager/explorer/:model/:id", purgeAdmin);
        router.delete("/content-manager/explorer/deleteAll/:model", purgeAdmin);
        router.delete("/content-manager/explorer/:model/:id", purgeAdmin);
        router.post("/content-manager/explorer/:model/publish/:id", purgeAdmin);
        router.post(
          "/content-manager/explorer/:model/unpublish/:id",
          purgeAdmin
        );
      } else {
        // strapi >= 3.4.0
        // @see https://github.com/strapi/strapi/blob/master/packages/strapi-plugin-content-manager/config/routes.json
        router.put(`/content-manager/single-types/:model`, purgeAdmin);
        router.delete(`/content-manager/single-types/:model`, purgeAdmin);
        router.post(
          `/content-manager/single-types/:model/actions/publish`,
          purgeAdmin
        );
        router.post(
          `/content-manager/single-types/:model/actions/unpublish`,
          purgeAdmin
        );

        router.post(`/content-manager/collection-types/:model`, purgeAdmin);
        router.put(`/content-manager/collection-types/:model/:id`, purgeAdmin);
        router.delete(
          `/content-manager/collection-types/:model/:id`,
          purgeAdmin
        );
        router.post(
          `/content-manager/collection-types/:model/:id/actions/publish`,
          purgeAdmin
        );
        router.post(
          `/content-manager/collection-types/:model/:id/actions/unpublish`,
          purgeAdmin
        );
        router.post(
          `/content-manager/collection-types/:model/actions/bulkDelete`,
          purgeAdmin
        );
      }

      strapi.app.use(router.routes());
    },
  };
};

module.exports = Cache;
