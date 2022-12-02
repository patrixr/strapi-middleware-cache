'use strict';

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
function createCacheStoreService({ strapi }) {
  /**
   * @type {CacheProvider}
   */
  let provider;
  let initialized = false;

  const pluginConfig = strapi.config.get('plugin.rest-cache');
  const { getTimeout } = pluginConfig.provider;
  const { keysPrefix } = pluginConfig.strategy;
  const keysPrefixRe = keysPrefix ? new RegExp(`^${keysPrefix}`) : null;

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
        async () => deserialize(await provider.get(`${keysPrefix}${key}`)),
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
        return provider.set(`${keysPrefix}${key}`, serialize(val), maxAge);
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
        return provider.del(`${keysPrefix}${key}`);
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
        return provider.keys(keysPrefix).then((keys) => {
          if (!keysPrefixRe) {
            return keys;
          }

          return keys
            .filter((key) => keysPrefixRe.test(key))
            .map((key) => key.replace(keysPrefixRe, ''));
        });
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
        return this.keys().then((keys) =>
          Promise.all(keys.map((key) => this.del(key)))
        );
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

    /**
     * @param {RegExp[]} regExps
     */
    async clearByRegexp(regExps = []) {
      const keys = (await this.keys()) || [];

      /**
       * @param {string} key
       */
      const shouldDel = (key) =>
        regExps.find((r) => r.test(key.replace(keysPrefix, '')));

      /**
       * @param {string} key
       */
      const del = (key) => this.del(key);

      await Promise.all(keys.filter(shouldDel).map(del));
    },

    /**
     * @param {string} uid
     * @param {any} params
     * @param {boolean=} wildcard
     */
    async clearByUid(uid, params = {}, wildcard = false) {
      const { strategy } = strapi.config.get('plugin.rest-cache');

      const cacheConfigService = strapi
        .plugin('rest-cache')
        .service('cacheConfig');

      const cacheConf = cacheConfigService.get(uid);

      if (!cacheConf) {
        throw new Error(
          `Unable to clear cache: no configuration found for contentType "${uid}"`
        );
      }

      const regExps = cacheConfigService.getCacheKeysRegexp(
        uid,
        params,
        wildcard
      );

      if (strategy.clearRelatedCache) {
        for (const relatedUid of cacheConf.relatedContentTypeUid) {
          if (cacheConfigService.isCached(relatedUid)) {
            // clear all cache because we can't predict uri params
            regExps.push(
              ...cacheConfigService.getCacheKeysRegexp(relatedUid, {}, true)
            );
          }
        }
      }

      await this.clearByRegexp(regExps);
    },
  };
}

module.exports = {
  createCacheStoreService,
};
