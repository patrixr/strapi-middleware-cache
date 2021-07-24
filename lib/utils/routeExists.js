/**
 * Check if a custom route is registered in strapi
 *
 * @param {any} strapi
 * @param {CustomRoute} route
 * @return {boolean}
 */
function routeExists(strapi, route) {
  // check api routes
  const match = strapi.config.routes.find((apiRoute) => {
    return (
      apiRoute.method === route.method &&
      apiRoute.path.match(new RegExp(`${route.path}/?`)) // match with optional leading slash
    );
  });

  if (match) {
    return true;
  }

  const plugins = Object.keys(strapi.plugins);

  // check plugins routes
  for (const plugin of plugins) {
    if (!strapi.plugins[plugin]?.config?.routes) {
      continue;
    }

    const matchPlugin = strapi.plugins[plugin].config.routes.find(
      (pluginRoute) => {
        return (
          pluginRoute.method === route.method &&
          `/${plugin}${pluginRoute.path}`.match(new RegExp(`${route.path}/?`)) // match with optional leading slash
        );
      }
    );

    if (matchPlugin) {
      return true;
    }
  }

  return false;
}

module.exports = routeExists;
