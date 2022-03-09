---
title: Memory provider
---

# Memory provider

The memory provider allow you to store cached content in memory. It use a simple key-value store with LRU algorithm provided by the default provider of [`node-cache-manager`](https://github.com/BryanDonovan/node-cache-manager) module which uses [`lru-node`](https://github.com/isaacs/node-lru-cache/tree/v6.0.0).

## Installation

```bash
yarn add strapi-provider-rest-cache-memory
```

## Configuration

```js {6-16}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: {
        name: 'memory',
        getTimeout: 500,
        options: {
          // The maximum size of the cache
          max: 32767,
          // Update to the current time whenever it is retrieved from cache, causing it to not expire
          updateAgeOnGet: false,
          // ...
        },
      },
      strategy: {
        // ...
      },
    },
  },
});
```

::: tip
View full options available on [`lru-cache`](https://github.com/isaacs/node-lru-cache/tree/v6.0.0#options) documentation.
:::

## Implementation

@[code{7-46}](../../packages/strapi-provider-rest-cache-memory/lib/MemoryCacheProvider.js)
