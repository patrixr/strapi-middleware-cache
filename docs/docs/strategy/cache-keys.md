# Cache keys configuration

By default, the cache plugin will compute a cache key based on the request method, the request path and the request query parameters.

You can customize this behavior by providing a `keys` option in either the `CachePluginStrategy` to customize global behavior, or on each route in `CacheRouteConfig` so that you can customize the behavior for each route.

::::code-group

```js {13-16} [public cache]
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
            contentType: 'api::homepage.homepage',
            hitpass: false, // never check if we should bypass the cache
            keys: {
              useQueryParams: false, // disable query parameters in cache keys
            },
          },
        ],
      },
    },
  },
});
```

```js {13-16} [user cache]
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
            contentType: 'api::orders.orders',
            hitpass: false, // never check if we should bypass the cache
            keys: {
              useHeaders: ['authorization'], // use the authorization header value in cache keys
            },
          },
        ],
      },
    },
  },
});
```

::::

::: warning
When using `authorization` header in cache keys, you will not be able to clear the cache for a specific user.
:::

## `CacheKeysConfig` reference

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
