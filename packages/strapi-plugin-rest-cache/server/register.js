'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  // @todo: use cache provider instead of hard-coded LRU
  const store = strapi.plugin('rest-cache').service('cacheStore');

  // watch for changes in any roles -> clear all cache
  // need to be done before lifecycles are registered
  // @todo: can we use strapi.eventHub instead of lifecycles?
  if (strapi.plugin('users-permissions')) {
    const role = strapi.plugin('users-permissions').contentType('role');

    if (!role.lifecycles) {
      role.lifecycles = {
        async afterUpdate() {
          strapi.log.info('A role has been updated, invalidating cache...');
          await store.reset();
        },
      };
    } else if (role.lifecycles.afterUpdate) {
      const originalAfterUpdate = role.lifecycles.afterUpdate;
      role.lifecycles = {
        ...role.lifecycles,
        async afterUpdate(event) {
          strapi.log.info('A role has been updated, invalidating cache...');
          await originalAfterUpdate(event);
          await store.reset();
        },
      };
    } else {
      role.lifecycles = {
        ...role.lifecycles,
        async afterUpdate() {
          strapi.log.info('A role has been updated, invalidating cache...');
          await store.reset();
        },
      };
    }
  }
};
