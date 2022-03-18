'use strict';

const { createPurgeController: purge } = require('./purge');
const { createConfigController: config } = require('./config');

const controllers = {
  purge,
  config,
};

module.exports = {
  controllers,
};
