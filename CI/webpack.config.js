var path = require('path');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const config = require('./webpack.common.config');
const isProduction = process.env.NODE_ENV === 'production';
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

function pathJoin(basedir, pathstr) {
  if (typeof pathstr === 'string') {
    return path.join(basedir, pathstr);
  } else if (typeof pathstr === 'object' && typeof pathstr.length !== 'undefined') {
    return pathstr.map(p => pathJoin(basedir, p));
  } else {
    const result = {};
    Object.keys(pathstr).forEach(key => {
      result[key] = pathJoin(basedir, pathstr[key]);
    });
    return result;
  }
}

const POSTCSS_LOADER = {
  loader: 'postcss-loader',
};

const generateCssLoader = (isModule = false) => [
  {
    loader: 'css-loader',
    options: isModule ? { module: true, localIdentName: '[local]___[hash:base64:5]' } : undefined,
  },
  POSTCSS_LOADER,
];

const CSS_LOADERS = generateCssLoader();

const SCRIPT_VENDORS = config.entry.vendors.map(p => path.resolve(__dirname, '../', p + '.js'));
const SCRIPT_LOADER_BASE = [{ loader: 'script-loader' }];
const VENDORS_LOADERS = SCRIPT_LOADER_BASE;

module.exports = {
  entry: config.entry,
  cache: true,
  plugins: [
    new WebpackBar(),
    new AssetsPlugin({
      filename: 'manifest.json',
      path: path.resolve(__dirname, '../build/dist/'),
      prettyPrint: true,
      removeFullPathAutoPrefix: true,
    }),
    new InjectPlugin(function() {
      return `__webpack_public_path__ = window.__webpack_public_path__;`;
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn', 'zh-tw', 'ja'],
    }),
  ].concat(
    isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: '[contenthash].css',
            ignoreOrder: true,
          }),
        ]
      : [new CaseSensitivePathsPlugin()],
  ),
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          safari10: true,
          compress: {
            pure_funcs: ['console.log'],
          },
        },
        extractComments: 'all',
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      cacheGroups: {
        common: {
          name: 'common',
          minChunks: 2,
          priority: -10,
        },
        nodemodules: {
          name: 'nodemodules',
          minChunks: isProduction ? 2 : 1,
          test: /[\\/]node_modules[\\/](?!mathjs|react-handsontable|handsontable|hot-formula-parser)/,
        },
        default: false,
      },
    },
  },
  module: {
    rules: (isProduction
      ? [
          {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader].concat(CSS_LOADERS),
          },
          {
            test: /\.less$/,
            oneOf: [
              {
                resourceQuery: /^\?module$/,
                use: [MiniCssExtractPlugin.loader].concat(config.generateLessLoader(true)),
              },
              {
                use: [MiniCssExtractPlugin.loader].concat(config.generateLessLoader()),
              },
            ],
          },
          {
            test: /\.(woff2)(\?[^?]*)?$/,
            use: {
              loader: 'url-loader',
              options: {
                name: 'static/[name].[hash].[ext]',
                limit: 100000,
              },
            },
          },
          {
            test: /\.(gif|jpg|png|svg)(\?[^?]*)?$/,
            use: {
              loader: 'url-loader',
              options: {
                name: 'static/[name].[hash].[ext]',
                limit: 20000,
              },
            },
          },
          {
            test: /\.(woff|eot|ttf)(\?[^?]*)?$/,
            use: {
              loader: 'url-loader',
              options: {
                name: 'static/[name].[hash].[ext]',
                limit: 1,
              },
            },
          },
        ]
      : [
          {
            test: /\.(gif|jpg|png|svg|woff|woff2|eot|ttf)(\?[^?]*)?$/,
            use: {
              loader: 'url-loader',
              options: {
                name: 'static/[name].[hash].[ext]',
                limit: 1000000,
              },
            },
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
                options: { sourceMap: true },
              },
              {
                loader: 'postcss-loader',
                options: { sourceMap: true },
              },
            ],
          },
          {
            test: /\.less$/,
            oneOf: [
              {
                resourceQuery: /^\?module$/,
                use: config.generateLessLoader(true),
              },
              {
                use: config.generateLessLoader(),
              },
            ],
          },
          {
            test: /\.js$/,
            enforce: 'pre',
            use: ['source-map-loader'],
          },
        ]
    ).concat([
      {
        test: /\.js$/,
        include: pathJoin(path.join(__dirname, '../'), SCRIPT_VENDORS),
        use: VENDORS_LOADERS,
      },
      {
        test: /\.jsx?$/,
        exclude: [/node_modules|seajs/],
        use: ['thread-loader', 'cache-loader', 'babel-loader'],
      },
      {
        test: /\.html?$/,
        use: 'raw-loader',
      },
      {
        test: /\.tpl$/,
        use: ['@mdfe/dot-loader'],
      },
    ]),
  },
  externals: config.externals,
  resolve: config.resolve,
  devtool: isProduction ? undefined : 'eval',
  mode: isProduction ? 'production' : 'development',
  output: {
    filename: isProduction ? '[name].[chunkhash].entry.js' : '[name].dev.js',
    chunkFilename: isProduction ? '[name].[chunkhash].chunk.js' : '[name].dev.js',
    path: path.join(__dirname, '../build/dist/pack'),
    sourceMapFilename: isProduction ? '[name].[contenthash].js.map' : '[name].js.map',
  },
};
