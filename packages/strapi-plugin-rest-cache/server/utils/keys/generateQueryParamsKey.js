'use strict';

function generateQueryParamsKey(
  ctx,
  useQueryParams = true // @todo: array or boolean => can be optimized
) {
  let keys = [];

  if (useQueryParams === true) {
    keys = Object.keys(ctx.query);
  } else if (useQueryParams.length > 0) {
    keys = Object.keys(ctx.query).filter((key) => useQueryParams.includes(key));
  }

  if (keys.length === 0) {
    return '';
  }

  keys.sort();

  return keys
    .map(
      (k) =>
        `${k}=${
          typeof ctx.query[k] === 'object'
            ? JSON.stringify(ctx.query[k])
            : ctx.query[k]
        }`
    ) // query strings are key sensitive
    .join(',');
}

module.exports = { generateQueryParamsKey };
