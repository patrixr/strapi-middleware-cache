---
sidebar_label: Custom Provider
sidebar_position: 5
---

# Create a custom provider

## Extends the `CacheProvider` class

```js
// file: /custom-rest-cache-provider/MyCacheProvider.js
const { CacheProvider } = require("strapi-plugin-rest-cache/server/types");

class MyCacheProvider extends CacheProvider {
  // implement your custom provider here
}

module.exports = {
  MyCacheProvider,
};
```

::: details View abstract CacheProvider class

```js
/**
 * Abstract Class CacheProvider.
 *
 * @class CacheProvider
 */
class CacheProvider {
  constructor() {
    if (this.constructor === CacheProvider) {
      throw new Error("CacheProvider class can't be instantiated.");
    }
  }

  /**
   * @param {string} key
   */
  async get(key) {
    throw new Error("Method 'get()' must be implemented.");
  }

  /**
   * @param {string} key
   * @param {any} val
   * @param {number=} maxAge
   */
  async set(key, val, maxAge = 3600) {
    throw new Error("Method 'set()' must be implemented.");
  }

  /**
   * @param {string|string[]} key
   */
  async del(key) {
    throw new Error("Method 'del()' must be implemented.");
  }

  async keys() {
    throw new Error("Method 'keys()' must be implemented.");
  }

  get ready() {
    throw new Error("getter 'ready' must be implemented.");
  }
}
```

:::

## Export the provider

```js
// file: /custom-rest-cache-provider/index.js
const couchbase = require("couchbase");

const { MyCacheProvider } = require("./MyCacheProvider");

module.exports = {
  provider: "custom",
  name: "Custom provider",

  async init(options, { strapi }) {
    // here you can initialize your provider connection
    const client = await couchbase.connect(options.clients);

    // then return your provider instance
    return new MyCacheProvider(client);
  },
};
```

## Use your custom cache provider

```js
// file: /config/plugins.js

module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "../custom-rest-cache-provider/index.js",
        // your provider options
        // will be passed to the provider init function
        options: {},
      },
      strategy: {
        // ...
      },
    },
  },
};
```
