'use strict';

async function etagLookup(cacheKey) {
  const store = strapi.plugin('rest-cache').service('cacheStore');
  const etagCached = await store.get(`${cacheKey}_etag`);

  if (etagCached) {
    return etagCached;
  }

  return null;
}

module.exports = { etagLookup };
