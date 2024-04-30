const fs = require('fs');
const path = require('path');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const webpackConfig = require('./webpack.config');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function(entryType) {
  return Object.assign({}, webpackConfig, {
    entry: {
      css: [
        'src/common/mdcss/basic.css',
        'src/common/mdcss/iconfont/mdfont.css',
        'src/common/mdcss/animate.css',
        'src/common/mdcss/tip.css',
        'src/common/mdcss/Themes/theme.less',
      ],
      vendors: [
        'src/library/jquery/jquery.min',
        'src/library/jquery/jquery.mousewheel.min',
        'src/library/plupload/plupload.full.min',
      ],
      globals: ['src/common/global'],
    },
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          minify: TerserJSPlugin.esbuildMinify,
          terserOptions: {
            target: 'chrome58',
            legalComments: 'none',
          },
          exclude: /\/node_modules/,
        }),
      ],
    },
    plugins: [
      new WebpackBar(),
      new AssetsPlugin({
        filename: 'manifest.json',
        path: path.resolve(__dirname, '../build/dist/' + entryType),
        prettyPrint: true,
        removeFullPathAutoPrefix: true,
      }),
      new MiniCssExtractPlugin({
        filename: '[contenthash].css',
        ignoreOrder: true,
      }),
      new InjectPlugin(function() {
        return '__webpack_public_path__ = window.__webpack_public_path__;';
      }),
      // new BundleAnalyzerPlugin(),
    ],
    devtool: undefined,
    output: Object.assign({}, webpackConfig.output, {
      path: path.join(__dirname, `../build/dist/${entryType}/pack`),
    }),
  });
};
