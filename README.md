# Strapi LRU Caching middleware

A cache middleware for the headless CMS strapi.io

![](https://github.com/patrixr/strapi-middleware-cache/workflows/Tests/badge.svg)
![Maintenance](https://img.shields.io/badge/Maintenance%20-Actively%20Maintained-green.svg)

## How it works

This middleware caches incoming `GET` requests on the strapi API, based on query params and model ID.
The cache is automatically busted everytime a `PUT`, `POST`, or `DELETE` request comes in.

Supported storage engines

- Memory _(default)_
- Redis

Important: Caching must be explicitely enabled **per model**

## Installing

Using npm

```bash
npm install --save strapi-middleware-cache
```

Using yarn

```bash
yarn add strapi-middleware-cache
```

## Setup

For Strapi stable versions, add a `middleware.js` file within your config folder

e.g

```bash
touch config/middleware.js
```

To use different settings per environment, see the [Strapi docs for environments](https://strapi.io/documentation/v3.x/concepts/configurations.html#environments).

You can parse environment variables for the config here as well if you wish to, please see the [Strapi docs for environment variables](https://strapi.io/documentation/v3.x/concepts/configurations.html#environment-variables).

Enable the cache middleware by adding the following snippet to an empty middleware file or simply add in the settings from the below example:

```javascript
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
    }
  }
});
```

Starting the CMS should now log the following

```
$ strapi develop
[2020-04-14T11:12:41.648Z] debug [Cache] Mounting LRU cache middleware
[2020-04-14T11:12:41.648Z] debug [Cache] Storage engine: mem
```

## Configure models

The middleware will only cache models which have been explicitely enabled.
Add a list of models to enable to the module's configuration object.

e.g

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      models: ['posts'],
    }
  }
});
```

Starting the CMS should now log the following

```
$ strapi develop
[2020-04-14T11:12:41.648Z] debug [Cache] Mounting LRU cache middleware
[2020-04-14T11:12:41.648Z] debug [Cache] Storage engine: mem
[2020-04-14T11:12:41.653Z] debug [Cache] Caching route /posts/:id* [maxAge=3600000]
```

## Configure the storage engine

The module's configuration object supports the following properties

| Property                   | Default | Description                                                                           |
| -------------------------- | ------- | ------------------------------------------------------------------------------------- |
| type                       | mem     | The type of storage engine to use (`mem` or `redis`)                                  |
| max                        | 500     | Max number of entries in the cache                                                    |
| maxAge                     | 3600000 | Time in milliseconds after which a cache entry is invalidated                         |
| cacheTimeout               | 500     | Time in milliseconds after which a cache request is timed out                         |
| enableEtagSupport.         | false   | If set to true, will support [etag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) in headers                                   |
| logs                       | true    | Setting it to false will disable any console output                                   |
| populateContext            | false   | Setting it to true will inject a cache entry point into the Koa context               |
| redisConfig _(redis only)_ | {}      | The redis config object passed on to [ioredis](https://www.npmjs.com/package/ioredis) |

### Example

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      type: 'redis',
      maxAge: 3600000,
      models: ['posts'],
      redisConfig: {
        sentinels: [
          { host: '192.168.10.41', port: 26379 },
          { host: '192.168.10.42', port: 26379 },
          { host: '192.168.10.43', port: 26379 },
        ],
        name: 'redis-primary',
      }
    }
  }
});
```

Running the CMS will output the following

```
$ strapi develop
[2020-04-14T11:31:05.751Z] debug [Cache] Mounting LRU cache middleware
[2020-04-14T11:31:05.752Z] debug [Cache] Storage engine: redis
[2020-04-14T11:31:05.784Z] debug [Cache] Caching route /listings/:id* [maxAge=3600000]
[2020-04-14T11:31:06.076Z] debug [Cache] Redis connection established
```

## Per-Model Configuration

Each route can hold its own configuration object for more granular control. This can be done simply
by replacing the model strings in the list by object.

On which you can set:
- Its own custom `maxAge`
- Headers to include in the cache-key (e.g the body may differ depending on the language requested)

e.g

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      type: 'redis',
      maxAge: 3600000,
      models: [
        {
          model: 'listings',
          maxAge: 1000000,
        },
        {
          model: 'account',
          headers: ['accept-language']
        }
      ]
    }
  }
});
```

Running the CMS should now show the following

```
$ strapi develop
[2020-04-14T11:37:16.510Z] debug [Cache] Mounting LRU cache middleware
[2020-04-14T11:37:16.511Z] debug [Cache] Storage engine: redis
[2020-04-14T11:37:16.600Z] debug [Cache] Caching route /listings/:id* [maxAge=1000000]
[2020-04-14T11:37:16.946Z] debug [Cache] Redis connection established
```

## Pluralization and Single types

By default, the middleware assumes that the specified models are collections. Meaning that having `'post'` or `'posts'` in your configuration will result in the `/posts/*` being cached. Pluralization is applied in order to match the Strapi generated endpoints.

That behaviour is however not desired for [single types](https://strapi.io/blog/beta-19-single-types-uid-field) such as `homepage` which should remain singular in the endpoint (`/homepage`)

You can mark a specific model as being a single type by using the `singleType` boolean field on model configurations

e.g

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      models: [
        {
          model: 'homepage',
          singleType: true,
        }
      ]
    }
  }
});
```

## Etag support

By setting the `enableEtagSupport` to `true`, the middleware will automatically create an Etag for each payload it caches.

Further requests sent with the `If-None-Match` header will be returned a `304 Not Modified` status if the content for that url has not changed.

## Clearing related cache

By setting the `clearRelatedCache` to `true`, the middleware will inspect the Strapi models before a cache clearing operation to locate models that have relations with the queried model so that their cache is also cleared (this clears the whole cache for the related models). The ispection is performed by looking for direct relations between models and also by doing a deep dive in components, looking for relations to the queried model there too.

## Cache entry point

### Koa Context

By setting the `populateContext` configuration to `true`, the middleware will extend the Koa Context with an entry point which can be used to clear the cache from within controllers

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      populateContext: true,
      models: ['post']
    }
  }
});

// controller

module.exports = {
  async index(ctx) {
    ctx.middleware.cache.store // A direct access to the cache engine
    await ctx.middleware.cache.bust({ model: 'posts', id: '123' }); // Will bust the cache for this specific record
    await ctx.middleware.cache.bust({ model: 'posts' }); // Will bust the cache for the entire model collection
    await ctx.middleware.cache.bust({ model: 'homepage' }); // For single types, do not pluralize the model name

    // ...
  }
};
```

**IMPORTANT**: We do not recommend using this unless truly necessary. It is disabled by default as it goes against the non-intrusive/transparent nature of this middleware.

### Strapi Middleware

By setting the `populateStrapiMiddleware` configuration to `true`, the middleware will extend the Strapi middleware object with an entry point which can be used to clear the cache from anywhere (e.g., inside a Model's lifecycle hook where `ctx` is not available).

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      populateStrapiMiddleware: true,
      models: ['post']
    }
  }
});

// model

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      strapi.middleware.cache.store // A direct access to the cache engine
      await strapi.middleware.cache.bust({ model: 'posts', id: '123' }); // Will bust the cache for this specific record

      // ...
    }
  }
};
```

**IMPORTANT**: We do not recommend using this unless truly necessary. It is disabled by default as it goes against the non-intrusive/transparent nature of this middleware.

## Admin panel interactions

The strapi admin panel uses a separate rest api to apply changes to records, e.g `/content-manager/explorer/application::post.post` the middleware will also watch for write operations on that endpoint and bust the cache accordingly
