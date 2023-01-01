---
title: Couchbase provider
---

# Couchbase provider

## Installation

```bash
yarn add \
  strapi-plugin-rest-cache \
  strapi-provider-rest-cache-couchbase
```

## Configuration

```js
module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "couchbase",
        max: 32767,
        options: {
          connectionString: "couchbase://127.0.0.1:8091",
          connectionOptions: {
            username: "Administrator",
            password: "couchbase",
          },
          bucket: "test-bucket",
          ttl: 2,
        },
      },
      strategy: {
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

::: warning
Ensure `redis` plugin configuration come before `strapi-plugin-rest-cache`
:::
