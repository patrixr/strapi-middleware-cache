/**
 * @typedef {import('./CacheRouteConfig').CacheRouteConfig} CacheRouteConfig
 * @typedef {import('koa').Context} Context
 * @typedef {(ctx: Context) => boolean} CachePluginHitpass
 */

class CacheContentTypeConfig {
  singleType = false;

  /**
   * @type {CachePluginHitpass | boolean}
   */
  hitpass = (ctx) =>
    Boolean(ctx.request.headers.authorization || ctx.request.headers.cookie);

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

module.exports = { CacheContentTypeConfig };
