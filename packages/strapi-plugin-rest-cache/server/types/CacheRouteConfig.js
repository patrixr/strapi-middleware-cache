'use strict';

/**
 * @typedef {(ctx: Context) => boolean} CachePluginHitpass
 */
const { CacheKeysConfig } = require('./CacheKeysConfig');

class CacheRouteConfig {
  maxAge = 3600000;

  /**
   * @type {string}
   */
  path;

  /**
   * @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'}
   */
  method = 'GET';

  /**
   * @type {string[]}
   */
  paramNames = [];

  /**
   * @type {CacheKeysConfig}
   */
  keys;

  /**
   * @type {CachePluginHitpass | boolean}
   */
  hitpass = false;

  constructor(options = {}) {
    const {
      path,
      method = 'GET',
      paramNames = [],
      maxAge = 3600000,
      hitpass = false,
      keys = new CacheKeysConfig(),
    } = options;
    this.path = path;
    this.method = method;
    this.paramNames = paramNames;
    this.maxAge = maxAge;
    this.hitpass = hitpass;
    this.keys = keys;
  }
}

module.exports = {
  CacheRouteConfig,
};
