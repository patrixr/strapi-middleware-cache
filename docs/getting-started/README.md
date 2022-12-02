---
title: Getting started
next: /documentation/
---

::: warning
This plugin is only compatible with Strapi v4.0.0 and above.  
If you are looking for a plugin for Strapi v3.x, please check the [strapi-middleware-cache](https://github.com/patrixr/strapi-middleware-cache/).
:::

## Step 1: Install the plugin

:::: code-group
::: code-group-item In-Memory Cache

```bash
yarn add strapi-plugin-rest-cache
```

:::
::: code-group-item Redis Cache

```bash
yarn add \
  strapi-plugin-rest-cache \
  strapi-plugin-redis \
  strapi-provider-rest-cache-redis
```

::: tip
This plugin use `strapi-plugin-redis` to handle the connection with Redis.
[https://github.com/strapi-community/strapi-plugin-redis/](https://github.com/strapi-community/strapi-plugin-redis/)
:::
:::
::: code-group-item Couchbase Cache

```bash
yarn add \
  strapi-plugin-rest-cache \
  strapi-provider-rest-cache-couchbase
```

:::
::::

## Step 2: Enable the plugin

:::: code-group
::: code-group-item In-Memory Cache
@[code js{4-23}](../samples/config/plugins.memory.js)
:::
::: code-group-item Redis Cache
@[code js{10-29}](../samples/config/plugins.redis.js)
::: warning
Ensure `redis` configuration come before `strapi-plugin-rest-cache`
:::
:::
::: code-group-item Couchbase Cache
@[code js{4-29}](../samples/config/plugins.couchbase.js)
:::
::::
