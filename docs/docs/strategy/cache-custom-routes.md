---
title: Cache custom routes
---

# {{ $frontmatter.title }}

By default the plugin registers a middleware to intercept all [predefined routes](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html#api-endpoints), but you can also enable it on custom routes.

```js {13-18}
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
              },
            ],
          },
        ],
      },
    },
  },
});
```

::: warning
At this time a custom route can only be registered within a single Content-Type.
:::

## `CacheRouteConfig` reference

### `path`

Refer to an [existing route path in strapi](https://docs.strapi.io/developer-docs/latest/development/backend-customization/routes.html) on which the cache middleware will be registered.  
A warning will be displayed if the path does not exist.

- **Type:** `string`
- **Default:** `GET`

### `method`

Refer to an [existing route method in strapi](https://docs.strapi.io/developer-docs/latest/development/backend-customization/routes.html) on which the cache middleware will be registered.  
A warning will be displayed if the path does not exist.

- **Type:** `'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'`
- **Default:** `GET`

::: tip
Cache lookup is performed only on `GET` requests, and cache invalidation is performed on all other requests.
:::

### `hitpass`

When true, the cache plugin will not lookup for cache and serve fresh response from backend instead. Also, the response is not stored in the cache.

- **Type:** `(ctx: Context) => boolean | boolean`
- **Default:** _(inherit from `CacheContentTypeConfig` if set)_

### `keys`

Options used to generate the cache keys.

- **Type:** [`CacheKeysConfig`](./cache-keys.md#cachekeysconfig-reference)
- **Default:** _(inherit from `CacheContentTypeConfig` if set)_

### `maxAge`

Default max age for cached entries.

- **Type:** `number`
- **Default:** _(inherit from `CacheContentTypeConfig` if set)_
