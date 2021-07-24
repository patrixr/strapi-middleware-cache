const chalk = require('chalk');
const crypto = require('crypto');
const generateCacheKey = require('./generateCacheKey');

/**
 * @param {CacheStore} store
 * @param {MiddlewareCacheConfig} options
 * @param {Logger} logger
 * @return {RecvFn}
 */
function createRecv(store, options, logger) {
  /**
   * Creates a Koa middleware that receive cachable requests of a given model
   *
   * @param {ModelCacheConfig} cacheConf
   * @return {KoaRouteMiddleware}
   */
  return function recv(cacheConf) {
    return async function recvMiddleware(ctx, next) {
      // hash
      const cacheKey = generateCacheKey(cacheConf, ctx);

      // hitpass check
      const lookup = !(
        (typeof cacheConf.hitpass === 'function' && cacheConf.hitpass(ctx)) ||
        (typeof cacheConf.hitpass === 'boolean' && cacheConf.hitpass)
      );

      if (lookup) {
        // lookup
        if (options.enableEtagSupport) {
          const ifNoneMatch = ctx.request.headers['if-none-match'];
          const etagEntry = await store.get(`${cacheKey}_etag`);
          const etagMatch = ifNoneMatch === etagEntry;

          if (!etagMatch) {
            ctx.set('ETag', etagEntry);
          } else {
            logger.debug(`GET ${ctx.path} ${chalk.green('HIT')}`);

            if (options.enableXCacheHeaders) {
              ctx.set('X-Cache', 'HIT');
            }

            ctx.status = 304;
            return;
          }
        }

        const cacheEntry = await store.get(cacheKey);

        // hit cache
        if (cacheEntry) {
          logger.debug(`GET ${ctx.path} ${chalk.green('HIT')}`);

          if (options.enableXCacheHeaders) {
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
        logger.debug(`GET ${ctx.path} ${chalk.magenta('HITPASS')}`);

        if (options.enableXCacheHeaders) {
          ctx.set('X-Cache', 'HITPASS');
        }

        // do not store hitpass response content
        return;
      }

      // deliver
      logger.debug(`GET ${ctx.path} ${chalk.yellow('MISS')}`);

      if (options.enableXCacheHeaders) {
        ctx.set('X-Cache', 'MISS');
      }

      if (ctx.body && ctx.status == 200) {
        // @TODO check Cache-Control response header
        await store.set(cacheKey, ctx.body, cacheConf.maxAge);

        if (options.enableEtagSupport) {
          const etag = crypto
            .createHash('md5')
            .update(JSON.stringify(ctx.body))
            .digest('hex');

          ctx.set('ETag', `"${etag}"`);

          await store.set(`${cacheKey}_etag`, `"${etag}"`, cacheConf.maxAge);
        }
      }
    };
  };
}

module.exports = createRecv;
