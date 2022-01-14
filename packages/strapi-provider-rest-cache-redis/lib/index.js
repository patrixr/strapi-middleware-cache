/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */
const { RedisCacheProvider } = require("./RedisCacheProvider");

function waitForRedis(client) {
  return new Promise((resolve, reject) => {
    const onReady = () => {
      strapi.log.info('REST Cache provider "redis": connection established');

      // eslint-disable-next-line no-use-before-define
      client.off("error", onError);
      resolve();
    };
    const onError = (error) => {
      client.off("error", onReady);
      reject(
        new Error(
          `Could not initialize REST Cache provider "redis": ${error?.message}`
        )
      );
    };

    client.once("ready", onReady);
    client.once("error", onError);
  });
}

module.exports = {
  provider: "redis",
  name: "Redis",

  async init(options, { strapi }) {
    if (!strapi.redis) {
      throw new Error(
        `Could not initialize REST Cache provider "redis". The package "strapi-plugin-redis" is required.`
      );
    }

    const connectionName = options.connection || "default";
    const { client } = strapi.redis.connections[connectionName] ?? {};

    if (!client) {
      throw new Error(
        `Could not initialize REST Cache provider "redis". No connection found with name "${connectionName}".`
      );
    }

    return waitForRedis(client).then(
      () => new RedisCacheProvider(client, options)
    );
  },
};
