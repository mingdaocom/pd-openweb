var fs = require('fs');
var path = require('path');
var WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
var webpackConfig = require('./webpack.config');
const { singleEntryList } = require('./webpack.common.config');

const isProduction = process.env.NODE_ENV === 'production';

class EntryMapGenPlugin {
  constructor(props) {
    this.path = props.path;
    this.filename = props.filename;
  }
  apply(compiler) {
    compiler.hooks.emit.tapAsync('EntryMapGenPlugin', (compilation, callback) => {
      let entries = [];
      [...compilation.chunks].forEach(chunk => ((chunk || {})._groups || []).forEach(group => entries.push(group)));
      const entryMapManifest = entries.reduce((acc, entry) => {
        const name = (entry.options || {}).name || (entry.runtimeChunk || {}).name;
        const files = [].concat(...(entry.chunks || []).map(chunk => chunk.files)).filter(Boolean);
        return name ? { ...acc, [name]: files } : acc;
      }, {});
      fs.mkdirSync(this.path, { recursive: true });
      fs.writeFileSync(path.join(this.path, this.filename), JSON.stringify(entryMapManifest, null, 2));
      callback();
    });
  }
}

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
      globals: ['src/common/global'],
      ...singleEntryList,
    },
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          extractComments: 'all',
          terserOptions: {
            safari10: true,
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    },
    plugins: [
      new WebpackBar(),
      new EntryMapGenPlugin({
        filename: 'entry-manifest.json',
        path: path.resolve(__dirname, '../build/dist/' + entryType),
      }),
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
    output: Object.assign({}, webpackConfig.output, {
      path: path.join(__dirname, `../build/dist/${entryType}/pack`),
    }),
  });
};
