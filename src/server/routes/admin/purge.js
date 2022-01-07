const pluginId = require('../../pluginId');

module.exports = [
  {
    method: 'GET',
    path: '/purge',
    handler: 'purge.index',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: [`plugin::${pluginId}.cache.purge`] },
        },
      ],
    },
  },
];
