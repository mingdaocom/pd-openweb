const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const ejs = require('ejs');
const { API_SERVER } = require('../publishConfig');
const AJAX_PATH = path.join(__dirname, '../../src/api');

const loading = function (prefix = '') {
  var chars = ['🕒🚶', '🕒🏃'];
  var index = 0;
  var timer = setInterval(function () {
    process.stdout.write('\r' + prefix + chars[index] + ' ');
    index = index === chars.length - 1 ? 0 : ++index;
  }, 250);
  return {
    end: () => {
      process.stdout.write('\r');
      clearInterval(timer);
    },
  };
};

const print = {
  danger: str => console.log('%s: \x1b[31m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  info: str => console.log('%s: \x1b[34m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  success: str => console.log('%s: \x1b[32m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  normal: str => console.log('%s: %s', `[${new Date().toLocaleString()}]`, str),
};

function clearDir() {
  fs.rmdirSync(AJAX_PATH, { recursive: true, force: true });
  print.info(`删除 ${AJAX_PATH} 下的文件`);
  fs.mkdirSync(AJAX_PATH);
}

function getApiHost(env = 'develop') {
  if (env === 'develop') {
    return API_SERVER.local;
  }
  if (/^http/.test(env)) {
    return env;
  }
  if (API_SERVER['local' + env]) {
    return API_SERVER['local' + env];
  }
}

async function getSwaggerFromApi(url) {
  print.info(`开始从 ${url} 获取数据`);
  const loader = loading('加载中 ');
  try {
    const res = await axios.get(url);
    loader.end();
    return res.data;
  } catch (err) {
    loader.end();
    throw err;
  }
}

function parseData(data) {
  const paths = Object.keys(data.paths);
  const dirMap = {};
  paths.forEach(swaggerpath => {
    let dirname = swaggerpath.split('/')[1];
    let fnname = swaggerpath.split('/')[2];
    if (dirname && fnname) {
      const dirMapKey = dirname.replace(/^[A-W]{1}/, first => first.toLowerCase());
      let type, request;
      if (data.paths[swaggerpath].get) {
        type = 'GET';
        request = data.paths[swaggerpath].get;
      } else if (data.paths[swaggerpath].post) {
        type = 'POST';
        request = data.paths[swaggerpath].post;
      }
      if (!request) {
        return;
      }
      let schema;
      try {
        schema =
          data.components.schemas[request.requestBody.content['application/json'].schema.$ref.match('[^/]+(?!.*/)')[0]];
      } catch (err) {}
      const value = {
        type,
        description: request.summary,
        fnname: fnname.substr(0, 1).toLowerCase() + fnname.slice(1),
        path: swaggerpath,
        actionName: fnname,
        controllerName: dirname,
        params: (schema && schema.properties) || [],
      };
      if (dirMap[dirMapKey]) {
        dirMap[dirMapKey] = dirMap[dirMapKey].concat(value);
      } else {
        dirMap[dirMapKey] = [value];
      }
    }
  });
  return dirMap;
}

function handleOutput(data) {
  Object.keys(data).forEach(ajaxFileName => {
    var ajaxFilePath = path.join(AJAX_PATH, ajaxFileName);
    var renderData = data[ajaxFileName];
    fs.writeFileSync(
      ajaxFilePath + '.js',
      ejs.render(fs.readFileSync(path.join(__dirname, '../templates/ajax.tpl.html')).toString(), {
        fns: renderData,
        type: '$',
      }),
    );
    print.normal(`${ajaxFilePath.replace(path.join(__dirname, '../../'), '')}.js 输出成功`);
  });
  print.success(`请求文件已全部生成到${AJAX_PATH}`);
}

async function main(callback = () => {}) {
  const host = getApiHost(process.argv[2]);
  if (!host) {
    print.danger('没有找到对应的环境');
    return;
  }
  print.info('后端地址 -> ' + host);
  let data;
  try {
    data = await getSwaggerFromApi(host.replace(/\/$/, '') + '/swagger/v6.0.0.0/swagger.json');
    print.success('获取数据成功，开始处理数据');
  } catch (err) {
    print.danger('获取数据失败！');
    throw err;
  }
  clearDir();
  try {
    print.info('开始解析并生成 api 文件');
    const dataForOutput = parseData(data);
    await handleOutput(dataForOutput);
  } catch (err) {
    print.danger('生成文件失败！');
    throw err;
  }
  callback();
}

if (require.main === module) {
  main();
}

module.exports = main;
