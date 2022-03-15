'use strict';

/**
 * @typedef {import('./CacheContentTypeConfig').CacheContentTypeConfig} CacheContentTypeConfig
 */
const { CacheKeysConfig } = require('./CacheKeysConfig');

class CachePluginStrategy {
  debug = false;

  enableEtag = false;

  enableXCacheHeaders = false;

  enableAdminCTBMiddleware = true;

  resetOnStartup = false;

  clearRelatedCache = false;

  maxAge = 3600000;

  keysPrefix = '';

  /**
   * @type {CacheContentTypeConfig[]}
   */
  contentTypes = [];

  /**
   * @type {CacheKeysConfig}
   */
  keys;

  constructor(options = {}) {
    const {
      debug = false,
      enableEtag = false,
      enableXCacheHeaders = false,
      enableAdminCTBMiddleware = true,
      resetOnStartup = false,
      clearRelatedCache = true,
      maxAge = 3600000,
      keysPrefix = '',
      contentTypes = [],
      keys = new CacheKeysConfig(),
    } = options;

    this.debug = debug;
    this.enableEtag = enableEtag;
    this.enableXCacheHeaders = enableXCacheHeaders;
    this.enableAdminCTBMiddleware = enableAdminCTBMiddleware;
    this.resetOnStartup = resetOnStartup;
    this.clearRelatedCache = clearRelatedCache;
    this.maxAge = maxAge;
    this.keysPrefix = keysPrefix;
    this.contentTypes = contentTypes;
    this.keys = keys;
  }
}

module.exports = { CachePluginStrategy };
