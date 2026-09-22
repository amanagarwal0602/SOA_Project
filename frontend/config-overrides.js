const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: false,
    stream: false,
    assert: false,
    http: false,
    https: false,
    os: false,
    url: false,
    zlib: false,
  });
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ]);
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules.forEach((rule) => {
    if (rule.oneOf instanceof Array) {
      rule.oneOf.forEach((oneOf) => {
        if (oneOf.loader && oneOf.loader.indexOf('source-map-loader') >= 0) {
          oneOf.exclude = /node_modules/;
        }
      });
    }
  });
  return config;
};
