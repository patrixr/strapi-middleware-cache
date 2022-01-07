const pluginId = require('./pluginId');

module.exports = {
  actions: [
    {
      section: 'plugins',
      displayName: 'Purge caches',
      uid: 'cache.purge',
      subCategory: 'cache',
      pluginName: pluginId,
    },
    {
      section: 'plugins',
      displayName: 'View cache infos',
      uid: 'cache.read',
      subCategory: 'cache',
      pluginName: pluginId,
    },
  ],
};
