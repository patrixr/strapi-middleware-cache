const Koa = require('koa');

const requests = [];

const reset = () => (requests.length = 0);

let UID = 1;

const strapi = {
  app: new Koa(),
  log: {
    error() {},
    warn() {},
    info() {},
    debug() {},
  },
  models: {
    academy: {
      kind: 'collectionType',
      collectionName: 'academies',
      allAttributes: {
        researchers: {
          via: 'academies',
          collection: 'researcher',
        },
      },
    },
    homepage: {
      kind: 'singleType',
      allAttributes: {
        body: {
          type: 'dynamiczone',
          components: ['layouts.researchers', 'layouts.images'],
        },
      },
    },
    researcher: {
      kind: 'collectionType',
      collectionName: 'researchers',
      allAttributes: {
        academy: {
          via: 'researcher',
          collection: 'academy',
        },
      },
    },
  },
  plugins: {
    'users-permissions': {
      models: {
        user: {},
      },
    },
  },
  components: {
    'fields.researcher': {
      allAttributes: {
        researcher: {
          model: 'researcher',
        },
      },
    },
    'layouts.researchers': {
      allAttributes: {
        text: {
          type: 'text',
        },
        researchers: {
          type: 'component',
          repeatable: true,
          component: 'fields.researcher',
        },
      },
    },
  },
  start() {
    this.app.use((ctx) => {
      const data = {
        uid: UID++,
        method: ctx.method,
        url: ctx.url,
        query: ctx.query,
      };

      requests.push(data);

      ctx.body = data;
      ctx.status = 200;
    });
  },
};

module.exports = { strapi, requests, reset };
