---
title: Getting started
next: /documentation/configuration
---

::: tip
This plugin is only compatible with Strapi v4.0.0 and above.
:::


## Step 1: Install the plugin

:::: code-group
::: code-group-item In-Memory Cache

```bash
yarn add \
  strapi-plugin-rest-cache \
  strapi-provider-rest-cache-memory
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
[https://github.com/derrickmehaffy/strapi-plugin-redis/](https://github.com/derrickmehaffy/strapi-plugin-redis/)
:::
:::
::::


## Step 2: Enable the plugin


:::: code-group
::: code-group-item In-Memory Cache
@[code js{4-20}](../samples/config/plugins.memory.js)
:::
::: code-group-item Redis Cache
@[code js{10-27}](../samples/config/plugins.redis.js)
::: warning
Ensure `redis` configuration come before `strapi-plugin-rest-cache`
:::
:::
::::
