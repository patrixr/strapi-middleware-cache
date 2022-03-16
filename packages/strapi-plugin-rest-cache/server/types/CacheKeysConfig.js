'use strict';

class CacheKeysConfig {
  /**
   * @type {string[]}
   */
  useHeaders = [];

  /**
   * @type {Boolean|string[]}
   */
  useQueryParams = true;

  constructor(options = {}) {
    const { useHeaders = [], useQueryParams = true } = options;
    this.useHeaders = useHeaders;
    this.useQueryParams = useQueryParams;

    this.useHeaders.sort();
  }
}

module.exports = { CacheKeysConfig };
