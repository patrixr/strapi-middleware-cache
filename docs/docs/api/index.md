---
title: Services
---

# Services

This plugin exposes a few services that can be used to interact with the cache.

## cacheConfig

This service is used to interact with the plugin configuration.

### `getUids()`

Get all uid of cached contentTypes

```js
const uids = strapi.plugins["rest-cache"].services.cacheConfig.getUids();
```

### `getRelatedCachedUid(uid)`

Return the intersection of cached contentTypes and the related contentTypes of a given contentType uid

```js
const relatedUids = strapi.plugins[
  "rest-cache"
].services.cacheConfig.getRelatedCachedUid("api::article.article");
```

### `get(uid)`

Get related `CacheContentTypeConfig` with an uid

```js
const contentTypeConfig = strapi.plugins["rest-cache"].services.cacheConfig.get(
  "api::article.article"
);
```

### `getCacheKeysRegexp(uid, params, wildcard)`

Get regexs to match all `CacheContentTypeConfig` keys with given params

```js
const regExps = strapi.plugins[
  "rest-cache"
].services.cacheConfig.getCacheKeysRegexp("api::article.article", {
  lang: "en",
});
```

### `isCached()`

Check if a cache configuration exists for a contentType uid

```js
const isContentTypeCached = strapi.plugins[
  "rest-cache"
].services.cacheConfig.isCached("api::article.article");
```

## cacheStore

This service is used to interact with the cache store.

### `get(key)`

### `set(key, val, maxAge)`

### `del(key)`

### `keys()`

### `reset()`

### `init()`

### `ready`

### `clearByRegexp(regExps)`

### `clearByUid(uid, params, wildcard)`
