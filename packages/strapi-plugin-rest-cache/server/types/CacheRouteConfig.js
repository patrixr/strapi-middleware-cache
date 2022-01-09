const routeParamNameRegex = /:([^/]+)/g;

class CacheRouteConfig {
  /**
   * @type {string}
   */
  path;

  /**
   * @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'}
   */
  method = 'GET';

  constructor(options) {
    if (!options) return;

    const { path, method = 'GET' } = options;
    this.path = path;
    this.method = method;
  }

  get paramNames() {
    return this.path.match(routeParamNameRegex) || [];
  }
}

module.exports = {
  CacheRouteConfig,
};
