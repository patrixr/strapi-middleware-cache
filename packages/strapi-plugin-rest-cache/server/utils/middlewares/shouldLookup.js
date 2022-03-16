'use strict';

function shouldLookup(ctx, cacheRouteConfig) {
  const type = cacheRouteConfig.hitpass;

  if (typeof type === 'function') {
    return !cacheRouteConfig.hitpass(ctx);
  }

  if (typeof type === 'boolean') {
    return !cacheRouteConfig.hitpass;
  }

  return false;
}

module.exports = shouldLookup;
