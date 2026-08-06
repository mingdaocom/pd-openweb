const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const { API_SERVER } = require('../CI/publishConfig');
const agentApiGen = require('./agentApiGen');
const { ROOT_PATH, formatWithPrettier, print } = require('./utils');
const AJAX_PATH = path.join(ROOT_PATH, 'src/api');
const PRESERVE_FILES = new Set(['agent.js']); // 由 agentApiGen.js 单独维护,不随本脚本清理

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

function clearDir() {
  if (!fs.existsSync(AJAX_PATH)) {
    fs.mkdirSync(AJAX_PATH);
    return;
  }

  for (const name of fs.readdirSync(AJAX_PATH)) {
    if (PRESERVE_FILES.has(name)) continue;
    fs.rmSync(path.join(AJAX_PATH, name), { recursive: true, force: true });
  }

  print.info(`清理 ${AJAX_PATH}(保留 ${[...PRESERVE_FILES].join(', ')})`);
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
    const pathArr = swaggerpath.split('/');
    let dirname;
    let controllerName;
    let fnname;

    // 兼容处理sse的时候路径3层问题
    if (pathArr.length === 4 && swaggerpath.indexOf('sse') > -1) {
      dirname = pathArr[1];
      controllerName = pathArr[1] + '/' + pathArr[2];
      fnname = pathArr[3];
    } else {
      dirname = pathArr[1];
      controllerName = pathArr[1];
      fnname = pathArr[2];
    }

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

      const schemaRef = request.requestBody?.content?.['application/json']?.schema?.$ref;
      const schemaName = schemaRef && schemaRef.match('[^/]+(?!.*/)')[0];
      const schema = schemaName && data.components?.schemas?.[schemaName];

      const value = {
        type,
        description: request.summary,
        fnname: fnname.substr(0, 1).toLowerCase() + fnname.slice(1),
        path: swaggerpath,
        actionName: fnname,
        controllerName,
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

function escapeTemplateValue(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&#34;')
    .replace(/'/g, '&#39;');
}

function renderParamLine(name, param = {}) {
  const description = param.description ? ` ${escapeTemplateValue(param.description)}` : '';
  return `  * @param {${escapeTemplateValue(param.type)}} args.${escapeTemplateValue(name)}${description}`;
}

function renderApiFunction(fn) {
  const paramLines = Object.keys(fn.params || {}).map(paramName => renderParamLine(paramName, fn.params[paramName]));
  const optionsLine =
    fn.type === 'GET' ? "     options.ajaxOptions = Object.assign({}, options.ajaxOptions, { type: 'GET' });\n" : '';

  return `  /**
  * ${escapeTemplateValue(fn.description)}
  * @param {Object} args 请求参数${paramLines.length ? `\n${paramLines.join('\n')}` : ''}
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   ${escapeTemplateValue(fn.fnname)}: function (args, options = {}) {
${optionsLine}     return mdyAPI('${escapeTemplateValue(fn.controllerName)}', '${escapeTemplateValue(fn.actionName)}', args, options);
   },`;
}

function renderAjaxFile(fns = []) {
  return `export default {
${fns.map(renderApiFunction).join('\n')}
};
`;
}

function handleOutput(data) {
  Object.keys(data).forEach(ajaxFileName => {
    var ajaxFilePath = path.join(AJAX_PATH, ajaxFileName);
    var renderData = data[ajaxFileName];
    fs.writeFileSync(ajaxFilePath + '.js', renderAjaxFile(renderData));
    print.normal(`${ajaxFilePath.replace(ROOT_PATH + path.sep, '')}.js 输出成功`);
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
    data = await getSwaggerFromApi(host.replace(/\/$/, '') + '/swagger/v8.0.0.0/swagger.json');
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
    print.info('开始格式化文件');
    await formatWithPrettier(`${AJAX_PATH}/**/*.{ts,tsx,js,jsx}`);
    print.success('格式化文件完成');
  } catch (err) {
    print.danger('生成文件失败！');
    throw err;
  }

  try {
    print.info('开始生成 agent api');
    await agentApiGen();
  } catch (err) {
    print.danger('agent api 生成失败！');
    throw err;
  }

  callback();
}

if (require.main === module) {
  main();
}

module.exports = main;
