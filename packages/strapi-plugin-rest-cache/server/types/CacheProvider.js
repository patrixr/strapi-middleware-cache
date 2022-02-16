'use strict';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

/**
 * Abstract Class CacheProvider.
 *
 * @class CacheProvider
 */
class CacheProvider {
  constructor() {
    if (this.constructor === CacheProvider) {
      throw new Error("CacheProvider class can't be instantiated.");
    }
  }

  /**
   * @param {string} key
   */
  async get(key) {
    throw new Error("Method 'get()' must be implemented.");
  }

  /**
   * @param {string} key
   * @param {any} val
   * @param {number=} maxAge
   */
  async set(key, val, maxAge = 3600) {
    throw new Error("Method 'set()' must be implemented.");
  }

  /**
   * @param {string|string[]} key
   */
  async del(key) {
    throw new Error("Method 'del()' must be implemented.");
  }

  async keys() {
    throw new Error("Method 'keys()' must be implemented.");
  }

  get ready() {
    throw new Error("getter 'ready' must be implemented.");
  }
}

module.exports = {
  CacheProvider,
};
