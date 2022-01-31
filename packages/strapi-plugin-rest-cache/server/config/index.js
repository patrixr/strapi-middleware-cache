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
      enableAdminCTBMiddleware: true,
      resetOnStartup: false,
      clearRelatedCache: true,
      headers: [],
      maxAge: 3600000,
      contentTypes: [],
    },
  }),
  validator() {},
};
