module.exports = {
  default: () => ({
    logs: true,
    provider: {
      name: 'memory',
      options: { max: 100, maxAge: 3600 },
    },
    strategy: {
      enableEtagSupport: false,
      enableXCacheHeaders: false,
      clearRelatedCache: false,
      headers: [],
      max: 500,
      maxAge: 3600000,
      cacheTimeout: 500,
      contentTypes: [],
    },
  }),
  validator() {},
};
