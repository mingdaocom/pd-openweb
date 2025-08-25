const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { networkInterfaces } = require('os');
const { URL } = require('url');
const { execSync } = require('child_process');

const open = require('open');
const boxen = require('boxen');
const handler = require('serve-handler');
const _ = require('lodash');
const proxy = require('proxy-middleware');

const chalk = require('chalk');

const utils = require('./utils');
const publishConfig = require('./publishConfig');

const statusData = {};

function logObj(obj) {
  console.log(
    boxen(
      Object.keys(obj)
        .map(key => `${chalk.yellow(key)}: ${chalk.green(obj[key])}`)
        .join('\n'),
      { padding: { top: 1, bottom: 1, left: 2, right: 2 } },
    ),
  );
  console.log('\n');
}

function getLanIp() {
  return Object.values(networkInterfaces())
    .flat()
    .filter(details => details.family === 'IPv4' && !details.internal)
    .map(details => details.address);
}

function checkPort(port) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', err => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function getValuedPort(port = 30001) {
  const available = await checkPort(port);
  if (available) {
    return port;
  }
  return getValuedPort(port + 1);
}

const proxyConfigs = [
  { name: 'api', path: '/api/', replace: '/wwwapi/', server: publishConfig.apiServer },
  { name: 'workflow_api', path: '/workflow_api/', replace: '/api/workflow/', server: publishConfig.apiServer },
  { name: 'report_api', path: '/report_api/', replace: '/report/', server: publishConfig.apiServer },
  { name: 'integration_api', path: '/integration_api/', replace: '/integration/', server: publishConfig.apiServer },
  {
    name: 'data_pipeline_api',
    path: '/data_pipeline_api/',
    replace: '/datapipeline/',
    server: publishConfig.apiServer,
  },
  {
    name: 'workflow_plugin_api',
    path: '/workflow_plugin_api/',
    replace: '/workflowplugin/',
    server: publishConfig.apiServer,
  },
];

const proxyMiddlewares = proxyConfigs.reduce((acc, config) => {
  acc[config.name] = proxy(config.server);
  return acc;
}, {});

function createRequestHandlers() {
  const rewrites = utils
    .parseNginxRewriteConf([
      path.join(__dirname, '../docker/rewrite.setting'),
      path.join(__dirname, '../docker/portal.rewrite.setting'),
    ])
    .concat({
      match: '^/demo',
      redirect: '/index.html',
      ignoreCase: true,
    });

  const handlers = [
    // root redirect
    {
      match: req => req.url === '/',
      handle: (req, res) => {
        res.writeHead(301, { Location: '/dashboard' });
        res.end();
      },
    },
    // generic proxy
    {
      match: req => req.url.startsWith('/__proxy'),
      handle: (req, res, next) => {
        const urlObj = new URL(req.url, 'https://md.md');
        const proxyUrl = decodeURIComponent(urlObj.searchParams.get('url'));
        const proxyUrlObj = new URL(proxyUrl);
        req.url = proxyUrl.replace(proxyUrlObj.origin, '');
        console.log({ url: req.url, origin: proxyUrlObj.origin });
        proxy(proxyUrlObj.origin)(req, res, next);
      },
    },
    // api proxies
    ...proxyConfigs.map(config => ({
      match: req => req.url.startsWith(config.path),
      handle: (req, res, next) => {
        req.url = req.url.replace(config.path, config.replace);
        proxyMiddlewares[config.name](req, res, next);
      },
    })),
    // static files
    {
      match: req => req.url.startsWith('/dist/'),
      handle: (req, res, next) => next(),
    },
    // dev serve files
    {
      match: req => req.url.startsWith('/__'),
      handle: (req, res) => {
        const url = new URL(`http://md.md${req.url}`);
        const filePath = path.join(
          __dirname,
          url.pathname[3] === '/' ? '../' : '../CI/devServe',
          url.pathname.slice(3) + (/\./.test(url.pathname) ? '' : '.html'),
        );
        const rs = fs.createReadStream(filePath);
        rs.on('error', () => {
          console.log(`can not find ${url.pathname} ${filePath}`);
          res.statusCode = 404;
          res.end('404');
        });
        rs.pipe(res);
      },
    },
    // get git branch
    {
      match: req => req.url === '/_branch',
      handle: (req, res) => {
        res.end(execSync('git branch | grep ^\\*').toString().trim());
      },
    },
    // nginx rewrites
    {
      match: req =>
        _.findIndex(rewrites, rule => new RegExp(rule.match, rule.ignoreCase ? 'i' : '').test(req.url)) > -1,
      handle: (req, res, next) => {
        const matchedIndex = _.findIndex(rewrites, rule =>
          new RegExp(rule.match, rule.ignoreCase ? 'i' : '').test(req.url),
        );
        const { match, redirect, ignoreCase } = rewrites[matchedIndex];
        req.url = redirect.includes('$')
          ? req.url.replace(new RegExp(match, ignoreCase ? 'ig' : 'g'), redirect)
          : redirect;
        req.url = `/files${req.url}`;
        next();
      },
    },
  ];

  return function (req, res, next) {
    for (const handler of handlers) {
      if (handler.match(req)) {
        return handler.handle(req, res, next);
      }
    }
    // Fallback to 404
    res.statusCode = 404;
    res.end('404');
  };
}

const middlewareList = [
  createRequestHandlers(),
  function (req, res, next) {
    // 控制页面 TODO
    if (req.url === '/--dashboard') {
      res.end(`dashboard-${statusData.localUrl}`);
    } else {
      next();
    }
  },
  function (req, res, next) {
    // 跨域处理
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 禁止缓存
    res.setHeader('Cache-Control', 'public,max-age=0');
    next();
  },
];

function runMiddleware(req, res, callback) {
  const stack = middlewareList.slice();
  (function next() {
    if (stack.length > 0) {
      const fn = stack.shift();
      fn(req, res, next);
    } else {
      callback();
    }
  })();
}

async function serve({ done = () => {}, needOpen = true } = {}) {
  const port = await getValuedPort();
  const server = http.createServer((req, res) => {
    runMiddleware(req, res, () => {
      // 静态文件服务实现
      const { pathname } = new URL(`http://md.md${req.url}`);
      if (/.[html|htm]$/.test(pathname)) {
        // 添加本地样式
        try {
          const filePath = path.join(__dirname, '../build', pathname);
          let text = fs.readFileSync(filePath).toString();
          text = text.replace(
            /<script src="\/dist\/pack\/common\.dev\.js"><\/script>/i,
            '<script src="/dist/pack/common.dev.js"></script><script src="/dist/pack/css.dev.js"></script>',
          );
          res.end(text);
        } catch (err) {
          console.log(`can not find ${pathname}`, path.join(__dirname, '../build', pathname));
          res.statusCode = 404;
          res.end('404');
        }
      } else {
        handler(req, res, {
          headers:
            req.headers.referer && new URL(req.headers.referer).pathname.endsWith('freefield')
              ? [
                  {
                    source: '**',
                    headers: [
                      {
                        key: 'cache-control',
                        value: 'public,max-age=86400',
                      },
                    ],
                  },
                ]
              : [],
          public: path.join(__dirname, '../build'),
        });
      }
    });
  });

  server.on('error', err => {
    console.log('\nstart failed ! 💣💀💣', err);
  });

  server.listen(port, () => {
    const lanIps = getLanIp();
    const localUrl = `http://localhost:${port}`;
    statusData.localUrl = localUrl;
    console.log('\n启动成功! 🎉 🎉 🎉\n');
    logObj({
      地址: localUrl,
      局域网地址: lanIps.length ? `http://${lanIps[0]}:${port}` : 'N/A',
      'api 服务器': publishConfig.apiServer,
    });
    if (needOpen) {
      open(`${localUrl}/dashboard`);
    }
    done();
  });
}

module.exports = serve;
