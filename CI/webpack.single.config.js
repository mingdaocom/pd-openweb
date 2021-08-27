var path = require('path');
var WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
var webpackConfig = require('./webpack.config');
const { singleEntryList } = require('./webpack.common.config');
const isProduction = process.env.NODE_ENV === 'production';
module.exports = Object.assign({}, webpackConfig, {
  entry: {
    css: [
      'src/common/mdcss/basic.css',
      'src/common/mdcss/inStyle.css',
      'src/common/mdcss/iconfont/mdfont.css',
      'src/common/mdcss/animate.css',
      'src/common/mdcss/tip.css',
      'src/common/mdcss/Themes/theme.less',
    ],
    vendors: (isProduction
      ? ['src/library/jquery/1.8.3/jquery', 'src/library/lodash/lodash.min', 'src/library/moment/moment.min']
      : ['src/library/jquery/1.8.3/jquery-debug', 'src/library/lodash/lodash', 'src/library/moment/moment']
    ).concat([
      'src/library/jquery/1.8.3/jqueryAnimate',
      'src/library/jquery/1.8.3/jquery.mousewheel.min',
      'src/library/plupload/plupload.full.min',
      'src/library/moment/locale/zh-cn',
      'src/library/moment/locale/zh-tw',
    ]),
    globals: ['src/common/global', 'src/common/privatization'],
    ...singleEntryList,
  },
  optimization: {
    minimizer: [new TerserJSPlugin({ extractComments: 'all' })],
  },
  plugins: [
    new WebpackBar(),
    new AssetsPlugin({
      filename: 'manifest.json',
      path: path.resolve(__dirname, '../build/dist/single'),
      prettyPrint: true,
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
  output: Object.assign({}, webpackConfig.output, {
    path: path.join(__dirname, `../build/dist/single/pack`),
  }),
});
