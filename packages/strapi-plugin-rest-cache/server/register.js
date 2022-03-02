'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  const store = strapi.plugin('rest-cache').service('cacheStore');

  // watch for changes in any roles -> clear all cache
  // need to be done before lifecycles are registered
  if (strapi.plugin('users-permissions')) {
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.role'],
      async beforeDelete() {
        await store.reset();
      },
    });
  }
};
