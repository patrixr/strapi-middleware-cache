'use strict';

module.exports = ({ env }) => ({
  debug: false,
  maxAge: env.int("ENABLE_MAX_AGE", 3600000),
  enableEtag: env.bool("ENABLE_ETAG", true),
  enableXCacheHeaders: env.bool("ENABLE_XCACHE_HEADERS", true),
  enableAdminCTBMiddleware: env.bool("ENABLE_ADMIN_CTB_MIDDLEWARE", true),
  resetOnStartup: env.bool("RESET_STARTUP", false),
  clearRelatedCache: env.bool("CREAR_RELATED_CACHE", true),
  keysPrefix: env.bool("KEYS_PREFIX", ''),
  keys: env.json("KEYS", {
    useHeaders: [],
    useQueryParams: true,
  }),
  hitpass: (ctx) =>
    Boolean(
      ctx.request.headers.authorization || ctx.request.headers.cookie
    ),
  contentTypes: [
    "api::article.article",
    "api::global.global",
    "api::homepage.homepage",
    {
      contentType: "api::category.category",
      maxAge: 3600000,
      hitpass: false,
      keys: {
        useQueryParams: false,
        useHeaders: ["accept-encoding"],
      },
      routes: [
        {
          path: "/api/categories/slug/:slug+",
          keys: {
            useQueryParams: ["populate", "locale"],
            useHeaders: [],
          },
          maxAge: 18000,
          method: "GET",
        },
      ],
    },
  ],
});