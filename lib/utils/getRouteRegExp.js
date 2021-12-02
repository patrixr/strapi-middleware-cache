const arrayEquals = require('./arrayEquals');

/**
 * @typedef {import('strapi-middleware-cache').ModelCacheParams} ModelCacheParams
 * @typedef {import('strapi-middleware-cache').CustomRoute} CustomRoute
 * @typedef {import('koa').Context} Context
 */

/**
 * Get regexs to match CustomRoute keys with given params
 *
 * @param {CustomRoute} route
 * @param {ModelCacheParams} params
 * @param {boolean=} wildcard
 * @return {RegExp[]}
 */
function getRouteRegExp(route, params, wildcard = false) {
  // route not contains any params -> clear
  if (!route.paramNames || !route.paramNames.length) {
    return [new RegExp(`^${route.path}\\?`)];
  }

  // wildcard: clear all routes
  if (wildcard) {
    let pattern = route.path;
    for (const paramName of route.paramNames) {
      pattern = pattern.replace(paramName, '([^/]+)');
    }

    return [new RegExp(`^${pattern}\\?`)];
  }

  if (!params) {
    return [];
  }

  const paramNames = Object.keys(params).map((param) => param.replace(':', ''));
  const routeParams = route.paramNames.map((param) => param.replace(':', ''));
  const regExps = [];

  // route contains :xxx -> check if xxx is in params key -> clear
  if (arrayEquals(routeParams, paramNames)) {
    let pattern = route.path;
    for (const paramName of paramNames) {
      pattern = pattern.replace(
        `:${paramName}`,
        params[paramName] || params[`:${paramName}`]
      );
    }
    regExps.push(new RegExp(`^${pattern}\\?`));
  }

  return regExps;
}

module.exports = getRouteRegExp;
