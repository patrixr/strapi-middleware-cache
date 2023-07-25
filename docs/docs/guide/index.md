---
title: Introduction
---

# {{ $frontmatter.title }}

This plugin inject a middleware that caches incoming `GET` requests on the strapi API, based on query params and Content-Type UID.
The cache is automatically busted every time a `PUT`, `PATCH`, `POST`, or `DELETE` request comes in or when an entity is updated through the admin panel. It can also be programmatically cleared via exposed services or admin routes.

The cache content is stored by a [**provider**](/provider/index.md), which can be either an in-memory provider, a redis connection, a file system, or any other custom provider.

You can set a [**strategy**](/strategy/index.md) to tell what to cache and how much time responses should be cached. The cache will be invalidated when the related Content-Type is updated, so you **never have to worry about stale data**.

In addition, you can interact with the plugin through the admin panel, api admin routes or programmatically using internal services.
