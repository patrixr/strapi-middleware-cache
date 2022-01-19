module.exports = {
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: { max: 10, maxAge: 3600 },
      },
      strategy: {
        enableXCacheHeaders: true,
        clearRelatedCache: true,
        enableEtag: true,
        maxAge: 420000,
        injectAdminMiddlewares: true,
        headers: ["accept-encoding"],
        contentTypes: [
          "api::article.article",
          "api::global.global",
          "api::homepage.homepage",
          {
            contentType: "api::category.category",
            maxAge: 3600000,
            headers: ["accept-encoding", "accept-language"],
            routes: [
              {
                path: "/api/categories/slug/:slug",
                headers: ["authorization"],
                hitpass: false,
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
