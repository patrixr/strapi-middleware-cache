// eslint-disable-next-line import/extensions
const packageJson = require('../package.json');

const pluginId = packageJson.name.replace(/^strapi-plugin-/i, '');

module.exports = pluginId;
