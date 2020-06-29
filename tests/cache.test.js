const initMiddleware  = require('../lib/index');
const { expect }      = require('chai');
const agent           = require('supertest-koa-agent');
const {
  strapi,
  requests,
  reset
} = require('./stubs/strapi');

describe('Caching', () => {
  let middleware = null;

  before(() => {
    strapi.config = {
      middleware: {
        settings: {
          cache: {
            type: 'redis',
            enabled: true,
            models: ['posts']
          }
        }
      }
    };

    middleware = initMiddleware(strapi);
    middleware.initialize();

    strapi.start();
  });

  beforeEach(async () => {
    await middleware.cache.reset();
    reset();
    expect(requests).to.have.lengthOf(0);
  })

  it('should let uncached requests go through', async () => {
    const res = await agent(strapi.app)
      .get('/posts')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(requests).to.have.lengthOf(1);
  });

  it('following request should be cached', async () => {
    const res1 = await agent(strapi.app)
      .get('/posts')
      .expect(200);

    expect(requests).to.have.lengthOf(1);

    const res2 = await agent(strapi.app)
      .get('/posts')
      .expect(200);

    expect(res1.body.uid).to.equal(res2.body.uid);
    expect(requests).to.have.lengthOf(1);
  });

  it('doesnt cache models not present in the config', async () => {
    const res1 = await agent(strapi.app)
      .get('/books')
      .expect(200);

    expect(requests).to.have.lengthOf(1);

    const res2 = await agent(strapi.app)
      .get('/books')
      .expect(200);

    expect(res1.body.uid).not.to.equal(res2.body.uid);
    expect(requests).to.have.lengthOf(2);
  });

  ['post', 'put', 'delete'].forEach(method => {
    it(`busts the cache on a ${method.toUpperCase()} resquest`, async () => {
      const res1 = await agent(strapi.app).get('/posts').expect(200);

      expect(requests).to.have.lengthOf(1);

      const res2 = await agent(strapi.app)[method]('/posts').expect(200);

      expect(res2.body.uid).to.equal(res1.body.uid + 1);
      expect(requests).to.have.lengthOf(2);

      const res3 = await agent(strapi.app).get('/posts').expect(200);

      expect(res3.body.uid).to.equal(res2.body.uid + 1);
      expect(requests).to.have.lengthOf(3);
    });

    it(`busts the cache on an admin panel ${method.toUpperCase()} resquest`, async () => {
      const res1 = await agent(strapi.app).get('/posts').expect(200);

      expect(requests).to.have.lengthOf(1);

      const res2 = await agent(strapi.app)[method]('/content-manager/explorer/application::post.post').expect(200);

      expect(res2.body.uid).to.equal(res1.body.uid + 1);
      expect(requests).to.have.lengthOf(2);

      const res3 = await agent(strapi.app).get('/posts').expect(200);

      expect(res3.body.uid).to.equal(res2.body.uid + 1);
      expect(requests).to.have.lengthOf(3);
    });
  });
});