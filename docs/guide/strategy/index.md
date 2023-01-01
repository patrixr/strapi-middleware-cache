---
title: Cache strategy configuration
---

# Cache strategy configuration

The plugin will **only inject cache middleware to Content-Types which have been explicitely enabled**. This can be done by setting the `config.strategy.contentTypes` configuration.

It accept either a string or an object, so we can configure differently each Content-Type.

```js {9-14}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        // ...
      },
      strategy: /* @type {CachePluginStrategy} */ {
        keysPrefix: 'project-name',
        maxAge: 3600000,
        debug: true,
        contentTypes: [ /** ... */ ],
      },
    },
  },
});
```

In addition to the **contentType** configuration, you can also set the default **maxAge**, **hitpass** and **keys** configuration, enables **ETag** and **X-Cache** headers or tune how the plugin will work for each route.

::: warning
The plugin will not cache any request if the `Authorization` header is present on the request or if the `Cookie` header is present on the request. This is to prevent caching of private data.

You can change this behavior by setting the `config.strategy.hitpass` configuration.
:::

## `CachePluginStrategy` reference

### `debug`

Enable extra log with [debug](https://www.npmjs.com/package/debug) package. This is usefull only when configuring the plugin.

- **Type:** `boolean`
- **Default:** `false`

### `enableEtag`

Enable etag generation for response. Also enable etag lookup when `If-None-Match` header is present on requests.
This add extra CPU overhead due to the etag computation but save bandwidth by sending `304 Not Modified` response.

- **Type:** `boolean`
- **Default:** `false`

### `enableXCacheHeaders`

Add extra `X-Cache` headers to responses. This is usefull when configuring the plugin or when using behind a reverse proxy.

- **Type:** `boolean`
- **Default:** `false`

### `enableAdminCTBMiddleware`

Register a middleware to handle cache invalidation requests performed using the admin UI.

- **Type:** `boolean`
- **Default:** `true`

### `resetOnStartup`

Delete all cache entries from the provider on startup. This is usefull when performing a migration using an external cache provider.

- **Type:** `boolean`
- **Default:** `false`

### `clearRelatedCache`

Try to delete all cache entries related to the deleted entry.

- **Type:** `boolean`
- **Default:** `true`

### `keysPrefix`

Prefix added to the cache keys.

- **Type:** `string`
- **Default:** `''`

### `hitpass`

When true, the cache plugin will not lookup for cache and serve fresh response from backend instead. Also, the response is not stored in the cache.

- **Type:** `(ctx: Context) => boolean`
- **Default:**

```js
function hitpass(ctx) {
  // ignore cache when authorization or cookie headers are present
  return Boolean(
    ctx.request.headers.authorization || ctx.request.headers.cookie
  );
}
```

### `keys`

Options used to generate the cache keys.

- **Type:** [`CacheKeysConfig`](#cachekeysconfig)

### `maxAge`

Default max age for cached entries.

- **Type:** `number`
- **Default:** `3600000` (1 hour)

### `contentTypes`

Specify each content types that should be cached. If a string is provided, default configuration from [`CacheContentTypeConfig`](#cachecontenttypeconfig) will be used

- **Type:** [`(string|CacheContentTypeConfig)[]`](#cachecontenttypeconfig)
- **Default:** `[]`
