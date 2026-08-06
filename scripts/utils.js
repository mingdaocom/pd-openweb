const path = require('path');
const { spawn } = require('child_process');

const ROOT_PATH = path.join(__dirname, '..');

const print = {
  danger: str => console.log('%s: \x1b[31m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  info: str => console.log('%s: \x1b[34m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  success: str => console.log('%s: \x1b[32m%s\x1b[0m', `[${new Date().toLocaleString()}]`, str),
  normal: str => console.log('%s: %s', `[${new Date().toLocaleString()}]`, str),
};

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} 执行失败，退出码 ${code}`));
      }
    });
  });
}

function formatWithPrettier(targetPath) {
  return runCommand('npx', ['prettier', targetPath, '--write']);
}

function normalizeDescription(description = '') {
  return description.replace(/\s+/g, ' ').trim();
}

function toCamelCase(parts) {
  // 先把每个段按 - / _ 拆分,避免 free-quota 之类生成非法标识符
  const words = parts.reduce((list, part) => list.concat(String(part).split(/[-_]+/).filter(Boolean)), []);
  return words
    .map((word, index) => (index === 0 ? word[0].toLowerCase() + word.slice(1) : word[0].toUpperCase() + word.slice(1)))
    .join('');
}

function resolveSchema(swagger, $ref) {
  const name = $ref && $ref.match('[^/]+(?!.*/)')[0];
  return name && swagger.components && swagger.components.schemas && swagger.components.schemas[name];
}

function collectBodyProps(swagger, op) {
  const contentObj =
    op.requestBody &&
    op.requestBody.content &&
    (op.requestBody.content['application/json'] ||
      op.requestBody.content['application/json-patch+json'] ||
      op.requestBody.content['text/json']);

  if (!contentObj || !contentObj.schema || !contentObj.schema.$ref) return [];

  const schema = resolveSchema(swagger, contentObj.schema.$ref);
  if (!schema || !schema.properties) return [];

  return Object.entries(schema.properties).map(([name, prop]) => ({
    name,
    type: prop.type || (prop.$ref ? 'Object' : 'any'),
    description: normalizeDescription(prop.description || ''),
  }));
}

function collectQueryParams(op) {
  return (op.parameters || [])
    .filter(param => param.in === 'query')
    .map(param => ({
      name: param.name,
      type: (param.schema && param.schema.type) || 'any',
      description: normalizeDescription(param.description || ''),
    }));
}

function collectPathParams(op, swaggerPath) {
  const names = Array.from(swaggerPath.matchAll(/\{([^}]+)\}/g)).map(match => match[1]);
  const paramDefs = (op.parameters || []).filter(param => param.in === 'path');

  return names.map(name => {
    const def = paramDefs.find(param => param.name === name) || {};
    return {
      name,
      type: (def.schema && def.schema.type) || 'string',
      description: normalizeDescription(def.description || ''),
    };
  });
}

function isSseEndpoint(swaggerPath, op) {
  if (/\/stream$/.test(swaggerPath)) return true;

  const summary = (op.summary || '').toLowerCase();
  return /sse|event-stream|event_stream|server-sent/.test(summary);
}

module.exports = {
  ROOT_PATH,
  collectBodyProps,
  collectPathParams,
  collectQueryParams,
  formatWithPrettier,
  isSseEndpoint,
  normalizeDescription,
  print,
  runCommand,
  toCamelCase,
};
