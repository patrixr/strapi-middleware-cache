const chalk = require('chalk');
const crypto = require('crypto');
const generateCacheKey = require('../utils/middlewares/generateCacheKey');

/**
 * @param {{ contentType: string }} options
 * @param {{ strapi: import('@strapi/strapi').Strapi }} context
 */
module.exports = (options, { strapi }) => {
  if (!options.contentType) {
    throw new Error(
      'Unable to initialize recv cache middleware: options.contentType is required'
    );
  }

  const store = strapi.plugin('strapi-middleware-cache').service('cacheStore');
  const pluginOptions = strapi.config.get('plugin.strapi-middleware-cache');

  const cacheConf = strapi
    .plugin('strapi-middleware-cache')
    .service('cacheConfig')
    .get(options.contentType);

  if (!cacheConf) {
    throw new Error(
      `Unable to initialize recv cache middleware: no configuration found for contentType "${options.contentType}"`
    );
  }

  return async (ctx, next) => {
    // hash
    const cacheKey = generateCacheKey(cacheConf, ctx);

    // hitpass check
    const lookup = !(
      (typeof cacheConf.hitpass === 'function' && cacheConf.hitpass(ctx)) ||
      (typeof cacheConf.hitpass === 'boolean' && cacheConf.hitpass)
    );

    if (lookup) {
      // lookup
      if (pluginOptions.enableEtagSupport) {
        const ifNoneMatch = ctx.request.headers['if-none-match'];
        const etagEntry = await store.get(`${cacheKey}_etag`);
        const etagMatch = ifNoneMatch === etagEntry;

        if (!etagMatch) {
          ctx.set('ETag', etagEntry);
        } else {
          strapi.log.debug(`GET ${ctx.path} ${chalk.green('HIT')}`);

          if (pluginOptions.enableXCacheHeaders) {
            ctx.set('X-Cache', 'HIT');
          }

          ctx.status = 304;
          return;
        }
      }

      const cacheEntry = await store.get(cacheKey);

      // hit cache
      if (cacheEntry) {
        strapi.log.debug(`GET ${ctx.path} ${chalk.green('HIT')}`);

        if (pluginOptions.enableXCacheHeaders) {
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
      strapi.log.debug(`GET ${ctx.path} ${chalk.magenta('HITPASS')}`);

      if (pluginOptions.enableXCacheHeaders) {
        ctx.set('X-Cache', 'HITPASS');
      }

      // do not store hitpass response content
      return;
    }

    // deliver
    strapi.log.debug(`GET ${ctx.path} ${chalk.yellow('MISS')}`);

    if (pluginOptions.enableXCacheHeaders) {
      ctx.set('X-Cache', 'MISS');
    }

    if (ctx.body && ctx.status == 200) {
      // @TODO check Cache-Control response header
      await store.set(cacheKey, ctx.body, cacheConf.maxAge);

      if (pluginOptions.enableEtagSupport) {
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
