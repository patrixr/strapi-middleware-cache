---
title: Guide
---

# strapi-plugin-rest-cache

This plugin provide a way to cache **HTTP requests** in order to **improve performance**. It's get inspired by varnish cache which is a popular caching solution.

The cache content is stored by a **provider**, which can be either an in-memory provider, a redis connection, a file system, or any other custom provider.
You can set a **strategy** to tell what to cache and how much time responses should be cached. The cache will be invalidated when the related Content-Type is updated, so you **never have to worry about stale data**.

In addition, you can interact with the plugin through the admin panel, api admin routes or programmatically using internal services.

## Provider

By default, the **strapi-plugin-rest-cache** has no provider, you have to install one of the following providers:

- **strapi-provider-rest-cache-memory**: In-memory provider, it's not persisted and will be lost when the server restarts.
- **strapi-provider-rest-cache-redis**: Bridge between the cache plugin and the [strapi-plugin-redis](https://github.com/strapi-community/strapi-plugin-redis)

You have to set the provider name in the plugin configuration so it will be initialized once the plugin is bootstrapped. At this time only one provider can be used at a time.

You can also set the provider `getTimeout` which is the time in milliseconds to wait for the provider to respond, **if the provider is not responding, the cache will be considered as a miss**.

```js {6-17}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        // name can be an alias:
        name: "my-provider", // try to require 'strapi-provider-rest-cache-my-provider'
        // a full package name:
        name: "@org/my-cache-provider", // try to require '@org/my-cache-provider'
        // or a relative path:
        name: "../path/to/my-provider",

        // provider options
        getTimeout: 500, // in milliseconds (default: 500)
        options: {},
      },
      strategy: {
        // ...
      },
    },
  },
});
```

Note that each provider has its own configuration, so you will have to refer to the provider documentation to know how to configure it.

::: tip
Check the [memory provider](./memory-provider.html) and the [redis provider](./redis-provider.html) documentation for more details.
:::

## Strategy

The plugin will **only inject cache middleware to Content-Types which have been explicitely enabled**. This can be done by setting the `config.strategy.contentTypes` configuration.

It accept either a string or an object, so we can configure differently each Content-Type.

```js {9-20}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        // ...
      },
      strategy: /* @type {CachePluginStrategy} */ {
        contentTypes: /* @type {(string|CacheContentTypeConfig)[]} */ [
          // can be a string (the Content-Type UID)
          "api::article.article",

          // or a custom CacheContentTypeConfig object
          {
            contentType: "api::pages.pages",
            // ...
          },
        ],
      },
    },
  },
});
```

In addition to the **contentType** configuration, you can also set the default **maxAge**, **hitpass** and **keys** configuration, enables **ETag** and **X-Cache** headers or tune how the plugin will work for each route.

::: tip
Check the [`CachePluginStrategy`](./configuration-reference.html#cachepluginstrategy) and [`CacheContentTypeConfig`](./configuration-reference.html#cachecontenttypeconfig) configuration reference for all available options.
:::

### Enable cache on custom routes

By default the plugin registers a middleware to intercept all [predefined routes](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#api-endpoints), but you can also enable it on custom routes.

::: warning
At this time a custom route can only be registered within a single Content-Type.
:::

```js {13-22}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        // ...
      },
      strategy: {
        contentTypes: [
          {
            contentType: "api::pages.pages",
            routes: /* @type {CacheRouteConfig[]} */ [
              {
                path: '/api/pages/slug/:slug+', // note that we set the /api prefix here
                method: 'GET', // can be omitted, defaults to GET
                hitpass: false, // overrides default hitpass for this route
                keys: /* @type {CacheKeysConfig} */ {
                  useQueryParams: ['locale'], // use only locale query param for keys
                }
              },
            ],
          },
        ],
      },
    },
  },
});
```

::: tip
Check the [`CacheRouteConfig`](./configuration-reference.html#cacherouteconfig) and [`CacheKeysConfig`](./configuration-reference.html#cachekeysconfig) configuration reference for all available options.
:::

### Disable cache for default routes

### Content-Type relations

### Dealing with private content and authentication

### Purging cache programmatically

### Enable debug mode

This plugins use [debug](https://www.npmjs.com/package/debug) module to log messages that can help during development.
You can enable debug mode by setting the environment variable `DEBUG=strapi:strapi-plugin-rest-cache` before starting strapi.

eg. `DEBUG=strapi:strapi-plugin-rest-cache yarn strapi develop`

You can also enable debug mode by setting the [`config.strategy.debug`](./configuration-reference.html#debug) configuration option to `true`.
