/**
 * @typedef {(ctx: Context) => boolean} CachePluginHitpass
 */

const { defaultHitpass } = require('./CacheContentTypeConfig');

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
   * @type {string[]}
   */
  headers = [];

  /**
   * @type {CachePluginHitpass | boolean}
   */
  hitpass = defaultHitpass;

  constructor(options) {
    if (!options) return;

    const {
      path,
      method = 'GET',
      paramNames = [],
      headers = [],
      maxAge = 3600000,
      hitpass = defaultHitpass,
    } = options;
    this.path = path;
    this.method = method;
    this.paramNames = paramNames;
    this.headers = headers;
    this.maxAge = maxAge;
    this.hitpass = hitpass;
  }
}

module.exports = {
  CacheRouteConfig,
};
