'use strict';

/**
 * Reject promise after timeout
 *
 * @param {Promise<any>} callback
 * @param {number} ms
 * @return {Promise<never>}
 */
function withTimeout(callback, ms) {
  return Promise.race([
    callback(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'));
      }, ms);
    }),
  ]);
}

module.exports = {
  withTimeout,
};
