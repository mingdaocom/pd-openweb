const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

const cheerio = require('cheerio');
const _ = require('lodash');
const notifier = require('node-notifier');
const webpack = require('webpack');
const minimist = require('minimist');
const dayjs = require('dayjs');
const axios = require('axios');
const chalk = require('chalk');

const isProduction = process.env.NODE_ENV === 'production';
const argv = minimist(process.argv.slice(2));
const verbose = !!argv.verbose;

const htmlTemplatesPath = path.join(__dirname, '../src/html-templates');

function wrapPathBase(base, relativePath) {
  if (_.isString(relativePath)) {
    return path.resolve(base, relativePath);
  }

  if (_.isObject(relativePath) && !_.isArray(relativePath)) {
    const newPaths = {};

    for (const key in relativePath) {
      if (Object.prototype.hasOwnProperty.call(relativePath, key)) {
        newPaths[key] = wrapPathBase(base, relativePath[key]);
      }
    }

    return newPaths;
  }

  if (_.isArray(relativePath)) {
    return relativePath.map(rpath => wrapPathBase(base, rpath));
  }

  throw new Error(`Invalid path parameter: ${relativePath}`);
}

function notify(title, message, isError, extra = {}) {
  const text = message.slice(0, isError ? 1000 : 100);
  const options = {
    ...extra,
    sound: isError,
    title,
    message: text,
  };

  try {
    notifier.notify(options);
  } catch (err) {
    console.error('Notifier failed:', err);
  }

  if (isError) {
    console.log(chalk.red(text));
  }
}

const webpackCompile = (err, stats) => {
  if (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    error.name = 'WebpackError';
    throw error;
  }

  stats.compilation.warnings = stats.compilation.warnings.filter(w => !/Failed to parse source map/.test(w.details));

  const output = stats.toString({
    colors: chalk.supportsColor,
    hash: verbose,
    version: verbose,
    timings: verbose,
    chunks: verbose,
    chunkModules: verbose,
    cached: verbose,
    cachedAssets: verbose,
    children: false,
  });

  console.log('[webpack]', output);

  const json = stats.toJson();

  if (json.warnings && json.warnings.length) {
    console.log(chalk.yellow(json.warnings.join('\n')));
  }

  const isError = !!json.errors.length;
  let title;
  let message;

  if (isError) {
    message = [...new Set(json.errors.map(error => _.trim(error.message)))].join('\n');
    title = 'Webpack Error';
  } else {
    const allAssets = json.assets.concat(...(json.children || []).map(stat => stat.assets));
    const emittedAssets = allAssets.filter(asset => asset.emitted);

    const jsFileCount = emittedAssets.filter(asset => asset.name.endsWith('.js')).length;
    const mapFileCount = emittedAssets.filter(asset => asset.name.endsWith('.map')).length;

    title = `Generated ${jsFileCount} JS file(s), ${mapFileCount} map file(s)`;
    message = emittedAssets
      .map(asset => asset.name)
      .join(',')
      .substring(0, 80);
  }

  notify(title, message, isError);
};

const webpackTaskFactory = (webpackConfigArg, isWatch) => {
  const webpackConfig = _.cloneDeep(webpackConfigArg);

  return callback => {
    const webpackCompiler = webpack(webpackConfig);
    const finish = error => {
      if (isWatch || !webpackCompiler.close) {
        callback(error);
        return;
      }

      webpackCompiler.close(closeError => {
        callback(error || closeError);
      });
    };

    const compile = (err, stats) => {
      try {
        webpackCompile(err, stats);
        if (isProduction && stats.toJson().errors.length) {
          finish(new Error('Webpack compilation failed'));
          return;
        }

        finish();
      } catch (error) {
        finish(error);
      }
    };

    if (isWatch) {
      webpackCompiler.watch({ aggregateTimeout: 200 }, compile);
    } else {
      webpackCompiler.run(compile);
    }
  };
};

function parseNginxRewriteConf(confPathList, data = {}) {
  const content =
    confPathList.map(confPath => fs.readFileSync(confPath).toString()).join('\n') +
    '\nrewrite (?i)^/portallogin /portalLogin.html break;\nrewrite (?i)^/portalTpauth /portalLogin.html break;';

  return content
    .split(/\r?\n/)
    .filter(rule => rule && /^rewrite(.*)break;/.test(rule))
    .map(rule => {
      const parts = rule.replace(/ +/g, ' ').split(' ');
      return {
        match: parts[1].replace('(?i)', ''),
        redirect: parts[2].replace(/\${(.*?)}/g, (match, p1) => data[p1] || ''),
        ignoreCase: parts[1].includes('(?i)'),
      };
    });
}

function getEntryName(str, filename) {
  return `${path.parse(filename).name}-${crypto.createHash('md5').update(str).digest('hex')}`;
}

function getEntryFromHtml(filename, type) {
  const html = fs.readFileSync(path.join(htmlTemplatesPath, filename)).toString();
  const $ = cheerio.load(html);
  const entrySrc = $('script')
    .toArray()
    .map(node => $(node).attr('src') || '')
    .find(src => src.startsWith(`webpack${type ? `[${type}]` : ''}`));

  if (!entrySrc) return undefined;

  const typeMatch = entrySrc.match(/\[(\w+)\]/);
  const srcMatch = entrySrc.match(/\?([\w/.]+)/);

  return {
    type: typeMatch ? typeMatch[1] : 'index',
    src: srcMatch ? srcMatch[1] : null,
    origin: entrySrc,
  };
}

function findEntryMap(type) {
  const entrySet = {};
  fs.readdirSync(htmlTemplatesPath).forEach(filename => {
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
