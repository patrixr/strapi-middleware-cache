'use strict';

const config = {
  default: () => ({
    provider: {
      name: 'memory',
      getTimeout: 500,
      options: {},
    },
    strategy: {
      debug: false,
      enableEtag: false,
      enableXCacheHeaders: false,
      enableAdminCTBMiddleware: true,
      resetOnStartup: false,
      clearRelatedCache: true,
      keysPrefix: '',
      keys: {
        useHeaders: [],
        useQueryParams: true,
      },
      hitpass: (ctx) =>
        Boolean(
          ctx.request.headers.authorization || ctx.request.headers.cookie
        ),
      maxAge: 3600000,
      contentTypes: [],
    },
  }),
  validator() {},
};

module.exports = {
  config,
};
