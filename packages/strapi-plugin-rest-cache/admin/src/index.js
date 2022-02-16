import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';

import Initializer from './components/Initializer';
import EditViewInfoInjectedComponent from './components/EditViewInfoInjectedComponent';
import EditViewInjectedComponent from './components/EditViewInjectedComponent';
import ListViewInjectedComponent from './components/ListViewInjectedComponent';

const { name } = pluginPkg.strapi;

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: true,
      name,
    });
  },
  bootstrap(app) {
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'EditViewInfoInjectedComponent',
      Component: EditViewInfoInjectedComponent,
    });
    app.injectContentManagerComponent('editView', 'right-links', {
      name: 'EditViewInjectedComponent',
      Component: EditViewInjectedComponent,
    });
    app.injectContentManagerComponent('listView', 'actions', {
      name: 'ListViewInjectedComponent',
      Component: ListViewInjectedComponent,
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) =>
        import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({
            data: prefixPluginTranslations(data, pluginId),
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }))
      )
    );

    return Promise.resolve(importedTrads);
  },
};
