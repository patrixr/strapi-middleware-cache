function getPermissionMiddlewares(method, path) {
  const availablePolicies = (
    strapi.plugins['users-permissions'] && strapi.plugins['users-permissions'].config.policies
  );

  const route = strapi.config.routes.find(r => {
    return r.path === path && r.method === method
  })

  if (!availablePolicies || !route) {
    return [];
  }

  const policies = (route && route.config && route.config.policies || []).filter(
    p => /^plugins::users-permissions\./.test(p)
  ).map(p => p.replace(/^plugins::users-permissions\./, ''))
  
  return [
    (ctx, next) => {
      const [controller, action] = route.handler.split('.');
      ctx.request.route = { controller, action };
      return next();
    },
    ...policies.map(p => availablePolicies[p])
  ]
}

module.exports = { getPermissionMiddlewares }
