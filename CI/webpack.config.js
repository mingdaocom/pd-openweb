const path = require('path');
const webpack = require('webpack');
const WebpackBar = require('webpackbar');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { EsbuildPlugin } = require('esbuild-loader');
const { getWebpackCacheDirectory, getWebpackCacheName } = require('./webpackCache');

// Environment and build configuration
const ENV = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  shouldUploadSentrySourcemap: (process.env.SENTRY_UPLOAD_SOURCEMAP || '').trim() === 'true',
  version: require('child_process').execSync('git log --format="%H" -n 1').toString().trim(),
};

const BUILD_CONSTANTS = {
  ENABLE_FASTGPT: JSON.stringify(process.env.ENABLE_FASTGPT === 'true'),
  FAST_GPT_CONFIG_BASE64: JSON.stringify(process.env.FAST_GPT_CONFIG_BASE64 || ''),
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
      include: /node_modules\/(@ctrl\/tinycolor)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: { chrome: '58' } }]],
        },
      },
    },
  ];

  if (!ENV.isProduction) {
    rules.push({
      test: /\.js$/,
      enforce: 'pre',
      exclude: /node_modules/,
      use: ['source-map-loader'],
    });
  }

  return rules;
};

// Entry points configuration
const ENTRIES = {
  cookies: ['src/common/cookies'],
  globals: ['src/common/global'],
  vendors: ['src/library/jquery/global', 'src/library/plupload/plupload.full.min'],
  css: ['src/common/mdcss/basic.css', 'src/common/mdcss/iconfont/mdfont.css', 'src/common/mdcss/animate.css'],
};

// Plugin configurations
const getPlugins = alonePath => {
  const plugins = [
    new webpack.DefinePlugin(BUILD_CONSTANTS),
    new WebpackBar(),
    new AssetsPlugin({
      filename: 'manifest.json',
      path: path.resolve(PATHS.build, `dist/${alonePath}`),
      prettyPrint: true,
      removeFullPathAutoPrefix: true,
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['es-us', 'zh-cn', 'zh-tw', 'ja', 'th', 'ms'],
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
    plugins.push(new CaseSensitivePathsPlugin());
  }

  if (!alonePath && ENV.isProduction && ENV.shouldUploadSentrySourcemap) {
    plugins.push(
      sentryWebpackPlugin({
        release: {
          name: `meihua_${ENV.version}`,
          inject: false,
          uploadLegacySourcemaps: [
            { paths: ['build'], ignore: ['node_modules', 'webpack.config.js'], urlPrefix: '~/meihua/' },
          ],
        },
        sourcemaps: {
          disable: true,
        },
      }),
      sentryWebpackPlugin({
        release: {
          name: `www_${ENV.version}`,
          inject: false,
          uploadLegacySourcemaps: [
            { paths: ['build'], ignore: ['node_modules', 'webpack.config.js'], urlPrefix: '~/www/' },
          ],
        },
        sourcemaps: {
          disable: true,
        },
      }),
    );
  }

  return plugins;
};

// Split chunks configuration
const createAsyncVendorCacheGroup = (name, test) => ({
  name,
  test,
  chunks: 'async',
  priority: 30,
  enforce: true,
  reuseExistingChunk: true,
});

const ASYNC_VENDOR_CACHE_GROUPS = {
  asyncVditor: createAsyncVendorCacheGroup('async-vditor', /[\\/]node_modules[\\/]@mdfe[\\/]vditor[\\/]/),
  asyncCodeMirror: createAsyncVendorCacheGroup('async-codemirror', /[\\/]node_modules[\\/]codemirror[\\/]/),
  asyncCkeditor: createAsyncVendorCacheGroup('async-ckeditor', /[\\/]node_modules[\\/](@ckeditor[\\/]|ckeditor5[\\/])/),
  asyncMjml: createAsyncVendorCacheGroup(
    'async-mjml',
    /[\\/]node_modules[\\/](mjml-browser|mjml-core|mjml-[^\\/]+)[\\/]/,
  ),
  asyncMermaid: createAsyncVendorCacheGroup(
    'async-mermaid',
    /[\\/]node_modules[\\/](@mermaid-js[\\/][^\\/]+|mermaid|cytoscape|cytoscape-[^\\/]+|dagre-d3-es|roughjs|khroma|langium|chevrotain|chevrotain-allstar|@chevrotain[\\/][^\\/]+|vscode-languageserver|vscode-languageserver-protocol|vscode-languageserver-types|vscode-jsonrpc|vscode-uri)[\\/]/,
  ),
  asyncAntvChart: createAsyncVendorCacheGroup(
    'async-antv-chart',
    /[\\/]node_modules[\\/](@antv[\\/](g2|g2plot|component|g-base|g-canvas|g-svg|scale|util)[\\/])/,
  ),
  asyncAntvShared: createAsyncVendorCacheGroup(
    'async-antv-shared',
    /[\\/]node_modules[\\/](@antv[\\/](async-hook|dom-util|event-emitter|g-device-api|g-webgpu|g-webgpu-[^\\/]+|g-math|matrix-util|path-util)[\\/]|d3-color[\\/]|eventemitter3[\\/]|gl-matrix[\\/]|regl[\\/]|polygon-clipping[\\/]|viewport-mercator-project[\\/])/,
  ),
  asyncAntvMap: createAsyncVendorCacheGroup(
    'async-antv-map',
    /[\\/]node_modules[\\/](@amap[\\/]amap-jsapi-loader[\\/]|@antv[\\/](l7|l7-[^\\/]+|l7plot)[\\/]|@mapbox[\\/][^\\/]+[\\/]|@turf[\\/][^\\/]+[\\/]|earcut[\\/]|element-resize-detector[\\/]|geojson-vt[\\/]|mapbox-gl[\\/]|maplibre-gl[\\/]|pbf[\\/]|supercluster[\\/])/,
  ),
  asyncX6: createAsyncVendorCacheGroup('async-x6', /[\\/]node_modules[\\/](@antv[\\/]x6|@antv[\\/]x6-[^\\/]+)[\\/]/),
  asyncCalendar: createAsyncVendorCacheGroup('async-calendar', /[\\/]node_modules[\\/]@fullcalendar[\\/]/),
  asyncGoogleMap: createAsyncVendorCacheGroup(
    'async-google-map',
    /[\\/]node_modules[\\/]@react-google-maps[\\/]api[\\/]/,
  ),
  asyncScanner: createAsyncVendorCacheGroup(
    'async-scanner',
    /[\\/]node_modules[\\/](@zxing[\\/]library|html5-qrcode|jsqr)[\\/]/,
  ),
  asyncPdf: createAsyncVendorCacheGroup('async-pdf', /[\\/]node_modules[\\/]jspdf[\\/]/),
  asyncLottie: createAsyncVendorCacheGroup('async-lottie', /[\\/]node_modules[\\/](lottie-web|react-lottie)[\\/]/),
  asyncKatex: createAsyncVendorCacheGroup('async-katex', /[\\/]node_modules[\\/]katex[\\/]/),
};

const NO_SPLIT_PAGE_DIRS = [
  'workflow',
  'integration',
  'Mobile',
  'customPage',
  'Portal',
  'Admin',
  'AppSettings',
  'Statistics',
  'Print',
  'kc',
  'Role',
  'calendar',
  'widgetConfig',
  'FormSet',
  'task',
  'feed',
  'FormExtend',
  'globalSearch',
  'Group',
  'certification',
  'invoice',
  'Chatbot',
  'Personal',
  'plugin',
  'NewRecord',
  'UploadTemplateSheet',
];

const NO_SPLIT_PAGE_REGEXP = new RegExp(`[\\\\/]src[\\\\/]pages[\\\\/](${NO_SPLIT_PAGE_DIRS.join('|')})[\\\\/]`);

const getModuleResourceCandidates = module => {
  const candidates = [];
  const addCandidate = value => {
    if (value) candidates.push(value);
  };

  addCandidate(module.resource);
  addCandidate(module.context);
  addCandidate(typeof module.nameForCondition === 'function' ? module.nameForCondition() : '');
  addCandidate(typeof module.identifier === 'function' ? module.identifier() : '');

  if (Array.isArray(module.modules)) {
    module.modules.forEach(innerModule => {
      candidates.push(...getModuleResourceCandidates(innerModule));
    });
  }

  return candidates;
};

const getModuleResource = module => getModuleResourceCandidates(module)[0] || '';

const isNoSplitPageModule = module =>
  getModuleResourceCandidates(module).some(resource => NO_SPLIT_PAGE_REGEXP.test(resource));

const shouldSplitModule = module => !isNoSplitPageModule(module);

const getSplitChunksConfig = alonePath => {
  const minChunks = ENV.isProduction ? 2 : 1;

  if (alonePath === 'single') return undefined;

  if (alonePath === 'singleExtractModules') {
    return {
      chunks: 'initial',
      minSize: 2000000,
      cacheGroups: {
        worksheet: {
          name: 'worksheet',
          minChunks,
          minSize: 30000,
          priority: 50,
          reuseExistingChunk: true,
          test: module => /[\\/]src[\\/]pages[\\/]worksheet[\\/]/.test(getModuleResource(module)),
        },
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
  }

  return {
    chunks: 'all',
    minSize: 2000000,
    cacheGroups: {
      ...ASYNC_VENDOR_CACHE_GROUPS,
      common: {
        name: 'common',
        minChunks,
        priority: -10,
        reuseExistingChunk: true,
        minSize: 30000,
        test: shouldSplitModule,
      },
      node_modules: {
        minSize: 30000,
        name: 'node_modules',
        minChunks,
        test: /[\\/]node_modules[\\/]/,
      },
      worksheet: {
        name: 'worksheet',
        minChunks,
        minSize: 30000,
        priority: 50,
        reuseExistingChunk: true,
        test: module =>
          shouldSplitModule(module) && /[\\/]src[\\/]pages[\\/]worksheet[\\/]/.test(getModuleResource(module)),
      },
      default: false,
    },
  };
};

// Output configuration
const getOutputConfig = alonePath => ({
  filename: ENV.isProduction ? '[name].[contenthash:8].entry.js' : '[name].dev.js',
  chunkFilename: ENV.isProduction ? '[name].[contenthash:8].chunk.js' : '[name].dev.js',
  path: path.join(PATHS.build, `dist/${alonePath}/pack`.replace('//', '/')),
  sourceMapFilename: ENV.isProduction ? '[name].[contenthash].js.map' : '[name].js.map',
  pathinfo: false,
});

const getCacheConfig = alonePath => ({
  type: 'filesystem',
  name: getWebpackCacheName(PATHS.root, [
    ENV.isProduction ? 'production' : 'development',
    alonePath ? alonePath.replace(/[\\/]/g, '_') : 'main',
    ENV.shouldUploadSentrySourcemap ? 'sentry-upload' : 'sentry-no-upload',
  ]),
  cacheDirectory: getWebpackCacheDirectory(PATHS.root),
  buildDependencies: {
    config: [
      __filename,
      path.resolve(PATHS.root, 'CI/webpackCache.js'),
      path.resolve(PATHS.root, '.babelrc'),
      path.resolve(PATHS.root, 'package.json'),
      path.resolve(PATHS.root, 'yarn.lock'),
      path.resolve(PATHS.root, 'CI/publishConfig.js'),
      path.resolve(PATHS.root, 'scripts/build.js'),
    ],
  },
});

const getInfrastructureLoggingConfig = () => {
  if (ENV.isProduction) return undefined;

  return {
    level: 'error',
  };
};

// Main webpack configuration
module.exports = function (alonePath = '') {
  return {
    entry: ENTRIES,
    output: getOutputConfig(alonePath),
    mode: ENV.isProduction ? 'production' : 'development',
    cache: getCacheConfig(alonePath),
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
        new EsbuildPlugin({
          target: 'chrome58',
          minify: true,
          legalComments: 'none',
        }),
        new CssMinimizerPlugin(),
      ],
      runtimeChunk: 'single',
      splitChunks: getSplitChunksConfig(alonePath),
    },
    devtool: alonePath ? undefined : ENV.isProduction ? 'source-map' : 'eval',
    externals: { jquery: 'jQuery' },
    infrastructureLogging: getInfrastructureLoggingConfig(),
  };
};
