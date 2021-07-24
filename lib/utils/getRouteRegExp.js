const arrayEquals = require('./arrayEquals');

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
      pattern = pattern.replace(`:${paramName}`, '([^/]+)');
    }

    return [new RegExp(`^${pattern}\\?`)];
  }

  if (!params) {
    return [];
  }

  const paramNames = Object.keys(params);
  const regExps = [];

  // route contains :xxx -> check if xxx is in params key -> clear
  if (arrayEquals(route.paramNames, paramNames)) {
    let pattern = route.path;
    for (const paramName of paramNames) {
      pattern = pattern.replace(`:${paramName}`, params[paramName]);
    }
    regExps.push(new RegExp(`^${pattern}\\?`));
  }

  return regExps;
}

module.exports = getRouteRegExp;
