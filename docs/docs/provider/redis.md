---
sidebar_label: Redis Provider
sidebar_position: 3
---

# Redis provider

## Installation

<Tabs>
<TabItem value="yarn" label="Yarn">

```bash
yarn add \
  strapi-plugin-rest-cache \
  strapi-plugin-redis \
  strapi-provider-rest-cache-redis
```

</TabItem>

<TabItem value="npm" label="NPM">

```bash
npm install \
  strapi-plugin-rest-cache \
  strapi-plugin-redis \
  strapi-provider-rest-cache-redis
```

</TabItem>
</Tabs>

## Configuration

:::warning
Ensure `redis` plugin configuration come before `strapi-plugin-rest-cache`
:::

```js title="File: ./config/plugins.js"
module.exports = {
  // Step 1: Configure the redis connection
  // @see https://github.com/strapi-community/strapi-plugin-redis
  redis: {
    // ...
  },
  // Step 2: Configure the redis cache plugin
  "rest-cache": {
    config: {
      provider: {
        name: "redis",
        options: {
          max: 32767,
          connection: "default",
        },
      },
      strategy: {
        // if you are using keyPrefix for your Redis, please add <keysPrefix>
        keysPrefix: "<redis_keyPrefix>",
        contentTypes: [
          // list of Content-Types UID to cache
          "api::category.category",
          "api::article.article",
          "api::global.global",
          "api::homepage.homepage",
        ],
      },
    },
  },
};
```
