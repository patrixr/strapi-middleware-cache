"use strict";

const { existsSync, unlinkSync } = require("fs");
const Strapi = require("@strapi/strapi");
const supertest = require("supertest");
const { join } = require("path");

let adminToken;

function agent() {
  return supertest.agent(strapi.server.httpServer);
}
function adminAgent() {
  return supertest
    .agent(strapi.server.httpServer)
    .auth(adminToken, { type: "bearer" });
}

async function setup() {
  Strapi({
    dir: join(__dirname, "../../"),
  });
  await strapi.start();

  // create first admin
  await agent().post("/admin/register-admin").send({
    email: "admin@strapi.io",
    firstname: "admin",
    lastname: "admin",
    password: "Password123",
  });

  const response = await agent().post("/admin/login").send({
    email: "admin@strapi.io",
    password: "Password123",
  });

  adminToken = response.body.data.token;

  return Promise.resolve(strapi);
}

async function teardown() {
  const dbSettings = strapi.config.get("database.connection.connection");

  // close server to release the db-file
  await strapi.destroy();

  // delete test database after all tests
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${dbSettings.filename}`;

    if (existsSync(tmpDbFile)) {
      unlinkSync(tmpDbFile);
    }
  }

  return Promise.resolve();
}

module.exports = {
  setup,
  teardown,
  agent,
  adminAgent,
};
