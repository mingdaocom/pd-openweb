const webpack = require('webpack');
const path = require('path');
const webpackConfig = require('./webpack.config');
const { getWebpackCacheDirectory, getWebpackCacheName } = require('./webpackCache');

const config = webpackConfig();
const ROOT_PATH = path.join(__dirname, '..');

module.exports = {
  resolve: Object.assign({}, config.resolve, {
    alias: Object.assign({}, config.resolve.alias, { uuid: 'src/utils/uuid' }),
  }),
  plugins: [
    new webpack.DefinePlugin({
      isBuildFunction: true,
    }),
  ],
  entry: path.join(
    __dirname,
    '../src/pages/widgetConfig/widgetSetting/components/FunctionEditorDialog/Func/releaseEntry.js',
  ),
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: ['thread-loader', 'babel-loader'],
      },
    ],
  },
  cache: {
    type: 'filesystem',
    name: getWebpackCacheName(ROOT_PATH, ['production-mdfunction']),
    cacheDirectory: getWebpackCacheDirectory(ROOT_PATH),
    buildDependencies: {
      config: [
        __filename,
        path.resolve(ROOT_PATH, 'CI/webpack.config.js'),
        path.resolve(ROOT_PATH, 'CI/webpackCache.js'),
        path.resolve(ROOT_PATH, '.babelrc'),
        path.resolve(ROOT_PATH, 'package.json'),
        path.resolve(ROOT_PATH, 'yarn.lock'),
      ],
    },
  },
  mode: 'production',
  output: {
    filename: 'mdfunction.bundle.js',
    path: path.join(__dirname, '../build/dist'),
    library: 'MdFunction',
    libraryTarget: 'var',
  },
};
