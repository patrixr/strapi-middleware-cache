---
title: Debug mode
---

# Debug mode

This plugins use [debug](https://www.npmjs.com/package/debug) module to log messages that can help during development.
You can enable debug mode by setting the environment variable `DEBUG=strapi:strapi-plugin-rest-cache` before starting strapi.

eg. `DEBUG=strapi:strapi-plugin-rest-cache yarn strapi develop`

You can also enable debug mode by setting the [`config.strategy.debug`](./index.md#debug) configuration option to `true`.
