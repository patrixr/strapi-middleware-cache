'use strict';

/**
 * @typedef {import('../../types').CacheRouteConfig} CacheRouteConfig
 * @typedef {import('koa').Context} Context
 */

/**
 * Get regexs to match CustomRoute keys with given params
 *
 * @param {CacheRouteConfig} route
 * @param {any} params
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
      pattern = pattern
        .replace(new RegExp(`:${paramName}([^\\/#\\?]*)`, 'g'), '([^\\/#\\?]+)')
        .replace('//', '/');
    }

    return [new RegExp(`^${pattern}\\?`)];
  }

  if (!params) {
    return [];
  }

  const paramNames = Object.keys(params);
  const regExps = [];

  let pattern = route.path;
  for (const paramName of paramNames) {
    pattern = pattern
      .replace(new RegExp(`:${paramName}([^\\/#\\?]*)`, 'g'), params[paramName])
      .replace('//', '/');
  }

  // add if pattern does not contain any unresolved params
  if (!pattern.includes(':')) {
    regExps.push(new RegExp(`^${pattern}\\?`));
  }

  return regExps;
}

module.exports = { getRouteRegExp };
