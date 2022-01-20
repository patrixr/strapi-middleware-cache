---
title: Guide
---

# strapi-plugin-rest-cache

This plugin provide a way to cache **HTTP requests** in order to **improve performance**. It's get inspired by varnish cache which is a popular caching solution.

The cache content is stored by a **provider**, which can be either an in-memory provider, a redis connection, a file system, or any other custom provider.
You can set a **strategy** to tell what to cache and how much time responses should be cached. The cache will be invalidated when the related Content-Type is updated, so you **never have to worry about stale data**.

In addition, you can interact with the plugin through the admin panel, api admin routes or programmatically using internal services.


## Provider

By default, the **strapi-plugin-rest-cache** has no provider, you have to install one of the following providers:

- **strapi-provider-rest-cache-memory**: In-memory provider, it's not persisted and will be lost when the server restarts.
- **strapi-provider-rest-cache-redis**: Bridge between the cache plugin and the [strapi-plugin-redis](https://github.com/strapi-community/strapi-plugin-redis)

You have to set the provider name in the plugin configuration so it will be initialized once the plugin is bootstrapped. At this time only one provider can be used at a time. 

You can also set the provider `getTimeout` which is the time in milliseconds to wait for the provider to respond, **if the provider is not responding, the cache will be considered as a miss**.

```js {6-17}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: { 
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
Check the [memory provider](./memory-provider.html) and the [redis provider](./redis-provider.html) documentation for more details.
:::

## Strategy

The plugin will **only inject cache middleware to Content-Types which have been explicitely enabled**. This can be done by setting the `config.strategy.contentTypes`  configuration.

It accept either a string or an object, so we can configure differently each Content-Type.


```js {9-26}
// file: /config/plugins.js

module.exports = ({ env }) => ({
  'rest-cache': {
    config: {,
      provider: { 
        // ...
      },
      strategy: {
        // set X-Cache header in all responses
        enableXCacheHeaders: true,

        // enable cache for specific Content-Types
        contentTypes: [
          // can be a string (the Content-Type UID)
          // it will use the default configuration
          "api::article.article",

          // or an object with specific strategy
          {
            contentType: "api::article.article",
            maxAge: 3600000,
            headers: ["accept-encoding", "accept-language"],
          },
        ],
      },
    },
  },
});
```

In addition to the **contentType** configuration, you can also set the default **maxAge** and **headers** configuration, enables **ETag** and **X-Cache** headers or tune how the plugin will work.

::: tip
Check the [configuration reference](./configuration-reference.html) for all available options.
:::



### Enable cache on custom routes

### Disable cache for default routes

### Content-Type relations
### Dealing with private content and authentication

### Purging cache programmatically

### Enable debug mode