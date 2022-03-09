---
title: Configuration Reference
---

# Configuration Reference

## Provider

### `name`

The name of the provider.  
Will try to load the package with `strapi-rest-cache-provider-<name>` and fallback with `<name>`, so you can either use a package name or an absolute path.

- **Type:** `string`
- **Default:** `'memory'`

### `getTimeout`

Time in milliseconds to wait for the provider to respond on cache lookup requests, if the provider is not responding, the cache will be considered as a miss

- **Type:** `number`
- **Default:** `500`

### `options`

Object passed to the provider constructor.

- **Type:** `any`
- **Default:** `{}`

## CachePluginStrategy

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

## CacheContentTypeConfig

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

- **Type:** [`CacheRouteConfig[]`](#cacherouteconfig)
- **Default:** `[]`

### `contentType`

Content-Type UID to cache (e.g. `api::article.article`).

- **Type:** `string`
- **Default:** `''`

### `keys`

Options used to generate the cache keys.

- **Type:** [`CacheKeysConfig`](#cachekeysconfig)
- **Default:** _(inherit from `CachePluginStrategy` if set)_

### `maxAge`

Default max age for cached entries.

- **Type:** `number`
- **Default:** _(inherit from `CachePluginStrategy` if set)_

## CacheRouteConfig

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

- **Type:** [`CacheKeysConfig`](#cachekeysconfig)
- **Default:** _(inherit from `CacheContentTypeConfig` if set)_

### `maxAge`

Default max age for cached entries.

- **Type:** `number`
- **Default:** _(inherit from `CacheContentTypeConfig` if set)_

## CacheKeysConfig

### `useQueryParams`

When set to `true`, all query parameters will be used to generate the cache key.
If an array is provided, only the query parameters specified in the array will be used.
You can totally disable query parameters by setting this option to `false`.

- **Type:** `boolean|string[]`
- **Default:** `true`

### `useHeaders`

Headers to use to generate the cache key.

- **Type:** `string[]`
- **Default:** `[]`
