const path = require('path');
const fs = require('fs');
const moment = require('moment');
const cheerio = require('cheerio');
const minify = require('html-minifier').minify;
const _ = require('lodash');
const { htmlTemplatesPath, getEntryName, getEntryFromHtml } = require('./utils');
const { apiServer, webpackPublicPath } = require('./publishConfig');
const isProduction = process.env.NODE_ENV === 'production';
const buildPath = path.join(__dirname, '../build');
const htmlDestPath = path.join(__dirname, '../build/files');
const version = require('child_process').execSync('git log --format="%H" -n 1').toString().trim();

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
  fs.readdirSync(htmlTemplatesPath)
    .filter(filename => filename.endsWith('.html'))
    .forEach(filename => {
      let html = fs.readFileSync(path.join(htmlTemplatesPath, filename)).toString();
      const $ = cheerio.load(html);
      const entry = getEntryFromHtml(filename);
      const apiMap = {
        main: isProduction ? apiServer : '/api/',
      };

      if (!isProduction) {
        apiMap.workflow = '/workflow_api';
        apiMap.report = '/report_api';
        apiMap.integration = '/integration_api';
        apiMap.datapipeline = '/data_pipeline_api';
        apiMap.workflowPlugin = '/workflow_plugin_api';
      }

      $('head').prepend(`
      <link rel="icon" type="image/png" href="/file/mdpic/ProjectLogo/favicon.png" />
      <style>
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-thumb {
          width: 6px;
          height: 6px;
          border-radius: 6px;
          background: rgba(187, 187, 187, 0.8);
          background-clip: padding-box;
          border: 2px solid transparent;
        }
        ::-webkit-scrollbar-thumb:active,
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(125, 125, 125, 0.8);
          background-clip: padding-box;
        }
        .pageLoader {
          animation: rotate 2s linear infinite;
          transform-origin: 50% 50%;
          display: inline-block;
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      </style>
      <link rel="stylesheet" href="/src/common/mdcss/freestyle.css" />
      <script src="/src/common/mdjs/freestyle.js"></script>
      <script>
          window.MDPublishVersion = "${version}";
          window.FE_RELEASE_TIME = "${moment().format('YYYY/MM/DD HH:mm:SS')}";
          var __api_server__ = eval(${JSON.stringify(apiMap)});
          var __webpack_public_path__ = "${entry ? getPublicPath(entry.type) : ''}";
          if (location.pathname.indexOf('/portal/') >= 0) {
              window.subPath = '/portal';
          }
      </script>
    `);

      $('body').prepend(`
      <div id="app">
        <div style="position: absolute;top: 0; right: 0;bottom: 0; left: 0; display: flex;justify-content: center;align-items: center;">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 200 200" width="32" height="32" class="pageLoader" style="enable-background:new 0 0 200 200;" xml:space="preserve">
            <style type="text/css">
              .st0{fill:#BDBDBD;}
            </style>
            <path class="st0" d="M105.7,183.1c-45.9,3.2-85.7-31.4-89-77.3l19-1.3c2.5,35.4,33.2,62.1,68.6,59.6c35.4-2.5,62.1-33.2,59.6-68.6c-2.5-35.4-33.2-62.1-68.6-59.6l-1.3-19c45.9-3.2,85.7,31.4,89,77.3C186.2,140.1,151.6,179.9,105.7,183.1L105.7,183.1z"/>
          </svg>
        </div>
      </div>
    `);

      if (entry) {
        const moduleName = getEntryName(entry.src, filename);
        const excludeArr = [
          'auth-workwx',
          'auth-chat-tools',
          'auth-welink',
          'auth-feishu',
          'auth-dingding',
          'sso-dingding',
          'sso-sso',
          'sso-workweixin',
          'widget-container',
          'free-field-sandbox',
        ];
        const noCommonResource = excludeArr.some(key => moduleName.includes(key));

        if (!noCommonResource) {
          $('head').append(`
          <script>
            if (
              navigator.userAgent.toLowerCase().match(/(msie\\s|trident.*rv:)([\\w.]+)/) ||
              (navigator.userAgent.toLowerCase().match(/(chrome)\\/([\\w.]+)/) && parseInt(navigator.userAgent.toLowerCase().match(/(chrome)\\/([\\w.]+)/)[2]) < 50)
            ) {
              location.href = '/browserupgrade';
            }
            this.globalThis || (this.globalThis = this)
          </script>
          <script src="/staticfiles/staticLanguages.js"></script>
        `);
        }

        if (moduleName.startsWith('free-field-sandbox')) {
          $('head').append(
            `<script src="${
              isProduction ? getPublicPath('index').replace('dist/pack/', '') : '/'
            }staticfiles/tailwindcss.js"/>`,
          );
        }

        const $entryScript = $('script')
          .filter((i, node) => $(node).attr('src') === entry.origin)
          .eq(0);

        if (!$entryScript[0]) {
          destHtml(filename, $.html());
          return;
        }

        if (!isProduction) {
          // 开发模式
          $entryScript.replaceWith(
            ['node_modules', 'cookies', 'core', 'common', 'vendors', 'globals', moduleName]
              .map(src => `<script src="${getPublicPath(entry.type) + src}.dev.js"></script>`)
              .join(''),
          );
        } else {
          // 发布模式
          const baseEntry =
            entry.type === 'single'
              ? ['cookies', 'vendors', 'globals']
              : entry.type === 'singleExtractModules'
                ? ['node_modules', 'cookies', 'common', 'vendors', 'globals']
                : ['node_modules', 'cookies', 'core', 'common', 'vendors', 'globals'];

          let manifestData = JSON.parse(
            fs
              .readFileSync(path.join(buildPath, `dist/${entry.type === 'index' ? '' : `${entry.type}/`}manifest.json`))
              .toString(),
          );

          $entryScript.replaceWith(
            [...(!noCommonResource ? baseEntry : ['cookies']), moduleName]
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
        }

        destHtml(filename, $.html());
      } else {
        destHtml(filename, $.html());
      }
    });
}

module.exports = generate;
