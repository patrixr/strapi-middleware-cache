"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/categories/slug/:slug+",
      handler: "category.findBySlug",
    },
  ],
};
