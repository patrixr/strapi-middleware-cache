/**
 * @typedef {import('./CacheContentTypeConfig').CacheContentTypeConfig} CacheContentTypeConfig
 */

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

module.exports = { CachePluginConfig };
