'use strict';

/**
 * @param {string} str
 * @return {any}
 */
function deserialize(str) {
  if (!str) {
    return null;
  }
  return JSON.parse(str).data;
}

module.exports = { deserialize };
