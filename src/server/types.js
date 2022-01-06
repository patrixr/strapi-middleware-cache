/**
 * @typedef {import('koa').Context} Context
 * @typedef {(ctx: Context) => boolean} CachePluginHitpass
 */

const routeParamNameRegex = /:([^/]+)/g;

class CacheRouteConfig {
  /**
   * @type {string}
   */
  path;
  /**
   * @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'}
   */
  method = 'GET';

  constructor(options) {
    if (!options) return;

    const { path, method = 'GET' } = options;
    this.path = path;
    this.method = method;
  }

  get paramNames() {
    return this.path.match(routeParamNameRegex) || [];
  }
}

class CacheContentTypeConfig {
  singleType = false;
  /**
   * @type {CachePluginHitpass | boolean}
   */
  hitpass = (ctx) =>
    Boolean(ctx.request.headers.authorization || ctx.request.headers.cookie);
  headers = [];
  maxAge = 3600000;
  injectDefaultRoutes = true;
  /**
   * @type {string[]}
   */
  headers = [];
  /**
   * @type {string=}
   */
  plugin;
  /**
   * @type {CacheRouteConfig[]}
   */
  routes = [];
  /**
   * @type {string}
   */
  contentType;

  /**
   * @type {string[]}
   */
  relatedContentTypeUid = [];
}

class CachePluginConfig {
  /**
   * @type {'mem' | 'redis'}
   */
  type = 'mem';
  logs = true;
  enabled = false;
  populateContext = false;
  populateStrapiMiddleware = false;
  enableEtagSupport = false;
  enableXCacheHeaders = false;
  clearRelatedCache = false;
  withKoaContext = false;
  withStrapiMiddleware = false;
  /**
   * @type {string[]}
   */
  headers = [];
  max = 500;
  maxAge = 3600000;
  cacheTimeout = 500;
  /**
   * @type {CacheContentTypeConfig[]}
   */
  contentTypes = [];
}

module.exports = {
  CachePluginConfig,
  CacheRouteConfig,
  CacheContentTypeConfig,
};
