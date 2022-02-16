'use strict';

const configRoutes = require('./config');
const purgeRoutes = require('./purge');

module.exports = {
  type: 'admin',
  routes: [...configRoutes, ...purgeRoutes],
};
