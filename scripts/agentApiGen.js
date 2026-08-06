const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { mdAgentApiServer } = require('../CI/publishConfig');
const {
  ROOT_PATH,
  collectBodyProps,
  collectPathParams,
  collectQueryParams,
  formatWithPrettier,
  isSseEndpoint,
  normalizeDescription,
  print,
  toCamelCase,
} = require('./utils');

const SWAGGER_URL =
  (process.env.AGENT_SWAGGER_URL || mdAgentApiServer)?.replace(/\/$/, '') + '/swagger/v1.0.0.0/swagger.json';
const OUTPUT_PATH = path.join(ROOT_PATH, 'src/api/agent.js');

// 极少数命名不顺时的兜底覆盖,key = `${METHOD} ${path}`
const FN_NAME_OVERRIDES = {
  'POST /api/agui': 'aguiRun',
};

function deriveFnName(swaggerPath, method) {
  const key = `${method.toUpperCase()} ${swaggerPath}`;
  if (FN_NAME_OVERRIDES[key]) return FN_NAME_OVERRIDES[key];

  // 去掉 /api/ 前缀,移除 {xxx} 路径参数段
  const segments = swaggerPath
    .replace(/^\/api\//, '')
    .split('/')
    .filter(s => s && !/^\{.*\}$/.test(s));

  const base = toCamelCase(segments);

  const upper = method.toUpperCase();
  const Base = base ? base[0].toUpperCase() + base.slice(1) : '';

  // GET/DELETE/PUT/PATCH 加方法前缀避免与 POST 同名碰撞；POST 沿用裸 base（如 agentSessionsRename）
  if (upper === 'GET') return 'get' + Base;
  if (upper === 'DELETE') return 'delete' + Base;
  if (upper === 'PUT') return 'put' + Base;
  if (upper === 'PATCH') return 'patch' + Base;

  return base || 'root';
}

function buildUrlTemplate(swaggerPath, pathParams) {
  if (pathParams.length === 0) return JSON.stringify(swaggerPath);
  const tmpl = swaggerPath.replace(/\{([^}]+)\}/g, (_, name) => '${encodeURIComponent(' + name + ')}');
  return '`' + tmpl + '`';
}

function renderJsDoc(summary, pathParams, queryParams, bodyProps) {
  const lines = [];
  if (summary) lines.push(` * ${normalizeDescription(summary)}`);
  lines.push(' * @param {Object} args 请求参数');
  [...pathParams, ...queryParams, ...bodyProps].forEach(p => {
    const desc = p.description ? ' ' + p.description : '';
    lines.push(` * @param {${p.type}} args.${p.name}${desc}`);
  });
  lines.push(' * @param {Object} options 配置参数');
  lines.push(' * @param {Boolean} options.silent 是否禁止错误弹层');
  return '/**\n' + lines.join('\n') + '\n */';
}

function renderFn(fn) {
  const { name, summary, httpMethod, url, pathParams, queryParams, bodyProps, isStream } = fn;

  const jsdoc = renderJsDoc(summary, pathParams, queryParams, bodyProps);
  const sigArgs = pathParams.length > 0 || queryParams.length > 0 ? 'args = {}' : 'args';
  const restExpr = pathParams.length > 0 ? `const { ${pathParams.map(p => p.name).join(', ')}, ...rest } = args;` : '';
  const payload = pathParams.length > 0 ? 'rest' : 'args';

  const reqOptionsLines = [];
  reqOptionsLines.push(`      ...options,`);
  reqOptionsLines.push(`      url: ${url},`);
  reqOptionsLines.push(`      method: '${httpMethod}',`);
  if (isStream) reqOptionsLines.push(`      isStream: true,`);

  const bodyLines = [];
  if (restExpr) bodyLines.push(`    ${restExpr}`);
  bodyLines.push(`    return agentAPI(${payload}, {\n${reqOptionsLines.join('\n')}\n    });`);

  return `${jsdoc}\n  ${name}: function (${sigArgs}, options = {}) {\n${bodyLines.join('\n')}\n  },`;
}

function parseSwagger(swagger) {
  const fns = [];
  const paths = swagger.paths || {};

  for (const swaggerPath of Object.keys(paths)) {
    const pathItem = paths[swaggerPath];

    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const op = pathItem[method];
      if (!op) continue;

      const pathParams = collectPathParams(op, swaggerPath);
      const queryParams = collectQueryParams(op);
      const bodyProps = ['post', 'put', 'patch'].includes(method) ? collectBodyProps(swagger, op) : [];
      const fnname = deriveFnName(swaggerPath, method);

      fns.push({
        name: fnname,
        summary: op.summary || '',
        httpMethod: method.toUpperCase(),
        url: buildUrlTemplate(swaggerPath, pathParams),
        pathParams,
        queryParams,
        bodyProps,
        isStream: isSseEndpoint(swaggerPath, op),
      });
    }
  }

  // 同名（去 path-param 后命名碰撞）：path-param 最少的保留原名，其余用末尾 path-param 拼 By 后缀
  const grouped = fns.reduce((m, fn) => ((m[fn.name] = m[fn.name] || []).push(fn), m), {});
  Object.values(grouped)
    .filter(list => list.length > 1)
    .forEach(list => {
      list.sort((a, b) => a.pathParams.length - b.pathParams.length);
      for (let i = 1; i < list.length; i++) {
        const fn = list[i];
        const last = fn.pathParams[fn.pathParams.length - 1];
        if (!last) continue;
        fn.name = `${fn.name}By${last.name[0].toUpperCase()}${last.name.slice(1)}`;
      }
    });

  // 稳定排序:按最终函数名字典序
  fns.sort((a, b) => a.name.localeCompare(b.name));
  return fns;
}

function renderFile(fns) {
  const header = `/**
 * 该文件由 scripts/agentApiGen.js 自动生成,请勿手动编辑。
 * 如需更新: npm run api:agent
 */`;
  const body = fns.map(renderFn).join('\n\n  ');
  return `${header}\nexport default {\n  ${body}\n};\n`;
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

  const fns = parseSwagger(swagger);
  print.info(`解析到 ${fns.length} 个接口`);
  const text = renderFile(fns);
  fs.writeFileSync(OUTPUT_PATH, text);
  print.info(`输出 ${OUTPUT_PATH}`);
  await formatWithPrettier(OUTPUT_PATH);
  print.success('完成');
}

if (require.main === module) {
  main().catch(err => {
    print.danger(err.stack || err.message);
    process.exit(1);
  });
}

module.exports = main;
