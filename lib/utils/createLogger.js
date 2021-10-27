/**
 * @typedef {import('strapi-middleware-cache').MiddlewareCacheConfig} MiddlewareCacheConfig
 * @typedef {import('strapi-middleware-cache').Logger} Logger
 */

/**
 * @param {MiddlewareCacheConfig} options
 */
function createLogger(options) {
  return {
    /**
     * @param {string} msg
     */
    info: (msg) => options.logs && strapi.log.info(`[cache] ${msg}`),
    /**
     * @param {string} msg
     */
    debug: (msg) => options.logs && strapi.log.debug(`[cache] ${msg}`),
    /**
     * @param {string} msg
     * @param {any[]} rest
     */
    warn: (msg, ...rest) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      options.logs && strapi.log.warn(`[cache] ${msg}`, ...rest),
    /**
     * @param {string} msg
     * @param {any[]} rest
     */
    error: (msg, ...rest) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      options.logs && strapi.log.error(`[cache] ${msg}`, ...rest),
  };
}

module.exports = createLogger;
