"use strict";

/**
 *  category controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::category.category",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;
      const { query } = ctx;

      let populate;
      if (query.populate) {
        if (query.populate === "*") {
          populate = true;
        } else {
          populate = query.populate.split(",");
        }
      }

      const category = await strapi.db.query("api::category.category").findOne({
        where: {
          slug,
        },
        populate,
      });

      const sanitizedEntity = await this.sanitizeOutput(category, ctx);

      return this.transformResponse(sanitizedEntity);
    },
  })
);
