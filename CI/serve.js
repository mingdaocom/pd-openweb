const http = require('http');
const net = require('net');
const path = require('path');
const fs = require('fs');
const { networkInterfaces } = require('os');
const { URL } = require('url');
const { execSync } = require('child_process');

const open = require('open');
const handler = require('serve-handler');
const _ = require('lodash');
const { createProxyMiddleware } = require('http-proxy-middleware');
const chalk = require('chalk');

const utils = require('./utils');
const publishConfig = require('./publishConfig');
const generate = require('./generate');
const statusData = {};
const projectRootPath = path.join(__dirname, '..');
const iconViewerPath = path.join(projectRootPath, 'scripts/iconViewer');

function logObj(obj) {
  Object.keys(obj).forEach(key => console.log(`${chalk.yellow(key)}: ${chalk.green(obj[key])}`));
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
  {
    name: 'md_agent_api',
    path: '/api/agent/',
    replace: '/api/agent/',
    server: publishConfig.apiServer,
  },
  {
    name: 'md_agui_api',
    path: '/api/agui/',
    replace: '/api/agui/',
    server: publishConfig.apiServer,
  },
  {
    name: 'md_artifacts_api',
    path: '/api/artifacts/',
    replace: '/api/artifacts/',
    server: publishConfig.apiServer,
  },
  { name: 'api', path: '/api/', replace: '/', server: publishConfig.apiServer },
  { name: 'workflow_api', path: '/workflow_api/', replace: '', server: publishConfig.apiServer },
  { name: 'report_api', path: '/report_api/', replace: '', server: publishConfig.apiServer },
  { name: 'integration_api', path: '/integration_api/', replace: '', server: publishConfig.apiServer },
  { name: 'data_pipeline_api', path: '/data_pipeline_api/', replace: '', server: publishConfig.apiServer },
  {
    name: 'workflow_plugin_api',
    path: '/workflow_plugin_api/',
    replace: '/workflowplugin/',
    server: publishConfig.apiServer,
  },
  {
    name: 'knowledge_api',
    path: '/knowledge_api/',
    replace: '',
    server: publishConfig.apiServer,
  },
  {
    name: 'cloudapi_api',
    path: '/cloudapi_api/',
    replace: '',
    server: publishConfig.apiServer,
  },
];

// 把 proxy-middleware 替换为 http-proxy-middleware：
// - 内置 SSE / WebSocket 支持，上游断开不再串到下个中间件触发 ERR_HTTP_HEADERS_SENT
// - 错误统一在 on.error 里兜底，不会让 dev server 进程崩溃
function makeProxy({ name, server, path: matchPath, replace }) {
  return createProxyMiddleware({
    target: server,
    changeOrigin: true,
    // path 与 replace 相同（如 /api/agent/）的配置等价于 no-op，仍交给 pathRewrite 走一遍统一逻辑
    pathRewrite: { [`^${matchPath}`]: replace },
    logger: { info: () => {}, warn: console.warn, error: console.error },
    on: {
      error(err, req, res) {
        console.error(`[proxy ${name}] ${req.url} -> ${server} failed:`, err.message);
        if (!res || res.headersSent) {
          if (res && typeof res.destroy === 'function') res.destroy(err);
          return;
        }

        try {
          res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Bad gateway');
        } catch {
          /* ignore */
        }
      },
    },
  });
}

const proxyMiddlewares = proxyConfigs.reduce((acc, config) => {
  acc[config.name] = makeProxy(config);
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
    // generic proxy：/__proxy?url=<encoded-target-url>
    {
      match: req => req.url.startsWith('/__proxy'),
      handle: (req, res, next) => {
        const urlObj = new URL(req.url, 'https://md.md');
        const proxyUrl = decodeURIComponent(urlObj.searchParams.get('url'));
        const proxyUrlObj = new URL(proxyUrl);

        req.url = proxyUrl.replace(proxyUrlObj.origin, '');
        createProxyMiddleware({
          target: proxyUrlObj.origin,
          changeOrigin: true,
          logger: { info: () => {}, warn: console.warn, error: console.error },
          on: {
            error(err) {
              console.error(`[proxy __proxy] ${proxyUrlObj.origin} failed:`, err.message);
              if (!res.headersSent) {
                try {
                  res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
                  res.end('Bad gateway');
                } catch {
                  /* ignore */
                }
              }
            },
          },
        })(req, res, next);
      },
    },
    // api proxies：pathRewrite 已在 makeProxy 里配置，调用点无需手动 replace url
    ...proxyConfigs.map(config => ({
      match: req => req.url.startsWith(config.path),
      handle: (req, res, next) => proxyMiddlewares[config.name](req, res, next),
    })),
    // static files
    {
      match: req => req.url.startsWith('/dist/'),
      handle: (req, res, next) => next(),
    },
    // local helper files, for example /__fonticon
    {
      match: req => req.url.startsWith('/__'),
      handle: (req, res) => {
        const url = new URL(`http://md.md${req.url}`);
        const basePath = url.pathname[3] === '/' ? projectRootPath : iconViewerPath;
        const filePath = path.join(basePath, url.pathname.slice(3) + (/\./.test(url.pathname) ? '' : '.html'));
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

async function regenerateDevHtmlIfMissing({ filePath, pathname, isProductionServer }) {
  if (
    isProductionServer ||
    process.env.NODE_ENV === 'production' ||
    !pathname.startsWith('/files/') ||
    !/\.html?$/.test(pathname) ||
    fs.existsSync(filePath)
  ) {
    return;
  }

  try {
    console.log(`missing ${pathname}, regenerating build/files html`);
    await generate();
  } catch (err) {
    console.error('regenerate build/files html failed:', err);
  }
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
    // 跨域处理 + 禁止缓存。headers 已发出（代理流式中断回流到此）时 setHeader 会抛
    // ERR_HTTP_HEADERS_SENT 直接崩进程，加 guard 兜底
    if (!res.headersSent) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public,max-age=0');
    }

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

async function serve({ done = () => {}, needOpen = true, isProduction: isProductionServer = false } = {}) {
  const port = await getValuedPort();
  const server = http.createServer((req, res) => {
    runMiddleware(req, res, async () => {
      // 静态文件服务实现
      const { pathname } = new URL(`http://md.md${req.url}`);

      if (/\.html?$/.test(pathname)) {
        // 添加本地样式
        try {
          const filePath = path.join(__dirname, '../build', pathname);
          await regenerateDevHtmlIfMissing({ filePath, pathname, isProductionServer });
          let text = fs.readFileSync(filePath).toString();
          text = text.replace(
            /<script src="\/dist\/pack\/common\.dev\.js"><\/script>/i,
            '<script src="/dist/pack/common.dev.js"></script><script src="/dist/pack/css.dev.js"></script>',
          );
          res.end(text);
        } catch {
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
