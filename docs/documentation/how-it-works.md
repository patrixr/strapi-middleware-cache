---
title: How it works
---


# How it works

This plugin inject a **recv** middleware that caches incoming `GET` requests on the strapi API, based on query params and Content-Type UID.
The cache is automatically busted everytime a `PUT`, `PATCH`, `POST`, or `DELETE` request comes in or when an entity is updated through the admin panel. It can also be programmatically cleared via exposed services or admin routes. 

## Journey to the cache

Here is a sequence of the events that happen when a `GET` request comes in:

<mermaid id="recv-middleware">
{{`
sequenceDiagram
  Client->>Strapi: [GET] /api/restaurants/1
  Note over Strapi: Check HITPASS
  opt HITPASS=true
    Note over Strapi: Call original controller
    Strapi->>Client: Return fresh data
  end
  opt HITPASS=false
    Note over Strapi: Generate cache key:<br />/api/restaurants/1?&
    Strapi->>Cache Store: Has cache?
    alt HIT
      Cache Store->>Strapi: Yes: HIT
      Strapi->>Client: Return cached data
    else MISS
      Cache Store->>Strapi: No: MISS
      Note over Strapi: Call original controller
      Strapi-->>Cache Store: Status between 200 and 300:<br />Store data in cache
      Strapi->>Client: Return fresh data
    end
  end
`}}
</mermaid>

## Cache key generation

## Cache `HIT`, `MISS` and `HITPASS`

## Using `ETag` and `If-None-Match` headers