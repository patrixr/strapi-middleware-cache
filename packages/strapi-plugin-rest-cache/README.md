<div align="center">
<h1>Strapi REST Cache Plugin</h1>
	
<p style="margin-top: 0;">Speed-up HTTP requests with LRU cache.</p>
	
<p>
  <a href="https://www.npmjs.org/package/strapi-plugin-rest-cache">
    <img src="https://img.shields.io/npm/v/strapi-plugin-rest-cache/latest.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.org/package/strapi-plugin-rest-cache">
    <img src="https://img.shields.io/npm/dm/strapi-plugin-rest-cache" alt="Monthly download on NPM" />
  </a>
</p>
</div>

## Table of Contents <!-- omit in toc -->

- [🚦 Current Status](#-current-status)
- [✨ Features](#-features)
- [🤔 Motivation](#-motivation)
- [🖐 Requirements](#-requirements)
- [🚚 Getting Started](#-getting-started)
- [Contributing](#contributing)
- [License](#license)

## 🚦 Current Status

This package is currently under development and should be consider **ALPHA** in terms of state. I/We are currently accepting contributions and/or dedicated contributors to help develop and maintain this package.

## ✨ Features

This plugin provide a way to cache **HTTP requests** in order to **improve performance**. It's get inspired by varnish cache which is a popular caching solution.

The cache content is stored by a **provider**, which can be either an in-memory provider, a redis connection, a file system, or any other custom provider.
You can set a **strategy** to tell what to cache and how much time responses should be cached. The cache will be invalidated when the related Content-Type is updated, so you **never have to worry about stale data**.

## 🖐 Requirements

Supported Strapi Versions:

- Strapi v4.0.x (recently tested as of January 2022)
- Strapi v4.x.x (Assumed, but possibly not tested)

**If you are looking for a plugin for Strapi v3.x, please check the [strapi-middleware-cache](https://github.com/patrixr/strapi-middleware-cache/).**

## 🚚 Getting Started

[Read the Docs to Learn More.](https://strapi-community.github.io/strapi-plugin-rest-cache/)

## Contributing

I/We are actively looking for contributors, maintainers, and others to help shape this package. As this plugins sole purpose within the Strapi community is to be used by other developers and plugin maintainers to get fast responses time.

If interested please feel free to email the lead maintainer Sacha at: sacha@digisquad.io or ping `stf#3254` on Discord.

## License

See the [LICENSE](./LICENSE.md) file for licensing information.
