---
title: Cache provider configuration
---

# Cache provider configuration

By default, the **strapi-plugin-rest-cache** use **strapi-provider-rest-cache-memory** which is an in-memory provider. It's not persisted and will be lost when the server restarts.

Alternatively, you can use:

- **strapi-provider-rest-cache-redis** which is a bridge between the cache plugin and the [strapi-plugin-redis](https://github.com/strapi-community/strapi-plugin-redis)
- **strapi-provider-rest-cache-couchbase** which connect to a couchbase cluster and store the cache in a bucket
- Your custom provider

You have to set the provider name in the plugin configuration so it will be initialized once the plugin is bootstrapped. At this time only one provider can be used at a time.

You can also set the provider `getTimeout` which is the time in milliseconds to wait for the provider to respond, **if the provider is not responding, the cache will be considered as a miss**.

```js {6-17}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {
      provider: /* @type {Provider} */ {
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
Check the [memory](./memory.md), [redis](./redis.md) or [couchbase](./couchbase.md) documentation for more details for advanced provider configuration.
:::

## `Provider` reference

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
