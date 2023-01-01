---
title: Content types
---

# Content types

The plugin will **only inject cache middleware to Content-Types which have been explicitely enabled**. This can be done by setting the `config.strategy.contentTypes` configuration.

It accept either a string or an object, so we can configure differently each Content-Type.

```js {10-19}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        // ...
      },
      strategy: {
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

## `CacheContentTypeConfig` reference

### `injectDefaultRoutes`

When enabled, inject [default routes](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#api-endpoints) for each content type.

- **Type:** `boolean`
- **Default:** `true`

### `hitpass`

When true, the cache plugin will not lookup for cache and serve fresh response from backend instead. Also, the response is not stored in the cache.

- **Type:** `(ctx: Context) => boolean | boolean`
- **Default:** _(inherit from `CachePluginStrategy` if set)_

### `routes`

Additionnal routes to register for this content type.

- **Type:** [`CacheRouteConfig[]`](./cache-custom-routes.md#cacherouteconfig-reference)
- **Default:** `[]`

### `contentType`

Content-Type UID to cache (e.g. `api::article.article`).

- **Type:** `string`
- **Default:** `''`

### `keys`

Options used to generate the cache keys.

- **Type:** [`CacheKeysConfig`](./cache-keys.md#cachekeysconfig-reference)
- **Default:** _(inherit from `CachePluginStrategy` if set)_

### `maxAge`

Default max age for cached entries.

- **Type:** `number`
- **Default:** _(inherit from `CachePluginStrategy` if set)_
