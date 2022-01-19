/**
 * @typedef {import('./CacheContentTypeConfig').CacheContentTypeConfig} CacheContentTypeConfig
 */

class CachePluginStrategy {
  enableEtag = false;

  enableXCacheHeaders = false;

  clearRelatedCache = false;
  injectAdminMiddlewares = true;

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
