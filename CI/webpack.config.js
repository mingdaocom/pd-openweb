const path = require('path');
const fs = require('fs');
const WebpackBar = require('webpackbar');
const TerserJSPlugin = require('terser-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { EsbuildPlugin } = require('esbuild-loader');

// Environment and build configuration
const ENV = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  version: require('child_process').execSync('git log --format="%H" -n 1').toString().trim(),
};

// Paths configuration
const PATHS = {
  root: path.resolve(__dirname, '..'),
  src: path.join(__dirname, '../src'),
  build: path.join(__dirname, '../build'),
};

// Asset configuration
const ASSET_CONFIG = {
  parser: {
    dataUrlCondition: {
      maxSize: ENV.isProduction ? 20000 : 1000000,
    },
  },
  generator: {
    filename: 'static/[name].[hash][ext]',
  },
};

// Loader configurations
const LOADERS = {
  css: ENV.isProduction
    ? [MiniCssExtractPlugin.loader, 'css-loader']
    : [{ loader: 'style-loader' }, { loader: 'css-loader', options: { sourceMap: true } }],

  less: [
    ...(ENV.isProduction
      ? [MiniCssExtractPlugin.loader, 'css-loader']
      : [{ loader: 'style-loader' }, { loader: 'css-loader', options: { sourceMap: true } }]),
    {
      loader: 'less-loader',
      options: {
        sourceMap: !ENV.isProduction,
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  ],

  js: [
    'thread-loader',
    'cache-loader',
    {
      loader: 'babel-loader',
      options: {
        compact: ENV.isProduction,
      },
    },
  ],
};

// Module rules configuration
const getModuleRules = () => {
  const rules = [
    {
      test: /\.css$/,
      use: LOADERS.css,
    },
    {
      test: /\.less$/,
      use: LOADERS.less,
    },
    {
      test: /\.(woff2|gif|jpg|png|svg|mp3|woff|eot|ttf)(\?[^?]*)?$/,
      type: 'asset',
      ...ASSET_CONFIG,
    },
    {
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      use: LOADERS.js,
    },
    {
      test: /\.html?$/,
      exclude: /(node_modules)/,
      use: 'raw-loader',
    },
    {
      test: /\.m?js$/,
      include: /node_modules\/(@ctrl\/tinycolor|intl-tel-input)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: { chrome: '69' } }]],
        },
      },
    },
  ];

  if (!ENV.isProduction) {
    rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });
  }

  return rules;
};

// Entry points configuration
const ENTRIES = {
  cookies: ['src/common/cookies'],
  globals: ['src/common/global'],
  vendors: ['src/library/jquery/jquery.min', 'src/library/plupload/plupload.full.min'],
  css: [
    'src/common/mdcss/basic.css',
    'src/common/mdcss/iconfont/mdfont.css',
    'src/common/mdcss/animate.css',
    'src/common/mdcss/tip.css',
    'src/common/mdcss/Themes/theme.less',
  ],
};

// Plugin configurations
const getPlugins = alonePath => {
  const plugins = [
    new WebpackBar(),
    new AssetsPlugin({
      filename: 'manifest.json',
      path: path.resolve(PATHS.build, `dist/${alonePath}`),
      prettyPrint: true,
      removeFullPathAutoPrefix: true,
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn', 'zh-tw', 'ja'],
    }),
  ];

  if (ENV.isProduction) {
    plugins.push(
      new MiniCssExtractPlugin({
        filename: '[contenthash].css',
        ignoreOrder: true,
      }),
    );
  } else {
    plugins.push(
      new CaseSensitivePathsPlugin(),
      // new CircularDependencyPlugin({
      //   include: /src/,
      //   exclude: /node_modules/,
      //   failOnError: true,
      //   allowAsyncCycles: true,
      //   cwd: process.cwd(),
      //   onDetected({ paths, compilation }) {
      //     const isAsyncImport = paths.some((filePath, i) => {
      //       if (i === paths.length - 1 || !fs.existsSync(filePath)) return false;
      //       const fileContent = fs.readFileSync(filePath, 'utf-8');
      //       const nextPath = paths[i + 1]
      //         .replace(/index\.jsx?$/, '')
      //         .split('/')
      //         .pop()
      //         .replace(/\..*/, '');
      //       return new RegExp(`import\\(.*${nextPath}.*\\)`).test(fileContent);
      //     });

      //     if (!isAsyncImport) {
      //       compilation.errors.push(new Error(`同步循环引用: ${paths.join(' -> ')}`));
      //     }
      //   },
      // }),
    );
  }

  if (!alonePath && ENV.isProduction) {
    // plugins.push(
    //   new SentryCliPlugin({
    //     include: 'build',
    //     release: `meihua_${ENV.version}`,
    //     ignore: ['node_modules', 'webpack.config.js'],
    //     urlPrefix: '~/meihua/',
    //   }),
    //   new SentryCliPlugin({
    //     include: 'build',
    //     release: `www_${ENV.version}`,
    //     ignore: ['node_modules', 'webpack.config.js'],
    //     urlPrefix: '~/www/',
    //   }),
    // );
  }

  // plugins.push(new BundleAnalyzerPlugin());

  return plugins;
};

// Split chunks configuration
const getSplitChunksConfig = alonePath => {
  const minChunks = ENV.isProduction ? 2 : 1;

  if (alonePath === 'single') return undefined;

  const baseConfig = {
    chunks: 'all',
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
  };

  if (alonePath === 'singleExtractModules') return baseConfig;

  return {
    ...baseConfig,
    chunks: 'initial',
    cacheGroups: {
      ...baseConfig.cacheGroups,
      core: {
        name: 'core',
        minChunks,
        minSize: 30000,
        test: module =>
          module.resource &&
          !!module.resource.match(/src\/pages\/(worksheet|Statistics|customPage|workflow|Role|Portal|integration)/),
      },
    },
  };
};

// Output configuration
const getOutputConfig = alonePath => ({
  filename: ENV.isProduction ? '[name].[chunkhash].entry.js' : '[name].dev.js',
  chunkFilename: ENV.isProduction ? '[name].[chunkhash].chunk.js' : '[name].dev.js',
  path: path.join(PATHS.build, `dist/${alonePath}/pack`.replace('//', '/')),
  sourceMapFilename: ENV.isProduction ? '[name].[contenthash].js.map' : '[name].js.map',
  pathinfo: false,
});

// Main webpack configuration
module.exports = function (alonePath = '') {
  return {
    entry: ENTRIES,
    output: getOutputConfig(alonePath),
    mode: ENV.isProduction ? 'production' : 'development',
    cache: true,
    module: {
      rules: getModuleRules(),
    },
    plugins: getPlugins(alonePath),
    resolve: {
      alias: {
        worksheet: 'src/pages/worksheet',
        mobile: 'src/pages/Mobile',
        statistics: 'src/pages/Statistics',
      },
      modules: [PATHS.root, PATHS.src, 'node_modules'],
      extensions: ['.js', '.jsx'],
    },
    optimization: {
      minimizer: [
        // new TerserJSPlugin({
        //   minify: TerserJSPlugin.esbuildMinify,
        //   terserOptions: {
        //     minify: true,
        //     target: 'chrome58',
        //     legalComments: 'none',
        //   },
        //   exclude: /\/node_modules/,
        // }),
        new EsbuildPlugin({
          target: 'chrome58',
          minify: true,
          legalComments: 'none',
          css: true,
          exclude: /node_modules/,
        }),
        ...(alonePath ? [] : [new CssMinimizerPlugin()]),
      ],
      splitChunks: getSplitChunksConfig(alonePath),
    },
    devtool: alonePath ? undefined : ENV.isProduction ? 'source-map' : 'eval',
    externals: { jquery: 'jQuery' },
  };
};
