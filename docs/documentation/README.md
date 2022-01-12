---
title: How it works
---


## How it works

This plugin inject a middleware that caches incoming `GET` requests on the strapi API, based on query params and model ID.
The cache is automatically busted everytime a `PUT`, `PATCH`, `POST`, or `DELETE` request comes in.

Supported storage engines

- Memory _(default)_
- Redis

Important: Caching must be explicitely enabled **per Content-Type**


<mermaid id="hello">
{{`
sequenceDiagram
  autonumber
  participant C as Client
  participant S as Strapi
  participant CS as Cache Store
  C->>S: [GET] /api/restaurants/1
  Note over S: Generated cache key
  S->>CS: Has cache?
  alt
      CS->>S: HIT
      S->>C: Return cached data
  else
      CS->>S: MISS
      Note over S: Call internal controller
      S->>CS: Store data in cache
      S->>C: Return data
  end
`}}
</mermaid>
