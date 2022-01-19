module.exports = {
  default: () => ({
    provider: {
      name: 'memory',
      options: {},
    },
    strategy: {
      enableEtag: false,
      enableXCacheHeaders: false,
      clearRelatedCache: true,
      injectAdminMiddlewares: true,
      headers: [],
      maxAge: 3600000,
      cacheTimeout: 500,
      contentTypes: [],
    },
  }),
  validator() {},
};
