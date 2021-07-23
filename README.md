# Strapi LRU Caching middleware

:warning: You are on beta branch

A cache middleware for the headless CMS strapi.io

![](https://github.com/patrixr/strapi-middleware-cache/workflows/Tests/badge.svg)
![Maintenance](https://img.shields.io/badge/Maintenance%20-Actively%20Maintained-green.svg)

## How it works

This middleware caches incoming `GET` requests on the strapi API, based on query params and model ID.
The cache is automatically busted everytime a `PUT`, `PATCH`, `POST`, or `DELETE` request comes in.

Supported storage engines

- Memory _(default)_
- Redis

Important: Caching must be explicitely enabled **per model**

## Installing

Using npm

```bash
npm install --save strapi-middleware-cache@beta
```

Using yarn

```bash
yarn add strapi-middleware-cache@beta
```

## Requirements

Since `2.0.1`:

- strapi `3.4.0`
- node `14`

_See `1.5.0` for strapi < `3.4.0`_

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
    },
  },
});
```

Starting the CMS should now log the following

```
$ strapi develop
[2021-02-26T07:03:18.981Z] info [cache] Mounting LRU cache middleware
[2021-02-26T07:03:18.982Z] info [cache] Storage engine: mem
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
      models: ['review'],
    },
  },
});
```

Starting the CMS should now log the following

```
$ strapi develop
[2021-02-26T07:03:18.981Z] info [cache] Mounting LRU cache middleware
[2021-02-26T07:03:18.982Z] info [cache] Storage engine: mem
[2021-02-26T07:03:18.985Z] debug [cache] Register review routes middlewares
[2021-02-26T07:03:18.986Z] debug [cache] POST /reviews purge
[2021-02-26T07:03:18.987Z] debug [cache] DELETE /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] PUT /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] GET /reviews recv maxAge=3600000
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/:id recv maxAge=3600000
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/count recv maxAge=3600000
```

## Configure the storage engine

The module's configuration object supports the following properties

### Example

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    /**
     * @typedef {Object} UserMiddlewareCacheConfig
     * @property {'mem'|'redis'=} type
     * @property {boolean=} enabled
     * @property {boolean=} logs
     * @property {boolean=} populateContext
     * @property {boolean=} populateStrapiMiddleware
     * @property {boolean=} enableEtagSupport
     * @property {boolean=} enableXCacheHeaders
     * @property {boolean=} clearRelatedCache
     * @property {boolean=} withKoaContext
     * @property {boolean=} withStrapiMiddleware
     * @property {string[]=} headers
     * @property {number=} max
     * @property {number=} maxAge
     * @property {number=} cacheTimeout
     * @property {(UserModelCacheConfig | string)[]=} models
     * @property {Object=} redisConfig
     */
    cache: {
      enabled: true,
      type: 'redis',
      models: ['review'],
      redisConfig: {
        sentinels: [
          { host: '192.168.10.41', port: 26379 },
          { host: '192.168.10.42', port: 26379 },
          { host: '192.168.10.43', port: 26379 },
        ],
        name: 'redis-primary',
      },
    },
  },
});
```

Running the CMS will output the following

```
$ strapi develop
[2021-02-26T07:03:18.981Z] info [cache] Mounting LRU cache middleware
[2021-02-26T07:03:18.982Z] info [cache] Storage engine: mem
[2021-02-26T07:03:18.985Z] debug [cache] Register review routes middlewares
[2021-02-26T07:03:18.986Z] debug [cache] POST /reviews purge
[2021-02-26T07:03:18.987Z] debug [cache] DELETE /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] PUT /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] GET /reviews recv maxAge=3600000
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/:id recv maxAge=3600000
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/count recv maxAge=3600000
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
        /**
         * @typedef {Object} UserModelCacheConfig
         * @property {string} model
         * @property {string=} plugin
         * @property {boolean=} singleType
         * @property {Hitpass|boolean=} hitpass
         * @property {boolean=} injectDefaultRoutes
         * @property {string[]=} headers
         * @property {number=} maxAge
         * @property {(string | CustomRoute)[]=} routes
         */
        {
          model: 'reviews',
          headers: ['accept-language']
          maxAge: 1000000,
          routes: [
            '/reviews/:slug',
            '/reviews/:id/custom-route',
            { path: '/reviews/:slug', method: 'DELETE' },
          ]
        },
      ]
    }
  }
});
```

Running the CMS should now show the following

```
$ strapi develop
[2021-02-26T07:03:18.981Z] info [cache] Mounting LRU cache middleware
[2021-02-26T07:03:18.982Z] info [cache] Storage engine: mem
[2021-02-26T07:03:18.985Z] debug [cache] Register review routes middlewares
[2021-02-26T07:03:18.986Z] debug [cache] POST /reviews purge
[2021-02-26T07:03:18.987Z] debug [cache] DELETE /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] PUT /reviews/:id purge
[2021-02-26T07:03:18.987Z] debug [cache] GET /reviews recv maxAge=1000000 vary=accept-language
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/:id recv maxAge=1000000 vary=accept-language
[2021-02-26T07:03:18.988Z] debug [cache] GET /reviews/count recv maxAge=1000000 vary=accept-language
[2021-02-26T07:03:18.990Z] debug [cache] GET /reviews/:slug maxAge=1000000 vary=accept-language
[2021-02-26T07:03:18.990Z] debug [cache] GET /reviews/:id/custom-route maxAge=1000000 vary=accept-language
[2021-02-26T07:03:18.990Z] debug [cache] DELETE /reviews/:slug purge
```

## Single types

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
          model: 'footer',
          singleType: true,
        },
      ],
    },
  },
});
```

Running the CMS should now show the following

```
$ strapi develop
[2021-02-26T07:03:18.981Z] info [cache] Mounting LRU cache middleware
[2021-02-26T07:03:18.982Z] info [cache] Storage engine: mem
[2021-02-26T07:03:18.985Z] debug [cache] Register review routes middlewares
[2021-02-26T07:03:18.986Z] debug [cache] PUT /footer purge
[2021-02-26T07:03:18.987Z] debug [cache] DELETE /footer purge
[2021-02-26T07:03:18.987Z] debug [cache] GET /review recv maxAge=3600000
```

## Authentication

By default, cache is not looked up if `Authorization` or `Cookie` header are present.
To dissable this behaviour add `hitpass: false` to the model cache configuration

You can customize event further with a function `hitpass: (ctx) => true` where `ctx` is the koa context of the request. Keep in mind that this function is executed before every `recv` requests.

e.g

```javascript
// config/middleware.js
module.exports = ({ env }) => ({
  settings: {
    cache: {
      enabled: true,
      models: [
        {
          model: 'footer',
          hitpass: false,
          singleType: true,
        },
      ],
    },
  },
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
      models: ['post'],
    },
  },
});

// controller

module.exports = {
  async index(ctx) {
    ctx.middleware.cache; // A direct access to the Cache API
  },
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
      models: ['post'],
    },
  },
});

// model

module.exports = {
  lifecycles: {
    async beforeUpdate(params, data) {
      strapi.middleware.cache; // A direct access to the Cache API
    },
  },
};
```

**IMPORTANT**: We do not recommend using this unless truly necessary. It is disabled by default as it goes against the non-intrusive/transparent nature of this middleware.

## Cache API

```javascript
const cache = {
  /**
   * @typedef {Object} CacheStore
   * @property {function(string): any} get
   * @property {function(string): any} peek
   * @property {function(string, any, number?): boolean} set
   * @property {function(string): void} del
   * @property {function(): any[]} keys
   * @property {function(): void} reset
   */
  store,

  /**
   * @typedef {Object} MiddlewareCacheConfig
   * @property {'mem'|'redis'} type
   * @property {boolean} enabled
   * @property {boolean} logs
   * @property {boolean} populateContext
   * @property {boolean} populateStrapiMiddleware
   * @property {boolean} enableEtagSupport
   * @property {boolean} enableXCacheHeaders
   * @property {boolean} clearRelatedCache
   * @property {boolean} withKoaContext
   * @property {boolean} withStrapiMiddleware
   * @property {number} max
   * @property {number} maxAge
   * @property {number} cacheTimeout
   * @property {string[]} headers
   * @property {ModelCacheConfig[]} models
   * @property {Object=} redisConfig
   */
  options,

  /**
   * Clear cache with uri parameters
   *
   * @param {ModelCacheConfig} cacheConf
   * @param {{ [key: string]: string; }=} params
   */
  clearCache,

  /**
   * Get related ModelCacheConfig
   *
   * @param {string} model
   * @param {string=} plugin
   * @returns {ModelCacheConfig=}
   */
  getCacheConfig,

  /**
   * Get related ModelCacheConfig with an uid
   *
   * uid:
   * - application::sport.sport
   * - plugins::users-permissions.user
   *
   * @param {string} uid
   * @returns {ModelCacheConfig=}
   */
  getCacheConfigByUid,

  /**
   * Get models uid that is related to a ModelCacheConfig
   *
   * @param {ModelCacheConfig} cacheConf The model used to find related caches to purge
   * @return {string[]} Array of related models uid
   */
  getRelatedModelsUid,

  /**
   * Get regexs to match all ModelCacheConfig keys with given params
   *
   * @param {ModelCacheConfig} cacheConf
   * @param {{ [key: string]: string; }=} params
   * @param {boolean=} wildcard
   * @returns {RegExp[]}
   */
  getCacheConfRegExp,

  /**
   * Get regexs to match CustomRoute keys with given params
   *
   * @param {CustomRoute} route
   * @param {{ [key: string]: string; }=} params
   * @param {boolean=} wildcard
   * @returns {RegExp[]}
   */
  getRouteRegExp,
};
```

## Admin panel interactions

The strapi admin panel uses a separate rest api to apply changes to records, e.g `/content-manager/explorer/application::post.post` the middleware will also watch for write operations on that endpoint and bust the cache accordingly
