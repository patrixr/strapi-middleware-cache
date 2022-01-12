---
title: Custom provider
---

## Create a custom provider

### Extends the `CacheProvider` class

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
@[code{6-54}](../../packages/strapi-plugin-rest-cache/server/types/CacheProvider.js)
:::

### Export the provider

```js
// file: /custom-rest-cache-provider/index.js
const couchbase = require('couchbase');

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

### Use your custom cache provider


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