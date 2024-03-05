const path = require('path');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const InjectPlugin = require('webpack-inject-plugin').default;
const config = require('./webpack.common.config');
const isProduction = process.env.NODE_ENV === 'production';
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

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
        minify: TerserJSPlugin.esbuildMinify,
        terserOptions: {
          target: 'chrome58',
          legalComments: 'none',
        },
        exclude: /\/node_modules/,
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
          reuseExistingChunk: true,
        },
        core: {
          name: 'core',
          minChunks: isProduction ? 2 : 1,
          test(module) {
            return (
              module.resource &&
              !!module.resource.match(/src\/pages\/(worksheet|Statistics|customPage|workflow|Role|Portal|integration)/)
            );
          },
        },
        modules_a: {
          name: 'modules_a',
          minChunks: isProduction ? 2 : 1,
          test: /[\\/]node_modules[\\/](?!hot-formula-parser|@mdfe|html5-qrcode|antd|@antv|mapbox-gl|lodash|@fullcalendar|react-dom|@sentry|codemirror|jspdf)/,
        },
        modules_b: {
          name: 'modules_b',
          minChunks: isProduction ? 2 : 1,
          test: /[\\/]node_modules[\\/](hot-formula-parser|@mdfe|html5-qrcode|antd|@antv|mapbox-gl|lodash|@fullcalendar|react-dom|@sentry|codemirror|jspdf)/,
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
            use: [MiniCssExtractPlugin.loader].concat([{ loader: 'css-loader' }]),
          },
          {
            test: /\.less$/,
            use: [MiniCssExtractPlugin.loader].concat([{ loader: 'css-loader' }, { loader: 'less-loader' }]),
          },
          {
            test: /\.(woff2)(\?[^?]*)?$/,
            use: {
              loader: 'url-loader',
              options: {
                name: 'static/[name].[hash].[ext]',
                limit: 300000,
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
            use: [{ loader: 'style-loader' }, { loader: 'css-loader', options: { sourceMap: true } }],
          },
          {
            test: /\.less$/,
            use: [
              { loader: 'style-loader' },
              { loader: 'css-loader', options: { sourceMap: true } },
              { loader: 'less-loader', options: { sourceMap: true } },
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
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: ['thread-loader', 'cache-loader', 'babel-loader'],
      },
      {
        test: /\.html?$/,
        exclude: /(node_modules)/,
        use: 'raw-loader',
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
    pathinfo: false,
  },
};
