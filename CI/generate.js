const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment');
const cheerio = require('cheerio');
const minify = require('html-minifier').minify;
const _ = require('lodash');
const { htmlTemplatesPath, getEntryName, getEntryFromHtml } = require('./utils');
const { apiServer, webpackPublicPath } = require('./publishConfig');

const isProduction = process.env.NODE_ENV === 'production';

const buildPath = path.join(__dirname, '../build');
const htmlDestPath = path.join(__dirname, '../build/files');

function mkdir(dirPath) {
  dirPath = path.resolve(__dirname, dirPath);
  if (fs.existsSync(dirPath)) {
    return;
  } else {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getPublicPath(type) {
  if (!isProduction) return webpackPublicPath;

  const path = _.isArray(webpackPublicPath)
    ? webpackPublicPath[_.random(0, webpackPublicPath.length - 1)]
    : webpackPublicPath;

  return type === 'index' ? path : path.replace('/dist/pack/', `/dist/${type}/pack/`);
}

function destHtml(filename, html) {
  fs.writeFileSync(
    path.join(htmlDestPath, filename),
    isProduction
      ? minify(html, {
          collapseWhitespace: true,
          minifyJS: { unused: 'keep_assign' },
        })
      : html,
  );
}

function generate() {
  mkdir(htmlDestPath);
  fs.readdirSync(htmlTemplatesPath).forEach(filename => {
    let html = fs.readFileSync(path.join(htmlTemplatesPath, filename)).toString();
    const entry = getEntryFromHtml(filename);
    const apiMap = {
      main: isProduction ? apiServer : '/api/',
    };
    if (entry) {
      const moduleName = getEntryName(entry.src, filename);

      if (!isProduction) {
        apiMap.workflow = '/workflow_api';
        apiMap.report = '/report_api';
        apiMap.integration = '/integration_api';
        apiMap.datapipeline = '/data_pipeline_api';
        apiMap.workflowPlugin = '/workflow_plugin_api';
      }
      html = ejs.compile(html)({
        apiServer: JSON.stringify(apiMap),
        releaseDate: moment().format('YYYY/MM/DD HH:mm:SS'),
        publicPath: getPublicPath(entry.type),
      });
      html = html.replace(
        '</head>',
        `<script>
          if (
            navigator.userAgent.toLowerCase().match(/(msie\\s|trident.*rv:)([\\w.]+)/) ||
            (navigator.userAgent.toLowerCase().match(/(chrome)\\/([\\w.]+)/) && parseInt(navigator.userAgent.toLowerCase().match(/(chrome)\\/([\\w.]+)/)[2]) < 50)
          ) {
            location.href = '/browserupgrade';
          }
          this.globalThis || (this.globalThis = this)
        </script>
        <script src="/staticfiles/staticLanguages.js"></script>
        </head>`,
      );
      const $ = cheerio.load(html);
      const $entryScript = $('script')
        .filter((i, node) => $(node).attr('src') === entry.origin)
        .eq(0);
      if (!$entryScript[0]) {
        destHtml(filename, html);
        return;
      }
      if (!isProduction) {
        if (moduleName.startsWith('free-field-sandbox')) {
          $('head').append('<script src="/staticfiles/tailwindcss.js"></script>');
        }
        // 开发模式
        $entryScript.replaceWith(
          ['modules_a', 'modules_b', 'core', 'common', 'vendors', 'globals', moduleName]
            .map(src => `<script src="${getPublicPath(entry.type) + src}.dev.js"></script>`)
            .join(''),
        );
      } else {
        // 发布模式
        let manifestData;
        manifestData = JSON.parse(
          fs
            .readFileSync(path.join(buildPath, `dist/${entry.type === 'index' ? '' : `${entry.type}/`}manifest.json`))
            .toString(),
        );
        const baseEntry =
          entry.type !== 'index'
            ? ['vendors', 'globals']
            : ['modules_a', 'modules_b', 'core', 'common', 'vendors', 'globals'];
        const isWidgetContainer = moduleName.startsWith('widget-container');
        const isFreeField = moduleName.startsWith('free-field-sandbox');
        const noCommonResource = isFreeField || isWidgetContainer;
        $entryScript.replaceWith(
          [...(!noCommonResource ? baseEntry : []), moduleName]
            .filter(key => !!manifestData[key] && manifestData[key].js)
            .map(key => `<script src="${getPublicPath(entry.type) + manifestData[key].js}"></script>`)
            .join(''),
        );
        if (!noCommonResource) {
          $('head').append(
            ['css', ...baseEntry, moduleName]
              .filter(key => !!manifestData[key] && manifestData[key].css)
              .map(key => `<link rel="stylesheet" href="${getPublicPath(entry.type) + manifestData[key].css}" />`)
              .join(''),
          );
        }
        if (moduleName.startsWith('free-field-sandbox')) {
          $('head').append(
            `<script src="${getPublicPath('index').replace('dist/pack/', '')}staticfiles/tailwindcss.js"></script>`,
          );
        }
      }
      destHtml(filename, $.html());
    } else {
      html = ejs.compile(html)({
        apiServer: JSON.stringify(apiMap),
      });
      destHtml(filename, html);
    }
  });
}
module.exports = generate;
