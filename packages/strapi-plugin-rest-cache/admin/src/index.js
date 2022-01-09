import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginPermissions from './permissions';
import pluginId from './pluginId';

import Initializer from './components/Initializer';
import PluginIcon from './components/PluginIcon';
import EntityCacheInformation from './components/EntityCacheInformation';
import InvalidateEntityButton from './components/InjectedCMEditViewCacheComponent';
// import PurgeContentTypeButton from './components/PurgeContentTypeButton';

const { name } = pluginPkg.strapi;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: 'My plugin',
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "my-plugin" */ './pages/App'
        );

        return component;
      },
      permissions: pluginPermissions.readCache, // array of permissions (object), allow a user to access a plugin depending on its permissions
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },
  bootstrap(app) {
    // execute some bootstrap code
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'EntityCacheInformation',
      Component: EntityCacheInformation,
      permissions: pluginPermissions.readCache,
    });
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'InvalidateEntityButton',
      Component: InvalidateEntityButton,
      permissions: pluginPermissions.purgeCache,
    });
    app.injectContentManagerComponent('listView', 'actions', {
      name: 'PurgeContentTypeButton',
      Component: InvalidateEntityButton,
      permissions: pluginPermissions.purgeCache,
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
