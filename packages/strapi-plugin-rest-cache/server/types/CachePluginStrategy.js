/**
 * @typedef {import('./CacheContentTypeConfig').CacheContentTypeConfig} CacheContentTypeConfig
 */

class CachePluginStrategy {
  enableEtagSupport = false;

  enableXCacheHeaders = false;

  clearRelatedCache = false;

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

module.exports = { CachePluginStrategy };
