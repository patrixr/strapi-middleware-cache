const pluginId = require('../../pluginId');

module.exports = [
  {
    method: 'GET',
    path: '/config',
    handler: 'config.index',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'plugin::content-manager.hasPermissions',
          config: { actions: [`plugin::${pluginId}.cache.read`] },
        },
      ],
    },
  },
];
