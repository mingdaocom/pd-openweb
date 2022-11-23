const fs = require('fs');
const path = require('path');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const webpackConfig = require('./webpack.config');
const { singleEntryList } = require('./webpack.common.config');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (entryType) {
  return Object.assign({}, webpackConfig, {
    entry: {
      css: [
        'src/common/mdcss/basic.css',
        'src/common/mdcss/inStyle.css',
        'src/common/mdcss/iconfont/mdfont.css',
        'src/common/mdcss/animate.css',
        'src/common/mdcss/tip.css',
        'src/common/mdcss/Themes/theme.less',
      ],
      vendors: [
        'src/library/jquery/1.8.3/jquery',
        'src/library/lodash/lodash.min',
        'src/library/moment/moment.min',
        'src/library/jquery/1.8.3/jqueryAnimate',
        'src/library/jquery/1.8.3/jquery.mousewheel.min',
        'src/library/plupload/plupload.full.min',
        'src/library/moment/locale/zh-cn',
        'src/library/moment/locale/zh-tw',
      ],
      globals: ['src/common/global'],
      ...singleEntryList,
    },
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          terserOptions: {
            safari10: true,
            compress: {
              drop_console: true,
            },
          },
          extractComments: false,
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
      new InjectPlugin(function () {
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
