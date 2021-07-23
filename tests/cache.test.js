// const initMiddleware  = require('../lib/index');
// const { expect }      = require('chai');
// const agent           = require('supertest-koa-agent');
// const crypto          = require('crypto');
// const sinon           = require('sinon');
// const {
//   strapi,
//   requests,
//   reset
// } = require('./stubs/strapi');

describe('Caching', () => {
  // let middleware = null;
  // before(() => {
  //   sinon.stub(process, 'version').value('3.4.0');
  //   strapi.config = {
  //     middleware: {
  //       settings: {
  //         cache: {
  //           type: 'mem',
  //           enabled: true,
  //           populateContext: true,
  //           populateStrapiMiddleware: true,
  //           enableEtagSupport: true,
  //           clearRelatedCache: true,
  //           models: [
  //             'academy',
  //             'researcher',
  //             {
  //               model: 'homepage',
  //               singleType: true
  //             },
  //             {
  //               model: 'account',
  //               headers: ['Authorization'],
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   };
  //   middleware = initMiddleware(strapi);
  //   middleware.initialize();
  //   strapi.app.use((ctx, next) => {
  //     expect(ctx.middleware.cache).not.to.be.undefined
  //     expect(ctx.middleware.cache.bust).to.be.a('function')
  //     expect(ctx.middleware.cache.store).to.be.an('object')
  //     next();
  //   });
  //   expect(strapi.middleware.cache).not.to.be.undefined
  //   expect(strapi.middleware.cache.bust).to.be.a('function')
  //   expect(strapi.middleware.cache.store).to.be.an('object')
  //   strapi.start();
  // });
  // after(() => sinon.restore());
  // beforeEach(async () => {
  //   await middleware.cache.reset();
  //   reset();
  //   expect(requests).to.have.lengthOf(0);
  // })
  // describe('Collection types', () => {
  //   const expectedBody1 = { uid:1, method:'GET', url:'/academies', query: {} };
  //   const expectedBody2 = { uid:2, method:'GET', url:'/academies', query: {} };
  //   const expectedBody3 = { uid:3, method:'GET', url:'/academies', query: {} };
  //   const etag1 = crypto.createHash('md5').update(JSON.stringify(expectedBody1)).digest('hex')
  //   const etag2 = crypto.createHash('md5').update(JSON.stringify(expectedBody2)).digest('hex')
  //   const etag3 = crypto.createHash('md5').update(JSON.stringify(expectedBody3)).digest('hex')
  //   it('should let uncached requests go through', async () => {
  //     await agent(strapi.app)
  //       .get('/academies')
  //       .expect('Content-Type', /json/)
  //       .expect('ETag', `"${etag1}"`)
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //   });
  //   it('following request should be cached', async () => {
  //     const res1 = await agent(strapi.app)
  //       .get('/academies')
  //       .expect('ETag', `"${etag2}"`)
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //     const res2 = await agent(strapi.app)
  //       .get('/academies')
  //       .expect('ETag', `"${etag2}"`)
  //       .expect(200);
  //     expect(res1.body.uid).to.equal(res2.body.uid);
  //     expect(requests).to.have.lengthOf(1);
  //   });
  //   it('following request should have response status 304', async () => {
  //     const res1 = await agent(strapi.app)
  //       .get('/academies')
  //       .expect('ETag', `"${etag3}"`)
  //       .expect(200);
  //       const res2 = await agent(strapi.app)
  //       .get('/academies')
  //       .set('If-None-Match', `"${etag3}"`)
  //       .expect(304);
  //     expect(requests).to.have.lengthOf(1);
  //     expect(res2.body).to.be.an('object').that.is.empty;
  //   });
  //   it('caches based on headers', async () => {
  //     const res1 = await agent(strapi.app).get('/accounts/1').expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //     const res2 = await agent(strapi.app).get('/accounts/1').expect(200);
  //     expect(res1.body.uid).to.equal(res2.body.uid);
  //     expect(requests).to.have.lengthOf(1);
  //     const res3 = await agent(strapi.app).get('/accounts/1').set('Authorization', 'some_token').expect(200);
  //     expect(res1.body.uid).not.to.equal(res3.body.uid);
  //     expect(requests).to.have.lengthOf(2);
  //   });
  //   it('doesnt cache models not present in the config', async () => {
  //     const res1 = await agent(strapi.app)
  //       .get('/books')
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //     const res2 = await agent(strapi.app)
  //       .get('/books')
  //       .expect(200);
  //     expect(res1.body.uid).not.to.equal(res2.body.uid);
  //     expect(requests).to.have.lengthOf(2);
  //   });
  //   ['post', 'put', 'delete'].forEach(method => {
  //     it(`busts the cache on a ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(requests).to.have.lengthOf(1);
  //       const res2 = await agent(strapi.app)[method]('/academies').expect(200);
  //       expect(res2.body.uid).to.equal(res1.body.uid + 1);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //     });
  //     it(`busts the cache of a related model (via direct relation) on a ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/academies').expect(200);
  //       const res2 = await agent(strapi.app).get('/researchers').expect(200);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app)[method]('/academies').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //       const res4 = await agent(strapi.app).get('/researchers').expect(200);
  //       expect(res4.body.uid).to.equal(res3.body.uid + 1);
  //       expect(requests).to.have.lengthOf(4);
  //     });
  //     it(`busts the cache of a related model (via relation in component) on a ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/researchers').expect(200);
  //       const res2 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app)[method]('/researchers').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //       const res4 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(res4.body.uid).to.equal(res3.body.uid + 1);
  //       expect(requests).to.have.lengthOf(4);
  //     });
  //     context(`when an ID is specified on a ${method.toUpperCase()} request`, () => {
  //       it(`doesn't bust the cache for other IDs`, async () => {
  //         const res1 = await agent(strapi.app).get('/academies/1').expect(200);
  //         const res2 = await agent(strapi.app).get('/academies/2').expect(200);
  //         expect(requests).to.have.lengthOf(2);
  //         const res3 = await agent(strapi.app)[method]('/academies/1').expect(200);
  //         expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //         expect(requests).to.have.lengthOf(3);
  //         const res4 = await agent(strapi.app).get('/academies/2').expect(200);
  //         expect(res4.body.uid).to.equal(res2.body.uid);
  //         expect(requests).to.have.lengthOf(3);
  //       });
  //     });
  //     it(`busts the cache on an admin panel ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(requests).to.have.lengthOf(1);
  //       const res2 = await agent(strapi.app)[method]('/content-manager/collection-types/application::academy.academy').expect(200);
  //       expect(res2.body.uid).to.equal(res1.body.uid + 1);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //     });
  //     it(`busts the cache on an admin panel ${method.toUpperCase()} publishing change`, async () => {
  //       const res1 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(requests).to.have.lengthOf(1);
  //       const res2 = await agent(strapi.app)[method]('/content-manager/collection-types/application::academy.academy/1/actions/publish').expect(200);
  //       expect(res2.body.uid).to.equal(res1.body.uid + 1);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app).get('/academies').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //     });
  //   });
  // });
  // describe('Single types', async () => {
  //   it('caches non pluralized endpoints', async () => {
  //     const res1 = await agent(strapi.app)
  //       .get('/homepage')
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //     const res2 = await agent(strapi.app)
  //       .get('/homepage')
  //       .expect(200);
  //     expect(res1.body.uid).to.equal(res2.body.uid);
  //     expect(requests).to.have.lengthOf(1);
  //   });
  //   it('doesnt cache pluralized endpoints', async () => {
  //     await agent(strapi.app)
  //       .get('/homepages')
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(1);
  //     await agent(strapi.app)
  //       .get('/homepages')
  //       .expect(200);
  //     expect(requests).to.have.lengthOf(2);
  //   });
  //   ['post', 'put', 'delete'].forEach(method => {
  //     it(`busts the cache on a ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(requests).to.have.lengthOf(1);
  //       const res2 = await agent(strapi.app)[method]('/homepage').expect(200);
  //       expect(res2.body.uid).to.equal(res1.body.uid + 1);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //     });
  //     it(`busts the cache on an admin panel ${method.toUpperCase()} resquest`, async () => {
  //       const res1 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(requests).to.have.lengthOf(1);
  //       const res2 = await agent(strapi.app)[method]('/content-manager/single-types/application::homepage.homepage').expect(200);
  //       expect(res2.body.uid).to.equal(res1.body.uid + 1);
  //       expect(requests).to.have.lengthOf(2);
  //       const res3 = await agent(strapi.app).get('/homepage').expect(200);
  //       expect(res3.body.uid).to.equal(res2.body.uid + 1);
  //       expect(requests).to.have.lengthOf(3);
  //     });
  //   });
  // })
});
