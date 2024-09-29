var path = require('path');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
var notifier = require('node-notifier');
const isProduction = process.env.NODE_ENV === 'production';
var $ = require('gulp-load-plugins')();
var webpack = require('webpack');
var minimist = require('minimist');
const { cloneDeep } = require('lodash');
const dayjs = require('dayjs');
const axios = require('axios');
const readline = require('readline');
var argv = minimist(process.argv.slice(2));
var verbose = !!argv.verbose;

const htmlTemplatesPath = path.join(__dirname, '../src/html-templates');

function wrapPathBase(base, relativePath) {
  try {
    if (_.isString(relativePath)) {
      return path.resolve(base, relativePath);
    } else if (_.isObject(relativePath) && !_.isArray(relativePath)) {
      const newPaths = {};
      Object.keys(relativePath).forEach(key => {
        newPaths[key] = wrapPathBase(base, relativePath[key]);
      });
      return newPaths;
    } else if (_.isArray(relativePath)) {
      return relativePath.map(rpath => wrapPathBase(base, rpath));
    } else {
      console.log(base, relativePath);
      throw new Error('传入的路径参数不合法');
    }
  } catch (err) {
    console.log(base, relativePath);
    throw new Error('传入的路径参数不合法');
  }
}
function notify(title, message, isError, extra) {
  var options = _.extend({}, extra, {
    sound: isError,
    icon: isError
      ? path.join(require.resolve('gulp-notify'), '..', 'assets', 'gulp-error.png')
      : path.join(require.resolve('gulp-notify'), '..', 'assets', 'gulp.png'),
    title: title,
    message: message.slice(0, 100),
  });
  try {
    notifier.notify(options);
  } catch (err) {
    // console.error(err);
  }
  if (isError) {
    $.util.log($.util.colors.red(message.slice(0, 1000)));
  }
}

var webpackCompile = function webpackCompile(err, stats) {
  if (err) throw new $.util.PluginError('webpack', err);
  stats.compilation.warnings = stats.compilation.warnings.filter(w => !/Failed to parse source map/.test(w.details));
  var output = stats.toString({
    colors: $.util.colors.supportsColor,
    hash: verbose,
    version: verbose,
    timings: verbose,
    chunks: verbose,
    chunkModules: verbose,
    cached: verbose,
    cachedAssets: verbose,
    children: false,
  });
  $.util.log('[webpack]', output);
  var json = stats.toJson();
  var assets, title, message;
  if (json.warnings && json.warnings.length) {
    $.util.log($.util.colors.yellow(json.warnings));
  }
  var isError = !!json.errors.length;
  if (isError) {
    message = _(json.errors)
      .map(function (error) {
        return _.trim(_(error).split('\n\n').compact().first());
      })
      .uniq()
      .join('\n');
    title = 'Webpack 发生错误';
  } else {
    assets = _(json.assets || [])
      .concat(
        _(json.children)
          .map(function (stat) {
            return stat.assets;
          })
          .flatten()
          .value(),
      )
      .compact()
      .filter(function (asset) {
        return asset.emitted;
      })
      .value();
    title =
      '生成' +
      _.filter(assets, function (asset) {
        return _.endsWith(asset.name, '.js');
      }).length +
      '个js文件,' +
      _.filter(assets, function (asset) {
        return _.endsWith(asset.name, '.map');
      }).length +
      '个map文件';
    message = assets
      .map(function (asset) {
        return asset.name;
      })
      .join(',')
      .substr(0, 80);
  }
  notify(title, message, isError);
};
var webpackTaskFactory = function webpackTaskFactory(webpackConfigArg, isWatch) {
  webpackConfigArg = cloneDeep(webpackConfigArg);
  return function webpackTask(callback) {
    var webpackCompiler = webpack(webpackConfigArg);
    var compile = function webpackTaskFactoryCompile(err, stats) {
      webpackCompile(err, stats);
      if (isProduction && stats.toJson().errors.length) {
        process.exit();
      }
      return callback();
    };
    if (isWatch) {
      webpackCompiler.watch(200, compile);
    } else {
      webpackCompiler.run(compile);
    }
  };
};

function parseNginxRewriteConf(confPathList, data = {}) {
  const content =
    confPathList
      .map(confPath => {
        return fs.readFileSync(confPath).toString();
      })
      .join('\n') +
    'rewrite (?i)^/portallogin /portalLogin.html break;rewrite (?i)^/portalTpauth /portalLogin.html break;';

  const rules = content
    .split(/\r?\n/)
    .filter(rule => rule && /^rewrite(.*)break;/.test(rule))
    .map(rule => rule.replace(/ +/g, ' ').split(/ /))
    .map(rule => ({
      match: rule[1].replace('(?i)', ''),
      redirect: rule[2].replace(/\${(.*?)}/g, (match, p1) => data[p1] || ''),
      ignoreCase: rule[1].indexOf('(?i)') > -1,
    }));
  return rules;
}

function getEntryName(str, filename) {
  var crypto = require('crypto');
  return path.parse(filename).name + '-' + crypto.createHash('md5').update(str).digest('hex');
}

function getEntryFromHtml(filename, type) {
  const html = fs.readFileSync(path.join(htmlTemplatesPath, filename)).toString();
  const $ = cheerio.load(html);
  const entrySrc = $('script')
    .toArray()
    .map(node => $(node).attr('src') || '')
    .filter(src => src.startsWith(`webpack${type ? `[${type}]` : ''}`))[0];
  return entrySrc
    ? {
        type: (entrySrc.match(/\[(\w+)\]/) || '')[1] || 'index',
        src: (entrySrc.match(/\?([\w/.]+)/) || '')[1],
        origin: entrySrc,
      }
    : undefined;
}

function findEntryMap(type) {
  const entrySet = {};
  fs.readdirSync(htmlTemplatesPath)
    // .filter(name => /\.html?$/.test(name))
    .forEach(filename => {
      const entry = getEntryFromHtml(filename, type);
      if (entry && entry.src) {
        entrySet[getEntryName(entry.src, filename)] = entry.src;
      }
    });
  return entrySet;
}

module.exports = {
  // enum
  htmlTemplatesPath,
  // funcs
  wrapPathBase,
  webpackTaskFactory,
  parseNginxRewriteConf,
  getEntryName,
  getEntryFromHtml,
  findEntryMap,
};
