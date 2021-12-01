const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const moment = require('moment');
const cheerio = require('cheerio');
const minify = require('html-minifier').minify;
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

function getPublicPath() {
  return isProduction ? webpackPublicPath : '/dist/pack/';
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
    let publicPath = getPublicPath();
    if (entry) {
      const moduleName = getEntryName(entry.src, filename);
      if (isProduction && entry.type === 'single') {
        publicPath = publicPath.replace('/dist/pack/', '/dist/single/pack/');
      }
      html = ejs.compile(html)({
        apiServer: isProduction ? apiServer : '/api/',
        releaseDate: moment().format('YYYY/MM/DD HH:mm:SS'),
        publicPath,
      });
      const $ = cheerio.load(html);
      const $entryScript = $('script')
        .filter((i, node) => $(node).attr('src') === entry.origin)
        .eq(0);
      if (!$entryScript[0]) {
        destHtml(filename, html);
        return;
      }
      if (!isProduction) {
        // 开发模式
        $entryScript.replaceWith(
          ['nodemodules', 'common', 'vendors', 'globals', moduleName]
            .map(src => `<script src="${publicPath + src}.dev.js"></script>`)
            .join(''),
        );
      } else {
        // 发布模式
        const manifestData = JSON.parse(
          fs
            .readFileSync(path.join(buildPath, `dist/${entry.type === 'index' ? '' : `${entry.type}/`}manifest.json`))
            .toString(),
        );
        const baseEntry =
          entry.type === 'single' ? ['vendors', 'globals'] : ['nodemodules', 'common', 'vendors', 'globals'];
        $entryScript.replaceWith(
          [...baseEntry, moduleName]
            .filter(key => !!manifestData[key] && manifestData[key].js)
            .map(key => `<script src="${publicPath + manifestData[key].js}"></script>`)
            .join(''),
        );
        $('head').append(
          ['css', ...baseEntry, moduleName]
            .filter(key => !!manifestData[key] && manifestData[key].css)
            .map(key => `<link rel="stylesheet" href="${publicPath + manifestData[key].css}" />`)
            .join(''),
        );
      }
      destHtml(filename, $.html());
    } else {
      html = ejs.compile(html)({
        apiServer: isProduction ? apiServer : '/api/',
      });
      destHtml(filename, html);
    }
  });
}
module.exports = generate;
