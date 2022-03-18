'use strict';

/**
 * Reject promise after timeout
 *
 * @todo this is slow, we should find a way to do this in a faster way
 * @param {Promise<any>} callback
 * @param {number} ms
 * @return {Promise<never>}
 */
function withTimeout(callback, ms) {
  let timeout;

  return Promise.race([
    callback().then((result) => {
      clearTimeout(timeout);
      return result;
    }),
    new Promise((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error('timeout'));
      }, ms);
    }),
  ]);
}

module.exports = {
  withTimeout,
};
