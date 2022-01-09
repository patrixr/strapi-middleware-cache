const { CachePluginStrategy } = require('./CachePluginStrategy');
const { routeParamNameRegex, CacheRouteConfig } = require('./CacheRouteConfig');
const { CacheProvider } = require('./CacheProvider');
const {
  defaultHitpass,
  CacheContentTypeConfig,
} = require('./CacheContentTypeConfig');

module.exports = {
  CachePluginStrategy,
  routeParamNameRegex,
  CacheRouteConfig,
  CacheProvider,
  defaultHitpass,
  CacheContentTypeConfig,
};
