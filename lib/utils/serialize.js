/**
 * @param {any} data
 * @return {string}
 */
function serialize(data) {
  return JSON.stringify({ data });
}

module.exports = serialize;
