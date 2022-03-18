'use strict';

function generateHeadersKey(ctx, useHeaders = []) {
  return useHeaders
    .filter((k) => ctx.request.header[k] !== undefined)
    .map((k) => `${k.toLowerCase()}=${ctx.request.header[k.toLowerCase()]}`) // headers are key insensitive
    .join(',');
}

module.exports = { generateHeadersKey };
