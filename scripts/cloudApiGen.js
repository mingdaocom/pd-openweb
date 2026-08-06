const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { cloudApiServer } = require('../CI/publishConfig');
const {
  ROOT_PATH,
  collectBodyProps,
  collectPathParams,
  formatWithPrettier,
  normalizeDescription,
  print,
  toCamelCase,
} = require('./utils');

const SWAGGER_URL =
  process.env.CLOUD_API_SWAGGER_URL || cloudApiServer.replace(/\/$/, '') + '/swagger/v1.0.0.0/swagger.json';
const OUTPUT_DIR = path.join(ROOT_PATH, 'src/pages/Admin/api/cloudApi');
const PRESERVE_FILES = new Set(['base.js']); // 手动维护的文件，不随脚本清理

// 路径第一段到文件名的映射
const DIR_NAME_MAP = {
  api: 'apiKey',
  email: 'email',
  sms: 'sms',
  health: 'health',
  openai: 'openaiProxy',
};

// 函数名覆写
const FN_NAME_OVERRIDES = {
  'GET /health': 'healthCheck',
  'POST /email/v1/send': 'sendEmail',
  'POST /sms/v1/send': 'sendSms',
};

function deriveFnName(swaggerPath, method) {
  const key = `${method.toUpperCase()} ${swaggerPath}`;
  if (FN_NAME_OVERRIDES[key]) return FN_NAME_OVERRIDES[key];

  const segments = swaggerPath
    .replace(/^\/api\//, '')
    .replace(/^\//, '')
    .split('/')
    .filter(s => s && !/^\{.*\}$/.test(s));

  const parts = segments.map(s =>
    s
      .split('-')
      .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
      .join(''),
  );

  const base = toCamelCase(parts);

  if (method.toUpperCase() === 'GET') {
    return 'get' + base[0].toUpperCase() + base.slice(1);
  }

  return base || 'root';
}

function deriveDirName(swaggerPath) {
  const firstSegment = swaggerPath.replace(/^\//, '').split('/')[0];
  return DIR_NAME_MAP[firstSegment] || firstSegment[0].toLowerCase() + firstSegment.slice(1);
}

function buildUrlPath(swaggerPath, pathParams) {
  // integration 风格：拼接到 base.server() 后面的相对路径
  if (pathParams.length === 0) return JSON.stringify(swaggerPath);
  const tmpl = swaggerPath.replace(/\{([^}]+)\}/g, (_, name) => {
    const encoder =
      swaggerPath === '/openai/v1/{path}'
        ? name + ".split('/').map(encodeURIComponent).join('/')"
        : 'encodeURIComponent(' + name + ')';
    return "' + " + encoder + " + '";
  });
  return "'" + tmpl + "'";
}

function renderJsDoc(summary, pathParams, bodyProps) {
  const lines = [];
  if (summary) lines.push(` * ${normalizeDescription(summary)}`);
  lines.push(' *');
  lines.push(' * @param {Object} args 请求参数');
  [...pathParams, ...bodyProps].forEach(p => {
    const desc = p.description ? ' ' + p.description : '';
    lines.push(` * @param {${p.type}} args.${p.name}${desc}`);
  });
  lines.push(' * @param {Object} options 配置参数');
  lines.push(' * @param {Boolean} options.silent 是否禁止错误弹层');
  lines.push(' * @returns {Promise<Boolean, ErrorModel>}');
  return '/**\n' + lines.join('\n') + '\n **/';
}

function renderFn(fn, dirName) {
  const { name, summary, httpMethod, url, pathParams, bodyProps } = fn;
  // integration 风格 actionName = dirName + fnName（首字母大写）
  const actionName = dirName + name[0].toUpperCase() + name.slice(1);

  const jsdoc = renderJsDoc(summary, pathParams, bodyProps);

  const bodyLines = [];

  if (pathParams.length) {
    bodyLines.push(`    const { ${pathParams.map(p => p.name).join(', ')}, ...rest } = args;`);
  }

  bodyLines.push(`    base.ajaxOptions.url = base.server(options) + ${url};`);
  bodyLines.push(`    base.ajaxOptions.type = '${httpMethod}';`);
  const payload = pathParams.length ? 'rest' : 'args';
  bodyLines.push(
    `    return mdyAPI(controllerName, '${actionName}', JSON.stringify(${payload}), $.extend(base, options));`,
  );

  return `${jsdoc}\n  ${name}: function (args, options) {\n${bodyLines.join('\n')}\n  },`;
}

function parseSwagger(swagger) {
  const dirMap = {};
  const paths = swagger.paths || {};

  for (const swaggerPath of Object.keys(paths)) {
    const pathItem = paths[swaggerPath];

    for (const method of ['get', 'post']) {
      const op = pathItem[method];
      if (!op) continue;

      const pathParams = collectPathParams(op, swaggerPath);
      const bodyProps = method === 'post' ? collectBodyProps(swagger, op) : [];
      const fnname = deriveFnName(swaggerPath, method);
      const dirName = deriveDirName(swaggerPath);

      const value = {
        name: fnname,
        summary: op.summary || '',
        httpMethod: method.toUpperCase(),
        url: buildUrlPath(swaggerPath, pathParams),
        pathParams,
        bodyProps,
      };

      if (dirMap[dirName]) {
        dirMap[dirName].push(value);
      } else {
        dirMap[dirName] = [value];
      }
    }
  }

  for (const key of Object.keys(dirMap)) {
    dirMap[key].sort((a, b) => a.name.localeCompare(b.name));
  }

  return dirMap;
}

function renderFile(fns, dirName) {
  const header = `/**
 * 该文件由 scripts/cloudApiGen.js 自动生成，请勿手动编辑。
 * 如需更新: npm run api:cloud
 */`;
  const body = fns.map(fn => renderFn(fn, dirName)).join('\n\n  ');
  return `${header}\nimport base, { controllerName } from './base';\n\nconst ${dirName} = {\n  ${body}\n};\n\nexport default ${dirName};\n`;
}

function handleOutput(dirMap) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 清理旧文件（保留 base.js）
  for (const name of fs.readdirSync(OUTPUT_DIR)) {
    if (PRESERVE_FILES.has(name)) continue;
    fs.rmSync(path.join(OUTPUT_DIR, name), { force: true });
  }

  Object.keys(dirMap).forEach(dirName => {
    const filePath = path.join(OUTPUT_DIR, dirName + '.js');
    fs.writeFileSync(filePath, renderFile(dirMap[dirName], dirName));
    print.normal(`${filePath.replace(ROOT_PATH + path.sep, '')} 输出成功`);
  });
  print.success(`请求文件已全部生成到 ${OUTPUT_DIR}`);
}

async function main() {
  print.info(`拉取 ${SWAGGER_URL}`);
  let swagger;

  try {
    const res = await axios.get(SWAGGER_URL);
    swagger = res.data;
  } catch (err) {
    print.danger(`获取 swagger 失败:${err.message}`);
    throw err;
  }

  const dirMap = parseSwagger(swagger);
  const totalCount = Object.values(dirMap).reduce((sum, fns) => sum + fns.length, 0);
  print.info(`解析到 ${totalCount} 个接口，分 ${Object.keys(dirMap).length} 个文件`);
  handleOutput(dirMap);
  await formatWithPrettier(OUTPUT_DIR);
  print.success('完成');
}

if (require.main === module) {
  main().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = main;
