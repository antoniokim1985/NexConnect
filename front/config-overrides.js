// config-overrides.js
const path = require('path');

module.exports = function override(config, env) {
  config.resolve = {
    ...config.resolve,
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      util: require.resolve('util/'),
      // Otros polyfills necesarios, si es necesario
    }
  };

  return config;
};
