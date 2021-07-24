/**
 * Reject promise after timeout
 *
 * @param {number} ms
 * @return {Promise}
 */
function rejectAfterTimeout(ms) {
  return new Promise((_, reject) => setTimeout(reject, ms));
}

module.exports = rejectAfterTimeout;
