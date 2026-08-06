const assert = require('assert');
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

const projectRoot = path.resolve(__dirname, '../..');
const files = [
  'src/pages/Mobile/components/TabBar/index.js',
  'src/pages/Mobile/Members/ChangeRole/index.js',
  'src/pages/Mobile/Members/List/index.js',
  'src/pages/Mobile/Members/index.js',
  'src/pages/Mobile/MyHome/index.js',
  'src/pages/Admin/app/exclusiveComp/container/DataBase.jsx',
  'src/pages/agent/AgentLand.jsx',
];
const mobileIndexFile = 'src/pages/Mobile/index.jsx';
const preallFile = 'src/common/preall.js';
const publicWorksheetActionFile = 'src/pages/PublicWorksheet/action.js';
const prePayorderFile = 'src/pages/Admin/pay/PrePayorder/index.js';
const calendarShareFile = 'src/pages/calendar/share/index.jsx';
const pathToRegexpFiles = [
  {
    file: 'src/socket/customNotice/index.js',
    direct: 'integrationParams(location.pathname)',
    normalized: 'integrationParams(getPathWithoutSubPath(location.pathname))',
  },
  {
    file: 'src/pages/invoice/InvoiceApply/index.jsx',
    direct: 'invoiceParams(location.pathname)',
    normalized: 'invoiceParams(getPathWithoutSubPath(location.pathname))',
  },
  {
    file: 'src/pages/Admin/pay/OrderPay/index.js',
    direct: 'fn(location.pathname)',
    normalized: 'fn(getPathWithoutSubPath(location.pathname))',
  },
];

function walk(node, visitor) {
  if (!node || typeof node !== 'object') return;

  visitor(node);

  Object.keys(node).forEach(key => {
    if (key === 'loc' || key === 'start' || key === 'end') return;

    const value = node[key];

    if (Array.isArray(value)) {
      value.forEach(child => walk(child, visitor));
    } else if (value && typeof value.type === 'string') {
      walk(value, visitor);
    }
  });
}

function getMemberExpressionName(node) {
  if (!node) return '';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'ThisExpression') return 'this';
  if (node.type === 'MemberExpression') {
    return `${getMemberExpressionName(node.object)}.${getMemberExpressionName(node.property)}`;
  }

  return '';
}

function isHistoryRootNavigation(node) {
  const historyObject = getMemberExpressionName(node.callee && node.callee.object);

  return (
    node.type === 'CallExpression' &&
    node.callee &&
    node.callee.type === 'MemberExpression' &&
    (historyObject === 'history' || historyObject.endsWith('.history')) &&
    node.callee.property &&
    ['push', 'replace'].includes(node.callee.property.name) &&
    node.arguments[0] &&
    ((node.arguments[0].type === 'StringLiteral' && node.arguments[0].value.startsWith('/')) ||
      (node.arguments[0].type === 'TemplateLiteral' &&
        node.arguments[0].quasis[0] &&
        node.arguments[0].quasis[0].value.raw.startsWith('/')))
  );
}

const violations = [];

files.forEach(file => {
  const source = fs.readFileSync(path.join(projectRoot, file), 'utf8');
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties'],
  });

  walk(ast, node => {
    if (isHistoryRootNavigation(node)) {
      violations.push(`${file}:${node.loc.start.line}`);
    }
  });
});

{
  const source = fs.readFileSync(path.join(projectRoot, mobileIndexFile), 'utf8');
  const ast = parser.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'classProperties'],
  });
  const checks = {
    importsGetPathWithoutSubPath: false,
    normalizesMobileFallbackPathname: false,
  };

  walk(ast, node => {
    if (
      node.type === 'ImportDeclaration' &&
      node.source.value === 'src/utils/common' &&
      node.specifiers.some(specifier => specifier.imported && specifier.imported.name === 'getPathWithoutSubPath')
    ) {
      checks.importsGetPathWithoutSubPath = true;
    }

    if (
      node.type === 'VariableDeclarator' &&
      node.id &&
      node.id.name === 'pathname' &&
      node.init &&
      node.init.type === 'CallExpression' &&
      node.init.callee.name === 'getPathWithoutSubPath' &&
      node.init.arguments[0] &&
      node.init.arguments[0].type === 'MemberExpression' &&
      node.init.arguments[0].object.name === 'location' &&
      node.init.arguments[0].property.name === 'pathname'
    ) {
      checks.normalizesMobileFallbackPathname = true;
    }
  });

  assert.deepStrictEqual(checks, {
    importsGetPathWithoutSubPath: true,
    normalizesMobileFallbackPathname: true,
  });
}

{
  const source = fs.readFileSync(path.join(projectRoot, preallFile), 'utf8');

  assert(!source.includes('md.global.Config.WebUrl + location.pathname + search'));
  assert(!source.includes('md.global.Config.WebUrl + `/portal/${md.global.Account.appId}`'));
  assert(!source.includes("md.global.Config.WebUrl + '/dashboard'"));
  assert(
    !source.includes(
      "md.global.Config.WebUrl.replace(/\\/+$/, '') + getPathWithoutSubPath(location.pathname) + search",
    ),
  );
  assert(source.includes('location.href = pathCompletion(`${location.pathname}${search}`);'));
  assert(source.includes('location.href = pathCompletion(`/portal/${md.global.Account.appId}`);'));
  assert(source.includes("location.href = pathCompletion('/dashboard');"));
}

{
  const source = fs.readFileSync(path.join(projectRoot, publicWorksheetActionFile), 'utf8');

  assert(!source.includes('`${md.global.Config.WebUrl}${url}ReturnUrl=${encodeURIComponent(location.href)}`'));
  assert(!source.includes('`${md.global.Config.WebUrl}weixinAuth`'));
  assert(source.includes('location.href = pathCompletion(`${url}ReturnUrl=${encodeURIComponent(location.href)}`);'));
  assert(source.includes("const baseUrl = pathCompletion('/weixinAuth');"));
}

{
  const source = fs.readFileSync(path.join(projectRoot, prePayorderFile), 'utf8');
  const orderpayPathCompletion = ['pathCompletion(`/', 'orderpay/${orderId}`)'].join('');

  assert(source.includes('`${md.global.Config.WebUrl}orderpay/${orderId}`'));
  assert(!source.includes(orderpayPathCompletion));
}

{
  const source = fs.readFileSync(path.join(projectRoot, calendarShareFile), 'utf8');

  assert(!source.includes("md.global.Config.WebUrl + 'images/calendar/sharelogo.png'"));
  assert(source.includes("imgUrl: '/staticfiles/images/calendar/sharelogo.png'"));
}

pathToRegexpFiles.forEach(({ file, direct, normalized }) => {
  const source = fs.readFileSync(path.join(projectRoot, file), 'utf8');

  assert(!source.includes(direct), `${file} should not pass location.pathname directly to path-to-regexp`);
  assert(source.includes(normalized), `${file} should normalize pathname before path-to-regexp match`);
});

assert.deepStrictEqual(violations, []);

console.log('subPath navigation tests passed');
