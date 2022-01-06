'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const services = require('./services');
const config = require('./config');
const middlewares = require('./middlewares');

module.exports = {
  register,
  bootstrap,
  destroy: () => {},
  config,
  controllers: {},
  routes: [],
  services,
  contentTypes: {},
  policies: {},
  middlewares,
};
