"use strict";

const { setup, teardown, agent, adminAgent } = require("./helpers/strapi");

jest.setTimeout(60000);
process.env.STRAPI_HIDE_STARTUP_MESSAGE = true;

describe("single-type with default settings", () => {
  beforeAll(setup);
  afterAll(teardown);

  beforeEach(() => strapi.plugin("rest-cache").service("cacheStore").reset());

  describe("basic GET request", () => {
    it("should send a fresh content on first request", async () => {
      expect.assertions(2);

      const first = await agent().get("/api/homepage");

      expect(first.status).toBe(200);
      expect(first.get("x-cache")).toBe("MISS");
    });
    it("should send cached content on second request", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent().get("/api/homepage");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(second.get("x-cache")).toBe("HIT");
    });
    it("should match body content on cached request", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent().get("/api/homepage");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(JSON.stringify(first.body)).toBe(JSON.stringify(second.body));
    });
    it("should not conflict with query params", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent().get("/api/homepage?populate=*&locale=en");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(second.get("x-cache")).toBe("MISS");
    });
    it("should not care about query params order", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage?populate=*&locale=en");
      const second = await agent().get("/api/homepage?locale=en&populate=*");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(second.get("x-cache")).toBe("HIT");
    });
  });

  describe("etag", () => {
    it("should match etag content on second request", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent().get("/api/homepage");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(first.get("etag")).toBe(second.get("etag"));
    });
    it("should send a 304 (Not Modified) when valid If-None-Match header is set", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent()
        .get("/api/homepage")
        .set("If-None-Match", first.get("etag"));

      expect(first.status).toBe(200);
      expect(second.status).toBe(304);
      expect(second.get("x-cache")).toBe("HIT");
    });
    it("should send fresh content when invalid If-None-Match header is set", async () => {
      expect.assertions(3);

      const first = await agent().get("/api/homepage");
      const second = await agent()
        .get("/api/homepage")
        .set("If-None-Match", "invalid-etag");

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(second.get("x-cache")).toBe("HIT");
    });
  });

  describe("admin content-manager interactions", () => {
    it("should clear cache when admin update entity", async () => {
      expect.assertions(5);

      const first = await agent().get("/api/homepage");
      const update = await adminAgent()
        .put(
          "/content-manager/single-types/api::homepage.homepage?plugins[i18n][locale]=en"
        )
        .send({
          id: 1,
          createdAt: "2022-03-10T17:04:30.085Z",
          updatedAt: "2022-03-10T17:04:30.085Z",
          locale: "en",
          seo: {
            id: 1,
            metaTitle: "My personal Strapi blog",
            metaDescription: "Discover my SEO friendly blog built with Strapi.",
            shareImage: 1,
            highlights: null,
          },
          hero: { id: 1, title: "My blogs" },
          highlights: null,
          updatedBy: null,
          localizations: [],
        });
      const second = await agent().get("/api/homepage");

      expect(update.status).toBe(200);
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(first.get("x-cache")).toBe("MISS");
      expect(second.get("x-cache")).toBe("MISS");
    });
  });
});
