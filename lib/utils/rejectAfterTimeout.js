/**
 * Reject promise after timeout
 *
 * @param {number} ms
 * @return {Promise<never>}
 */
function rejectAfterTimeout(ms) {
  return new Promise((_, reject) => setTimeout(reject, ms));
}

module.exports = rejectAfterTimeout;
