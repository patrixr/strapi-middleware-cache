/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

const { CacheProvider } = require('./types');
const { resolveUserStrategy } = require('./utils/config/resolveUserStrategy');
const { createRouter } = require('./utils/middlewares/createRouter');

const permissionsActions = require('./permissions-actions');

const createProvider = (providerConfig, { strapi }) => {
  const providerName = providerConfig.name.toLowerCase();
  let provider;

  let modulePath;
  try {
    modulePath = require.resolve(`strapi-provider-rest-cache-${providerName}`);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      modulePath = providerName;
    } else {
      throw error;
    }
  }

  try {
    // eslint-disable-next-line
    provider = require(modulePath);
  } catch (err) {
    throw new Error(
      `Could not load REST Cache provider "${providerName}". You may need to install a provider plugin "yarn add strapi-provider-rest-cache-${providerName}".`
    );
  }

  const providerInstance = provider.init(providerConfig.options, { strapi });

  if (!(providerInstance instanceof CacheProvider)) {
    throw new Error(
      `Could not load REST Cache provider "${providerName}". The package "strapi-provider-rest-cache-${providerName}" does not export a CacheProvider instance.`
    );
  }

  return Object.freeze(providerInstance);
};

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = async ({ strapi }) => {
  // resolve user configuration, check for missing or invalid options
  const pluginOption = strapi.config.get('plugin.strapi-plugin-rest-cache');
  const strategy = resolveUserStrategy(strapi, pluginOption.strategy);
  strapi.config.set('plugin.strapi-plugin-rest-cache', {
    ...pluginOption,
    strategy,
  });

  // register cache provider
  const provider = createProvider(pluginOption.provider, { strapi });
  strapi
    .plugin('strapi-plugin-rest-cache')
    .service('cacheStore')
    .init(provider);

  // boostrap plugin permissions
  await strapi.admin.services.permission.actionProvider.registerMany(
    permissionsActions.actions
  );

  // boostrap cache middlewares
  const router = createRouter(strapi, strategy);
  strapi.server.use(router.routes());
};
