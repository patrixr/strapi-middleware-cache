'use strict';

const { createRecv: recv } = require('./recv');
const { createPurge: purge } = require('./purge');
const { createPurgeAdmin: purgeAdmin } = require('./purgeAdmin');

const middlewares = {
  recv,
  purge,
  purgeAdmin,
};

module.exports = {
  middlewares,
};
