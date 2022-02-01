'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const services = require('./services');
const config = require('./config');
const controllers = require('./controllers');
const middlewares = require('./middlewares');
const routes = require('./routes');

module.exports = {
  register,
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
