'use strict';

/**
 * @typedef {import('../types').CacheRouteConfig} CacheRouteConfig
 */

const crypto = require('crypto');
const chalk = require('chalk');
const debug = require('debug')('strapi:strapi-plugin-rest-cache');
const generateCacheKey = require('../utils/middlewares/generateCacheKey');

/**
 * @param {{ cacheRouteConfig: CacheRouteConfig }} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }} context
 */
module.exports = (options, { strapi }) => {
  const { cacheRouteConfig } = options;

  if (!cacheRouteConfig) {
    throw new Error(
      'REST Cache: unable to initialize recv middleware: options.cacheRouteConfig is required'
    );
  }

  const store = strapi.plugin('rest-cache').service('cacheStore');
  const { strategy } = strapi.config.get('plugin.rest-cache');

  return async (ctx, next) => {
    // hash
    const cacheKey = `${ctx.request.path}?${generateCacheKey(
      cacheRouteConfig,
      ctx
    )}`;

    // hitpass check
    const lookup = !(
      (typeof cacheRouteConfig.hitpass === 'function' &&
        cacheRouteConfig.hitpass(ctx)) ||
      (typeof cacheRouteConfig.hitpass === 'boolean' &&
        cacheRouteConfig.hitpass)
    );

    if (lookup) {
      // lookup
      if (strategy.enableEtag) {
        const ifNoneMatch = ctx.request.headers['if-none-match'];
        const etagEntry = await store.get(`${cacheKey}_etag`);
        const etagMatch = ifNoneMatch === etagEntry;

        if (!etagMatch) {
          ctx.set('ETag', etagEntry);
        } else {
          debug(`[RECV] GET ${cacheKey} ${chalk.green('HIT')}`);

          if (strategy.enableXCacheHeaders) {
            ctx.set('X-Cache', 'HIT');
          }

          ctx.status = 304;
          return;
        }
      }

      const cacheEntry = await store.get(cacheKey);

      // hit cache
      if (cacheEntry) {
        debug(`[RECV] GET ${cacheKey} ${chalk.green('HIT')}`);

        if (strategy.enableXCacheHeaders) {
          ctx.set('X-Cache', 'HIT');
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

      if (strategy.enableXCacheHeaders) {
        ctx.set('X-Cache', 'HITPASS');
      }

      // do not store hitpass response content
      return;
    }

    // deliver
    debug(`[RECV] GET ${cacheKey} ${chalk.yellow('MISS')}`);

    if (strategy.enableXCacheHeaders) {
      ctx.set('X-Cache', 'MISS');
    }

    if (ctx.body && ctx.status >= 200 && ctx.status <= 300) {
      // @TODO check Cache-Control response header
      await store.set(cacheKey, ctx.body, cacheRouteConfig.maxAge);

      if (strategy.enableEtag) {
        const etag = crypto
          .createHash('md5')
          .update(JSON.stringify(ctx.body))
          .digest('hex');

        ctx.set('ETag', `"${etag}"`);

        await store.set(
          `${cacheKey}_etag`,
          `"${etag}"`,
          cacheRouteConfig.maxAge
        );
      }
    }
  };
};
