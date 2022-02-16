module.exports = {
  couchbase: {
    options: {
      connectionString: "couchbase://127.0.0.1:8091",
      connectionOptions: {
        username: "Administrator",
        password: "couchbase",
      },
      bucket: "test-bucket",
      ttl: 2,
    },
  },
  "strapi-plugin-rest-cache": {
    config: {
      provider: {
        name: "couchbase",
        max: 32767,
      },
      strategy: {
        enableEtag: true,
        enableXCacheHeaders: true,
        enableAdminCTBMiddleware: true,
        clearRelatedCache: true,
        resetOnStartup: true,
        maxAge: 420000,
        keys: {
          useQueryParams: true,
          useHeaders: ["accept-encoding"],
        },
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
                path: "/api/categories/slug/:slug",
                keys: {
                  useQueryParams: false,
                  useHeaders: ["accept-encoding", "authorization"],
                },
                maxAge: 18000,
                method: "GET",
              },
            ],
          },
        ],
      },
    },
  },
};
