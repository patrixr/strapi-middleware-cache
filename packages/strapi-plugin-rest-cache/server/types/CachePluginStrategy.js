/**
 * @typedef {import('./CacheContentTypeConfig').CacheContentTypeConfig} CacheContentTypeConfig
 */

class CachePluginStrategy {
  enableEtag = false;
  enableXCacheHeaders = false;
  resetOnStartup = false;
  clearRelatedCache = false;
  enableAdminCTBMiddleware = true;
  max = 500;
  maxAge = 3600000;

  /**
   * @type {string[]}
   */
  headers = [];

  /**
   * @type {CacheContentTypeConfig[]}
   */
  contentTypes = [];
}

module.exports = { CachePluginStrategy };
