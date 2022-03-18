'use strict';

const { createCacheConfigService: cacheConfig } = require('./cacheConfig');
const { createCacheStoreService: cacheStore } = require('./cacheStore');

const services = {
  cacheConfig,
  cacheStore,
};

module.exports = { services };
