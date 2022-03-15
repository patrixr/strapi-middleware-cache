'use strict';

/**
 * @typedef {import('./CacheRouteConfig').CacheRouteConfig} CacheRouteConfig
 * @typedef {import('koa').Context} Context
 * @typedef {(ctx: Context) => boolean} CachePluginHitpass
 */
const { CacheKeysConfig } = require('./CacheKeysConfig');

class CacheContentTypeConfig {
  singleType = false;

  injectDefaultRoutes = true;

  maxAge = 3600000;

  /**
   * @type {CachePluginHitpass | boolean}
   */
  hitpass = false;

  /**
   * @type {CacheKeysConfig}
   */
  keys;

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

  constructor(options = {}) {
    const {
      singleType = false,
      injectDefaultRoutes = true,
      maxAge = true,
      hitpass = false,
      keys = new CacheKeysConfig(),
      routes = [],
      relatedContentTypeUid = [],
      contentType,
      plugin,
    } = options;

    this.singleType = singleType;
    this.injectDefaultRoutes = injectDefaultRoutes;
    this.maxAge = maxAge;
    this.hitpass = hitpass;
    this.keys = keys;
    this.routes = routes;
    this.relatedContentTypeUid = relatedContentTypeUid;
    this.contentType = contentType;
    this.plugin = plugin;
  }
}

module.exports = { CacheContentTypeConfig };
