"use strict";

process.env.NODE_ENV = 'test';

const Strapi = require("@strapi/strapi");

async function setup() {
  Strapi({
    dir: __dirname,
  });
  await strapi.start();

  return Promise.resolve(strapi);
}

// eslint-disable-next-line no-console
setup().catch(console.error);
