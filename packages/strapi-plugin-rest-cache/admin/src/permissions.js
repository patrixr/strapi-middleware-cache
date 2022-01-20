// import pluginId from './pluginId';

const pluginPermissions = {
  purge: [
    { action: `plugin::strapi-plugin-rest-cache.cache.purge`, subject: null },
  ],
  readStrategy: [
    {
      action: `plugin::strapi-plugin-rest-cache.cache.read-strategy`,
      subject: null,
    },
  ],
  readProvider: [
    {
      action: `plugin::strapi-plugin-rest-cache.cache.read-provider`,
      subject: null,
    },
  ],
};

export default pluginPermissions;
