/**
 * @param {string[]} a
 * @param {string[]} b
 * @return {boolean}
 */
function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

module.exports = arrayEquals;
