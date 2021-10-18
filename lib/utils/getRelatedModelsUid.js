/**
 * Get models uid that is related to a ModelCacheConfig
 *
 * @param {ModelCacheConfig} cacheConf The model used to find related caches to purge
 * @return {string[]} Array of related models uid
 */
function getRelatedModelsUid(cacheConf) {
  const models = Object.assign(
    {},
    strapi.models,
    Object.values(strapi.plugins).reduce((acc, plugin) => {
      if (plugin.models) {
        return {
          ...acc,
          ...plugin.models,
        };
      }

      return acc;
    }, {})
  );
  const components = strapi.components;
  const modelObj = models[cacheConf.model];
  const attributes = modelObj?.allAttributes ?? {};
  const relatedComponents = [];
  /**
   * @type {any}
   */
  const relatedModels = {};

  // first, look for direct relations
  for (const key in attributes) {
    if (!Object.hasOwnProperty.call(attributes, key)) {
      continue;
    }

    const attr = attributes[key];

    if (!attr.via) continue;
    if (attr.plugin !== cacheConf.plugin) continue;

    if (attr.collection) {
      relatedModels[attr.collection] = models[attr.collection];
    } else if (attr.model && attr.model !== 'file') {
      relatedModels[attr.model] = models[attr.model];
    }
  }

  // second, look for relations to current model in components
  for (const compKey in components) {
    if (!Object.hasOwnProperty.call(components, compKey)) {
      continue;
    }

    const compObj = components[compKey];
    const attributes = compObj?.allAttributes ?? {};

    // look for the current model
    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }

      const attr = attributes[key];

      for (const _key in attr) {
        if (!Object.hasOwnProperty.call(attr, _key)) {
          continue;
        }

        const field = attr[_key];

        if (_key !== 'model') continue;
        if (attr.plugin !== cacheConf.plugin) continue;

        if (field === cacheConf.model) {
          relatedComponents.push(compKey);
        }
      }
    }

    // look one level deeper
    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }

      const attr = attributes[key];

      for (const _key in attr) {
        if (!Object.hasOwnProperty.call(attr, _key)) {
          continue;
        }
        const field = attr[_key];

        if (_key !== 'component' && _key !== 'components') continue;

        if (
          !Object.hasOwnProperty.call(relatedModels, cacheConf.model) &&
          (relatedComponents.includes(field) ||
            (Array.isArray(field) &&
              field.filter((x) => relatedComponents.includes(x)).length))
        ) {
          // plugin ?
          relatedComponents.push(compKey);
        }
      }
    }
  }

  // finally locate all the models that have the related components in their models
  for (const modelKey in models) {
    if (!Object.hasOwnProperty.call(models, modelKey)) {
      continue;
    }

    const modelObj = models[modelKey];
    const attributes = modelObj?.allAttributes ?? {};

    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }
      const attr = attributes[key];

      for (const _key in attr) {
        if (!Object.hasOwnProperty.call(attr, _key)) {
          continue;
        }

        const field = attr[key];

        if (key !== 'component' && key !== 'components') continue;

        if (
          !Object.hasOwnProperty.call(relatedModels, modelKey) &&
          (relatedComponents.includes(field) ||
            (Array.isArray(field) &&
              field.filter((x) => relatedComponents.includes(x)).length))
        ) {
          // plugin ?
          relatedModels[modelKey] = models[modelKey];
        }
      }
    }
  }

  return Object.values(relatedModels).reduce((acc, model) => {
    if (model.uid) {
      acc.push(model.uid);
    }
    return acc;
  }, []);
}

module.exports = getRelatedModelsUid;
