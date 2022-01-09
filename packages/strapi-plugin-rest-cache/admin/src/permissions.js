import pluginId from './pluginId';

const pluginPermissions = {
  purgeCache: [{ action: `plugin::${pluginId}.cache.purge`, subject: null }],
  readCache: [{ action: `plugin::${pluginId}.cache.read`, subject: null }],
};

export default pluginPermissions;
