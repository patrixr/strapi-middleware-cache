# Strapi LRU Caching middleware

A cache middleware for the headless CMS strapi.io

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
    },
  },
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
    },
  },
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
| logs                       | true    | Setting it to false will disable any console output                                   |
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
      },
    },
  },
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

Each route can be configured with it's own unique `maxAge`. This can be done simply
by replacing the model strings in the list by object.

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
      ],
    },
  },
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
