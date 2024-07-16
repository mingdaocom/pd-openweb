const webpack = require('webpack');
const path = require('path');
const webpackConfig = require('./webpack.config');

const config = webpackConfig();

module.exports = {
  resolve: Object.assign({}, config.resolve, {
    alias: Object.assign({}, config.resolve.alias, { uuid: 'src/util/uuid' }),
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
        use: ['thread-loader', 'cache-loader', 'babel-loader'],
      },
    ],
  },
  mode: 'production',
  output: {
    filename: 'mdfunction.bundle.js',
    path: path.join(__dirname, '../build/dist'),
    library: 'MdFunction',
    libraryTarget: 'var',
  },
};
