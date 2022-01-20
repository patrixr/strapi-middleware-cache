module.exports = {
  default: () => ({
    provider: {
      name: 'memory',
      getTimeout: 500,
      options: {},
    },
    strategy: {
      enableEtag: false,
      enableXCacheHeaders: false,
      resetOnStartup: false,
      clearRelatedCache: true,
      injectAdminMiddlewares: true,
      headers: [],
      maxAge: 3600000,
      contentTypes: [],
    },
  }),
  validator() {},
};
