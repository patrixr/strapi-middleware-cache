const Koa = require('koa');

const requests = [];

const reset = () => requests.length = 0;

let UID = 1

const strapi = {
  app: new Koa(),
  log: {
    info() {}
  },
  start() {
    this.app.use(ctx => {
      const data = {
        uid: UID++,
        method: ctx.method,
        url: ctx.url,
        query: ctx.query
      };


      requests.push(data);

      ctx.body = data;
      ctx.status = 200;
    });
  }
};


module.exports = { strapi, requests, reset };