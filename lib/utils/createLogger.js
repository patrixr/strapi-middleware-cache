/**
 * @param {MiddlewareCacheConfig} options
 * @returns {Logger}
 */
function createLogger(options) {
  return {
    info: (msg) => options.logs && strapi.log.info(`[cache] ${msg}`),
    debug: (msg) => options.logs && strapi.log.debug(`[cache] ${msg}`),
    warn: (msg, ...rest) =>
      options.logs && strapi.log.warn(`[cache] ${msg}`, ...rest),
    error: (msg, ...rest) =>
      options.logs && strapi.log.error(`[cache] ${msg}`, ...rest),
  };
}

module.exports = createLogger;
