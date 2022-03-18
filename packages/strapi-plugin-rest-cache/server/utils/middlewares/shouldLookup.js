'use strict';

function shouldLookup(
  ctx,
  hitpass // @todo: function or boolean => can be optimized
) {
  const type = typeof hitpass;

  if (type === 'boolean') {
    return !hitpass;
  }

  if (type === 'function') {
    return !hitpass(ctx);
  }

  return false;
}

module.exports = {
  shouldLookup,
};
