# Strapi LRU Caching middleware

A cache middleware for the headless CMS strapi.io

![](https://github.com/patrixr/strapi-plugin-rest-cache/workflows/Tests/badge.svg)
![Maintenance](https://img.shields.io/badge/Maintenance%20-Actively%20Maintained-green.svg)

- [Strapi LRU Caching middleware](#strapi-lru-caching-middleware)
  - [How it works](#how-it-works)
  - [Installing](#installing)
  - [Version 1 compatibility](#version-1-compatibility)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Configure models](#configure-models)
  - [Configure the storage engine](#configure-the-storage-engine)
    - [Example](#example)
  - [Per-Model Configuration](#per-model-configuration)
  - [Single types](#single-types)
  - [Authentication](#authentication)
  - [Etag support](#etag-support)
  - [Clearing related cache](#clearing-related-cache)
  - [Cache entry point](#cache-entry-point)
    - [Koa Context](#koa-context)
    - [Strapi Middleware](#strapi-middleware)
  - [Cache API](#cache-api)
  - [Admin panel interactions](#admin-panel-interactions)

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
npm install --save strapi-plugin-rest-cache
```

Using yarn

```bash
yarn add strapi-plugin-rest-cache
```

## Version 1 compatibility

:warning: Important: The middleware has gone through a full rewrite since version 1, and its configuration may not be fully compatible with the old v1. Make sure to (re)read the documentation below on how to use it 👇

## Requirements

Since `4.0.0`:

- strapi `4.0.0`
- node `14`

_See `1.5.0` for strapi < `3.4.0`_
_See `2.1.1` for strapi > `3.4.0` & strapi > `4.0.0`_

## Setup

For Strapi stable versions, add a `plugins.js` file within your config folder

e.g

```bash
touch config/plugins.js
```

To use different settings per environment, see the [Strapi docs for environments](https://strapi.io/documentation/v3.x/concepts/configurations.html#environments).

You can parse environment variables for the config here as well if you wish to, please see the [Strapi docs for environment variables](https://strapi.io/documentation/v3.x/concepts/configurations.html#environment-variables).

Enable the cache plugins by adding the following snippet to an empty plugins file or simply add in the settings from the below example:

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'strapi-plugin-rest-cache': {
    enabled: true,
    config: {},
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
// config/plugins.js
module.exports = ({ env }) => ({
  'strapi-plugin-rest-cache': {
    enabled: true,
    config: {
      contentTypes: ['api::review.review'],
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
// config/plugins.js
module.exports = ({ env }) => ({
  'strapi-plugin-rest-cache': {
    enabled: true,
    config: {
      type: 'redis',
      contentTypes: ['api::review.review'],
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

> WIP

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
// config/plugins.js
module.exports = ({ env }) => ({
  "strapi-plugin-rest-cache": {
    enabled: true,
    config: {
      maxAge: 3600000,
      contentTypes: [
        /**
         * @type {UserModelCacheConfig}
         */
        {
          contentType: 'api::review.review',
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
  },
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

Single types are also supported withouth the need to specify anythign else.

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
      contentTypes: [
        {
          contentType: 'api::footer.footer',
          hitpass: false,
          singleType: true,
        },
      ],
    },
  },
});
```

## Etag support

By setting the `enableEtag` to `true`, the middleware will automatically create an Etag for each payload it caches.

Further requests sent with the `If-None-Match` header will be returned a `304 Not Modified` status if the content for that url has not changed.

## Clearing related cache

By setting the `clearRelatedCache` to `true`, the middleware will inspect the Strapi models before a cache clearing operation to locate models that have relations with the queried model so that their cache is also cleared (this clears the whole cache for the related models). The ispection is performed by looking for direct relations between models and also by doing a deep dive in components, looking for relations to the queried model there too.

## Admin panel interactions

The strapi admin panel uses a separate rest api to apply changes to records, e.g `/content-manager/explorer/application::post.post` the middleware will also watch for write operations on that endpoint and bust the cache accordingly
