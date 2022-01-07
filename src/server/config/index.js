module.exports = {
  default: () => ({
    type: 'mem',
    logs: true,
    enableEtagSupport: false,
    enableXCacheHeaders: false,
    clearRelatedCache: false,
    withKoaContext: false,
    withStrapiMiddleware: false,
    headers: [],
    max: 500,
    maxAge: 3600000,
    cacheTimeout: 500,
    contentTypes: [],
  }),
  validator() {},
};
