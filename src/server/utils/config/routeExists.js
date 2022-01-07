/**
 * @typedef {import('../../types').CacheRouteConfig} CacheRouteConfig
 * @typedef {import('strapi-supercharged').Strapi} Strapi
 */

/**
 * Check if a custom route is registered in strapi
 *
 * @param {Strapi} strapi
 * @param {CacheRouteConfig} route
 * @return {boolean}
 */
function routeExists(strapi, route) {
  // check api routes
  const match = strapi.server.listRoutes().find(
    (routeLayer) =>
      routeLayer.methods.includes(route.method) &&
      routeLayer.path.match(new RegExp(`${route.path}/?`)) // match with optional leading slash
  );

  return match;
}

module.exports = { routeExists };
