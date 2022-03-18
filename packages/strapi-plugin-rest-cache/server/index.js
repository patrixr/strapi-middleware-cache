'use strict';

const { bootstrap } = require('./bootstrap');
const { services } = require('./services');
const { config } = require('./config');
const { controllers } = require('./controllers');
const { middlewares } = require('./middlewares');
const { routes } = require('./routes');

module.exports = {
  bootstrap,
  destroy() {},
  config,
  controllers,
  routes,
  services,
  contentTypes: {},
  policies: {},
  middlewares,
};
