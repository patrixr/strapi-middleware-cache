'use strict';

/**
 * @typedef {import('@strapi/strapi').Strapi} Strapi
 */

/**
 * Get models uid that is related to a ModelCacheConfig
 *
 * @param {Strapi} strapi
 * @param {string} uid The contentType used to find related caches to purge
 * @return {string[]} Array of related models uid
 */
function getRelatedModelsUid(strapi, uid) {
  if (!uid) {
    return [];
  }

  const models = strapi.contentTypes;

  const { components } = strapi;
  const modelObj = models[uid];
  const modelAttributes = modelObj?.attributes ?? {};
  /**
   * @type {any[]}
   */
  const relatedComponents = [];
  /**
   * @type {any}
   */
  const relatedModels = {};

  // first, look for direct relations in other contentTypes
  for (const key in modelAttributes) {
    if (!Object.hasOwnProperty.call(modelAttributes, key)) {
      continue;
    }

    const attr = modelAttributes[key];

    if (attr.type !== 'relation') continue;
    if (!attr.target) continue;

    relatedModels[attr.target] = models[attr.target];
  }

  // second, look for relations to current model in components
  for (const compKey in components) {
    if (!Object.hasOwnProperty.call(components, compKey)) {
      continue;
    }

    const compObj = components[compKey];
    const attributes = compObj?.attributes ?? {};

    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }

      const attr = attributes[key];

      if (attr.type !== 'relation') continue;
      if (!attr.target) continue;

      if (attr.target === uid) {
        relatedComponents.push(compKey);
      }
    }
  }

  // third, look for nested components with relations to current model
  for (const compKey in components) {
    if (!Object.hasOwnProperty.call(components, compKey)) {
      continue;
    }
    const compObj = components[compKey];
    const attributes = compObj?.attributes ?? {};

    // check if current component contains another component that contains a relation to the current model
    // look one level deeper
    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }

      const attr = attributes[key];

      if (attr.type !== 'component') continue;
      if (!attr.component) continue;
      if (!relatedComponents.includes(attr.component)) continue;
      if (relatedComponents.includes(compKey)) continue;

      relatedComponents.push(compKey);
    }
  }

  // finally locate all the models that have the related components in their models
  for (const modelKey in models) {
    if (!Object.hasOwnProperty.call(models, modelKey)) {
      continue;
    }

    const otherModelObj = models[modelKey];
    const attributes = otherModelObj?.attributes ?? {};

    for (const key in attributes) {
      if (!Object.hasOwnProperty.call(attributes, key)) {
        continue;
      }
      const attr = attributes[key];

      if (attr.type !== 'component') continue;
      if (!attr.component) continue;
      if (!relatedComponents.includes(attr.component)) continue;
      if (relatedModels[modelKey]) continue;

      relatedModels[modelKey] = models[modelKey];
    }
  }

  const relatedModelUid = [];

  Object.values(relatedModels).reduce((acc, model) => {
    if (model.uid) {
      acc.push(model.uid);
    }
    return acc;
  }, relatedModelUid);

  return relatedModelUid;
}

module.exports = { getRelatedModelsUid };
