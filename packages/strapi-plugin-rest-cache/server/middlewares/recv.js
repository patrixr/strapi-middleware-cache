'use strict';

/**
 * @typedef {import('../types').CacheRouteConfig} CacheRouteConfig
 */

const chalk = require('chalk');
const debug = require('debug')('strapi:strapi-plugin-rest-cache');

const { generateCacheKey } = require('../utils/keys/generateCacheKey');
const { shouldLookup } = require('../utils/middlewares/shouldLookup');
const { etagGenerate } = require('../utils/etags/etagGenerate');
const { etagLookup } = require('../utils/etags/etagLookup');
const { etagMatch } = require('../utils/etags/etagMatch');

/**
 * @param {{ cacheRouteConfig: CacheRouteConfig }} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }} context
 */
function createRecv(options, { strapi }) {
  if (!options?.cacheRouteConfig) {
    throw new Error(
      'REST Cache: unable to initialize recv middleware: options.cacheRouteConfig is required'
    );
  }
  const store = strapi.plugin('rest-cache').service('cacheStore');
  const { strategy } = strapi.config.get('plugin.rest-cache');
  const { cacheRouteConfig } = options;
  const { hitpass, maxAge, keys } = cacheRouteConfig;
  const { enableEtag = false, enableXCacheHeaders = false } = strategy;

  return async function recv(ctx, next) {
    // hash
    const cacheKey = generateCacheKey(ctx, keys);

    // hitpass check
    const lookup = shouldLookup(ctx, hitpass);

    // keep track of the etag
    let etagCached = null;

    if (lookup) {
      // lookup cached etag
      if (enableEtag) {
        etagCached = await etagLookup(cacheKey);

        if (etagCached && etagMatch(ctx, etagCached)) {
          if (enableXCacheHeaders) {
            ctx.set('X-Cache', 'HIT');
          }

          // etag match -> send HTTP 304 Not Modified
          ctx.body = null;
          ctx.status = 304;
          return;
        }

        // etag miss
      }

      const cacheEntry = await store.get(cacheKey);

      // hit cache
      if (cacheEntry) {
        debug(`[RECV] GET ${cacheKey} ${chalk.green('HIT')}`);

        if (enableXCacheHeaders) {
          ctx.set('X-Cache', 'HIT');
        }

        if (etagCached) {
          // send back cached etag on hit
          ctx.set('ETag', `"${etagCached}"`);
        }

        ctx.status = 200;
        ctx.body = cacheEntry;
        return;
      }
    }

    // fetch backend
    await next();

    // fetch done
    if (!lookup) {
      debug(`[RECV] GET ${cacheKey} ${chalk.magenta('HITPASS')}`);

      if (enableXCacheHeaders) {
        ctx.set('X-Cache', 'HITPASS');
      }

      // do not store hitpass response content
      return;
    }

    // deliver
    debug(`[RECV] GET ${cacheKey} ${chalk.yellow('MISS')}`);

    if (enableXCacheHeaders) {
      ctx.set('X-Cache', 'MISS');
    }

    if (ctx.body && ctx.status >= 200 && ctx.status <= 300) {
      // @TODO check Cache-Control response header

      if (enableEtag) {
        const etag = etagGenerate(ctx, cacheKey);

        ctx.set('ETag', `"${etag}"`);

        // persist etag asynchronously
        store.set(`${cacheKey}_etag`, etag, maxAge).catch(() => {
          debug(
            `[RECV] GET ${cacheKey} ${chalk.yellow(
              'Unable to store ETag in cache'
            )}`
          );
        });
      }

      // persist cache asynchronously
      store.set(cacheKey, ctx.body, maxAge).catch(() => {
        debug(
          `[RECV] GET ${cacheKey} ${chalk.yellow(
            'Unable to store Content in cache'
          )}`
        );
      });
    }
  };
}

module.exports = {
  createRecv,
};
