const path = require('path');
const fs = require('fs');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CircularDependencyPlugin = require('circular-dependency-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const rules = isProduction
  ? [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader].concat([{ loader: 'css-loader' }]) },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader].concat([{ loader: 'css-loader' }, { loader: 'less-loader' }]),
      },
      {
        test: /\.(woff2)(\?[^?]*)?$/,
        use: { loader: 'url-loader', options: { name: 'static/[name].[hash].[ext]', limit: 300000 } },
      },
      {
        test: /\.(gif|jpg|png|svg|mp3)(\?[^?]*)?$/,
        use: { loader: 'url-loader', options: { name: 'static/[name].[hash].[ext]', limit: 20000 } },
      },
      {
        test: /\.(woff|eot|ttf)(\?[^?]*)?$/,
        use: { loader: 'url-loader', options: { name: 'static/[name].[hash].[ext]', limit: 1 } },
      },
    ]
  : [
      {
        test: /\.(gif|jpg|png|svg|woff|woff2|eot|ttf|mp3)(\?[^?]*)?$/,
        use: { loader: 'url-loader', options: { name: 'static/[name].[hash].[ext]', limit: 1000000 } },
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
      { test: /\.js$/, enforce: 'pre', use: ['source-map-loader'] },
    ];
const minChunks = isProduction ? 2 : 1;

module.exports = function (alonePath = '') {
  return {
    entry: {
      cookies: ['src/common/cookies'],
      globals: ['src/common/global'],
      vendors: [
        'src/library/jquery/jquery.min',
        'src/library/jquery/jquery.mousewheel.min',
        'src/library/plupload/plupload.full.min',
      ],
      css: [
        'src/common/mdcss/basic.css',
        'src/common/mdcss/iconfont/mdfont.css',
        'src/common/mdcss/animate.css',
        'src/common/mdcss/tip.css',
        'src/common/mdcss/Themes/theme.less',
      ],
    },
    output: {
      filename: isProduction ? '[name].[chunkhash].entry.js' : '[name].dev.js',
      chunkFilename: isProduction ? '[name].[chunkhash].chunk.js' : '[name].dev.js',
      path: path.join(__dirname, `../build/dist/${alonePath}/pack`.replace('//', '/')),
      sourceMapFilename: isProduction ? '[name].[contenthash].js.map' : '[name].js.map',
      pathinfo: false,
    },
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        ...rules,
        { test: /\.jsx?$/, exclude: /(node_modules)/, use: ['thread-loader', 'cache-loader', 'babel-loader'] },
        { test: /\.html?$/, exclude: /(node_modules)/, use: 'raw-loader' },
      ],
    },
    plugins: [
      new WebpackBar(),
      new AssetsPlugin({
        filename: 'manifest.json',
        path: path.resolve(__dirname, `../build/dist/${alonePath}`),
        prettyPrint: true,
        removeFullPathAutoPrefix: true,
      }),
      new MomentLocalesPlugin({ localesToKeep: ['es-us', 'zh-cn', 'zh-tw', 'ja'] }),
      ...(isProduction
        ? [new MiniCssExtractPlugin({ filename: '[contenthash].css', ignoreOrder: true })]
        : [
            new CaseSensitivePathsPlugin(),
            // new CircularDependencyPlugin({
            //   include: /src/,
            //   exclude: /node_modules/,
            //   failOnError: true,
            //   allowAsyncCycles: true,
            //   cwd: process.cwd(),
            //   onDetected({ module, paths, compilation }) {
            //     // 获取文件的绝对路径

            //     let isAsyncImport = false;

            //     for (let i = 0; i < paths.length - 1; i++) {
            //       const filePath = paths[i];

            //       // 读取文件内容
            //       if (filePath && fs.existsSync(filePath)) {
            //         const fileContent = fs.readFileSync(filePath, 'utf-8');
            //         const nextPath = paths[i + 1]
            //           .replace(/index\.jsx?$/, '')
            //           .split('/')
            //           .pop()
            //           .replace(/\..*/, '');
            //         const regex = new RegExp(`import\\(.*${nextPath}.*\\)`);

            //         if (regex.test(fileContent)) {
            //           isAsyncImport = true;
            //           break;
            //         }
            //       }
            //     }

            //     // 如果不是异步引用，则报错
            //     if (!isAsyncImport) {
            //       compilation.errors.push(new Error(`同步循环引用: ${paths.join(' -> ')}`));
            //     }
            //   },
            // }),
          ]),
      // new BundleAnalyzerPlugin(),
    ],
    resolve: {
      alias: {
        worksheet: 'src/pages/worksheet',
        mobile: 'src/pages/Mobile',
        statistics: 'src/pages/Statistics',
      },
      modules: [path.resolve(__dirname, '../'), path.join(__dirname, '../src'), 'node_modules'],
      extensions: ['.js', '.jsx'],
    },
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          minify: TerserJSPlugin.esbuildMinify,
          terserOptions: {
            minify: true,
            target: 'chrome58',
            legalComments: 'none',
          },
          exclude: /\/node_modules/,
        }),
        ...(alonePath ? [] : [new CssMinimizerPlugin()]),
      ],
      splitChunks:
        alonePath === 'single'
          ? undefined
          : alonePath === 'singleExtractModules'
            ? {
                chunks: 'initial',
                minSize: 2000000,
                cacheGroups: {
                  common: {
                    name: 'common',
                    minChunks,
                    priority: -10,
                    reuseExistingChunk: true,
                    minSize: 30000,
                  },
                  node_modules: {
                    minSize: 30000,
                    name: 'node_modules',
                    minChunks,
                    test: /[\\/]node_modules[\\/]/,
                  },
                  default: false,
                },
              }
            : {
                chunks: 'initial',
                minSize: 2000000,
                cacheGroups: {
                  common: {
                    name: 'common',
                    minChunks: 2,
                    priority: -10,
                    reuseExistingChunk: true,
                    minSize: 30000,
                  },
                  core: {
                    name: 'core',
                    minChunks,
                    minSize: 30000,
                    test(module) {
                      return (
                        module.resource &&
                        !!module.resource.match(
                          /src\/pages\/(worksheet|Statistics|customPage|workflow|Role|Portal|integration)/,
                        )
                      );
                    },
                  },
                  node_modules: {
                    minSize: 30000,
                    name: 'node_modules',
                    minChunks,
                    test: /[\\/]node_modules[\\/]/,
                  },
                  default: false,
                },
              },
    },
    cache: true,
    devtool: alonePath || isProduction ? undefined : 'eval',
    externals: { jquery: 'jQuery' },
  };
};
