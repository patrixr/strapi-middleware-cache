module.exports = {
  default: () => ({
    provider: {
      name: 'memory',
      options: {},
    },
    strategy: {
      enableEtagSupport: false,
      enableXCacheHeaders: false,
      clearRelatedCache: false,
      injectAdminMiddlewares: true,
      headers: [],
      max: 500,
      maxAge: 3600000,
      cacheTimeout: 500,
      contentTypes: [],
    },
  }),
  validator() {},
};
