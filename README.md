# Strapi LRU Caching middleware

A cache middleware for the headless CMS strapi.io

## How it works

This middleware caches incoming `GET` requests on the strapi API, based on query params and model ID.
The cache is automatically busted everytime a `PUT`, `POST`, or `DELETE` request comes in.

Supported storage engines

-   Memory _(default)_
-   Redis

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

For each environment (aka production/staging/development), add a `middleware.json` file within their config folder

e.g

```bash
touch config/development/middlewares.json
```

Enable the cache middleware by adding the following snippet:

```javascript
{
  "cache": {
    "enabled": true
  }
}
```

Starting the CMS should now log the following

```
$ strapi develop
[2020-04-14T11:12:41.648Z] info [Cache] Mounting LRU cache middleware
[2020-04-14T11:12:41.648Z] info [Cache] Storage engine: mem
```

## Configure models

The middleware will only cache models which have been explicitely enabled.
Add a list of models to enable to the module's configuration object.

e.g

```javascript
// config/development/middlewares.json
{
  "cache": {
    "enabled": true,
    "models": ["posts"]
  }
}
```

Starting the CMS should now log the following

```
$ strapi develop
[2020-04-14T11:12:41.648Z] info [Cache] Mounting LRU cache middleware
[2020-04-14T11:12:41.648Z] info [Cache] Storage engine: mem
[2020-04-14T11:12:41.653Z] info [Cache] Caching route /posts/:id* [maxAge=3600000]
```

## Configure the storage engine

The module's configuration object supports the following properties

| Property                     | Default | Description                                                                                 |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| type                         | mem     | The type of storage engine to use (`mem` or `redis`)                                        |
| max                          | 500     | Max number of entries in the cache                                                          |
| maxAge                       | 3600000 | Time in milliseconds after which a cache entry is invalidated                               |
| redisConfig _(redis only)_   | {}      | The redis config object/array passed on to [ioredis](https://www.npmjs.com/package/ioredis) |
| cluster _(redis only)_       | false   | Boolean to set [ioredis](https://www.npmjs.com/package/ioredis) into cluster mode           |
| clusterConfig _(redis only)_ | {}      | The redis cluster settings object to define additional cluster settings                     |

### Example - Redis Sentinel

```javascript
// config/development/middlewares.json
{
  "cache": {
    "enabled": true,
    "type": "redis",
    "maxAge": 3600000,
    "models": ["posts"],
    "redisConfig": {
      "sentinels": [
          { "host": "192.168.10.41", "port": 26379 },
          { "host": "192.168.10.42", "port": 26379 },
          { "host": "192.168.10.43", "port": 26379 }
      ],
      "name": "redis-primary"
    }
  }
}
```

Running the CMS will output the following

```
$ strapi develop
[2020-04-14T11:31:05.751Z] info [Cache] Mounting LRU cache middleware
[2020-04-14T11:31:05.752Z] info [Cache] Storage engine: redis
[2020-04-14T11:31:05.784Z] info [Cache] Caching route /listings/:id* [maxAge=3600000]
[2020-04-14T11:31:06.076Z] info [Cache] Redis connection established
```

### Example - Redis Cluster

```javascript
// config/development/middlewares.json
{
  "cache": {
    "enabled": true,
    "type": "redis",
    "cluster": true
    "maxAge": 3600000,
    "models": ["posts"],
    "redisConfig": [
      {
        "port": 6379,
        "host": "192.168.10.41"
      },
      {
        "port": 6379,
        "host": "192.168.10.42"
      },
      {
        "port": 6379,
        "host": "192.168.10.43"
      }
    ]
  }
}
```

Running the CMS will output the following

```
$ strapi develop
[2020-04-14T11:31:05.751Z] info [Cache] Mounting LRU cache middleware
[2020-04-14T11:31:05.752Z] info [Cache] Storage engine: redis
[2020-04-14T11:31:05.753Z] info [Cache] Cluster: true
[2020-04-14T11:31:05.784Z] info [Cache] Caching route /listings/:id* [maxAge=3600000]
[2020-04-14T11:31:06.076Z] info [Cache] Redis connection established
```

## Per-Model Configuration

Each route can be configured with it's own unique `maxAge`. This can be done simply
by replacing the model strings in the list by object.

e.g

```javascript
// config/development/middlewares.json
{
  "cache": {
    "enabled": true,
    "type": "redis",
    "maxAge": 3600000,
    "models": [{
      "model": "listings",
      "maxAge": 1000000
    }]
  }
}
```

Running the CMS should now show the following

```
$ strapi develop
[2020-04-14T11:37:16.510Z] info [Cache] Mounting LRU cache middleware
[2020-04-14T11:37:16.511Z] info [Cache] Storage engine: redis
[2020-04-14T11:37:16.600Z] info [Cache] Caching route /listings/:id* [maxAge=1000000]
[2020-04-14T11:37:16.946Z] info [Cache] Redis connection established
```
