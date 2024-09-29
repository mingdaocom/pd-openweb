const http = require('http');
const net = require('net');
const path = require('path');
const open = require('open');
const boxen = require('boxen');
const handler = require('serve-handler');
const _ = require('lodash');
const fs = require('fs');
const proxy = require('proxy-middleware');
const gutil = require('gulp-util');
const utils = require('./utils');
const { apiServer } = require('./publishConfig');
const apiProxyMiddleware = proxy(apiServer);

const statusData = {};

function logObj(obj) {
  console.log(
    boxen(
      Object.keys(obj)
        .map(key => `${gutil.colors.yellow(key)}: ${gutil.colors.green(obj[key])}`)
        .join('\n'),
      { padding: { top: 1, bottom: 1, left: 2, right: 2 } },
    ),
  );
  console.log('\n');
}

function getLanIp() {
  var networkInterfaces = require('os').networkInterfaces();
  var matches = [];

  Object.keys(networkInterfaces).forEach(function (item) {
    networkInterfaces[item].forEach(function (address) {
      if (address.internal === false && address.family === 'IPv4') {
        matches.push(address.address);
      }
    });
  });

  return matches;
}

function checkPort(port) {
  return new Promise((resolve, reject) => {
    var server = net.createServer();
    server.once('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });
    server.once('listening', function () {
      resolve(true);
      server.close();
    });
    server.listen(port);
  });
}

// 获取可用端口
async function getValuedPort(port) {
  port = port || 30001;
  const available = await checkPort(port);
  if (available) {
    return port;
  } else {
    return getValuedPort(port + 1);
  }
}

const middlewareList = [
  function (req, res, next) {
    let rewrites = utils.parseNginxRewriteConf([
      path.join(__dirname, '../docker/rewrite.setting'),
      path.join(__dirname, '../docker/portal.rewrite.setting'),
    ]);
    rewrites = rewrites.concat({
      match: '^/demo',
      redirect: '/index.html',
      ignoreCase: true,
    });
    if (req.url === '/') {
      res.writeHead(301, { Location: '/dashboard' });
      res.end();
    } else if (req.url && req.url.startsWith('/api/')) {
      // 代理接口请求到 api 服务器
      req.url = req.url.replace('/api/', '/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/workflow_api/')) {
      // 代理接口请求到 工作流 api 服务器
      req.url = req.url.replace('/workflow_api/', '/api/workflow/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/report_api/')) {
      // 代理接口请求到 图表 api 服务器
      req.url = req.url.replace('/report_api/', '/report/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/integration_api/')) {
      // 代理接口请求到 集成 api 服务器
      req.url = req.url.replace('/integration_api/', '/integration/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/data_pipeline_api/')) {
      // 代理接口请求到 数据库集成 api 服务器
      req.url = req.url.replace('/data_pipeline_api/', '/datapipeline/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/workflow_plugin_api/')) {
      // 代理接口请求到 工作流插件 api 服务器
      req.url = req.url.replace('/workflow_plugin_api/', '/workflowplugin/');
      apiProxyMiddleware(req, res, next);
    } else if (req.url && req.url.startsWith('/dist/')) {
      // 访问静态文件
      next();
    } else if (req.url && req.url.startsWith('/__')) {
      // 访问静态文件
      const url = new URL(`http://md.md${req.url}`);
      const filePath = path.join(
        __dirname,
        url.pathname[3] === '/' ? '../' : '../CI/devServe',
        url.pathname.slice(3) + (/\./.test(url.pathname) ? '' : '.html'),
      );
      const rs = fs.createReadStream(filePath);
      rs.on('error', () => {
        console.log('can not find ' + url.pathname + ' ' + filePath);
        res.statusCode = 404;
        res.end('404');
      });
      rs.pipe(res);
    } else if (req.url && req.url === '/_branch') {
      res.end(require('child_process').execSync(`git branch | grep ^\*`).toString().trim());
    } else if (_.findIndex(rewrites, rule => new RegExp(rule.match, rule.ignoreCase ? 'i' : '').test(req.url)) > -1) {
      // 根据配置的 nginx rewrite 重定向请求
      const matchedIndex = _.findIndex(rewrites, rule =>
        new RegExp(rule.match, rule.ignoreCase ? 'i' : '').test(req.url),
      );
      const match = rewrites[matchedIndex].match;
      const redirect = rewrites[matchedIndex].redirect;
      const ignoreCase = rewrites[matchedIndex].ignoreCase;
      if (redirect.indexOf('$') > 0) {
        req.url = req.url.replace(new RegExp(match, ignoreCase ? 'ig' : ''), redirect);
      } else {
        req.url = redirect;
      }
      req.url = '/files' + req.url;
      next();
    } else {
      // 404
      res.statusCode = 404;
      res.end('404');
    }
  },
  function (req, res, next) {
    // 控制页面 TODO
    if (req.url === '/--dashboard') {
      res.end('dashboard-' + statusData.localUrl);
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

async function serve({ done = () => {}, needOpen = true } = {}) {
  var port = await getValuedPort();
  var server = http.createServer(function (req, res) {
    const stack = middlewareList.slice(0);
    function exec(cb = () => {}) {
      if (stack.length) {
        const handle = stack.pop();
        handle(req, res, () => {
          exec(cb);
        });
      } else {
        cb();
      }
    }
    exec(() => {
      // 静态文件服务实现
      const url = new URL(`http://md.md${req.url}`);
      const pathname = url.pathname;
      if (/.[html|htm]$/.test(pathname)) {
        // 添加本地样式
        let text;
        try {
          text = fs.readFileSync(path.join(__dirname, '../build', pathname)).toString();
          text = text.replace(
            /<script src="\/dist\/pack\/common\.dev\.js"><\/script>/i,
            '<script src="/dist/pack/common.dev.js"></script><script src="/dist/pack/css.dev.js"></script>',
          );
        } catch (err) {
          console.log('can not find ' + pathname, path.join(__dirname, '../build', pathname));
          res.statusCode = 404;
          text = '404';
        }
        res.end(text);
      } else {
        handler(req, res, {
          public: path.join(__dirname, '../build'),
        });
      }
    });
  });

  server.listen(port, err => {
    if (!err) {
      const lanIps = getLanIp();
      const localUrl = `http://localhost:${port}`;
      statusData.localUrl = localUrl;
      console.log('\n启动成功! 🎉 🎉 🎉\n');
      logObj({
        地址: localUrl,
        局域网地址: `http://${lanIps[0]}:${port}`,
        'api 服务器': apiServer,
      });
      if (needOpen) {
        open(localUrl + '/dashboard');
      }
      done();
    } else {
      console.log('\nstart failed ! 💣💀💣', err);
    }
  });
}
module.exports = serve;
