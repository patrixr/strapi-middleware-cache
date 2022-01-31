/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 * @typedef {import('../types').CacheProvider} CacheProvider
 */
const chalk = require('chalk');
const debug = require('debug')('strapi:strapi-plugin-rest-cache');

const { serialize } = require('../utils/store/serialize');
const { deserialize } = require('../utils/store/deserialize');
const { withTimeout } = require('../utils/store/withTimeout');

// @todo: use cache provider instead of hard-coded LRU

/**
 * @param {{ strapi: Strapi }} strapi
 */
module.exports = ({ strapi }) => {
  /**
   * @type {CacheProvider}
   */
  let provider;
  let initialized = false;

  const pluginConfig = strapi.config.get('plugin.strapi-plugin-rest-cache');
  const { getTimeout } = pluginConfig.provider;

  return {
    /**
     * @param {CacheProvider} provider
     */
    async init(newProvider) {
      provider = newProvider;
      initialized = true;
    },

    /**
     * @param {string} key
     */
    async get(key) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      if (!this.ready) {
        strapi.log.error('REST Cache provider not ready');
        return null;
      }

      return withTimeout(
        async () => deserialize(await provider.get(key)),
        getTimeout
      ).catch((error) => {
        if (error?.message === 'timeout') {
          strapi.log.error(
            `REST Cache provider timed-out after ${getTimeout}ms.`
          );
        } else {
          strapi.log.error(`REST Cache provider errored:`);
          strapi.log.error(error);
        }
        return null;
      });
    },

    /**
     * @param {string} key
     * @param {any} val
     * @param {number=} maxAge
     */
    async set(key, val, maxAge = 3600) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      if (!this.ready) {
        strapi.log.error('REST Cache provider not ready');
        return null;
      }

      try {
        return provider.set(key, serialize(val), maxAge);
      } catch (error) {
        strapi.log.error(`REST Cache provider errored:`);
        strapi.log.error(error);
        return null;
      }
    },

    /**
     * @param {string} key
     */
    async del(key) {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      if (!this.ready) {
        strapi.log.error('REST Cache provider not ready');
        return null;
      }

      try {
        debug(`${chalk.redBright('[PURGING KEY]')}: ${key}`);
        return provider.del(key);
      } catch (error) {
        strapi.log.error(`REST Cache provider errored:`);
        strapi.log.error(error);
        return null;
      }
    },

    async keys() {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      if (!this.ready) {
        strapi.log.error('REST Cache provider not ready');
        return null;
      }

      try {
        return provider.keys();
      } catch (error) {
        strapi.log.error(`REST Cache provider errored:`);
        strapi.log.error(error);
        return null;
      }
    },

    async reset() {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return null;
      }

      if (!this.ready) {
        strapi.log.error('REST Cache provider not ready');
        return null;
      }

      try {
        return provider.reset();
      } catch (error) {
        strapi.log.error(`REST Cache provider errored:`);
        strapi.log.error(error);
        return null;
      }
    },

    get ready() {
      if (!initialized) {
        strapi.log.error('REST Cache provider not initialized');
        return false;
      }

      return provider.ready;
    },
  };
};
