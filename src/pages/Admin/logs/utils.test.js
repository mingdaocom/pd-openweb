const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    return Object.prototype.hasOwnProperty.call(stubs, request) ? stubs[request] : require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

const { completeAdminLogLinks } = requireEsm('./utils.js', {
  'src/utils/common': {
    pathCompletion: url => (url.startsWith('/tenant/') ? url : `/tenant${url}`),
  },
});

assert.strictEqual(
  completeAdminLogLinks('浏览了记录[<a target="_blank" href="/app/app-1/sheet-1/row/row-1">11213</a>]'),
  '浏览了记录[<a target="_blank" href="/tenant/app/app-1/sheet-1/row/row-1">11213</a>]',
);
assert.strictEqual(
  completeAdminLogLinks('<a href=\'/worksheet/sheet-1\'>工作表</a><a HREF="/tenant/app/app-1">应用</a>'),
  '<a href=\'/tenant/worksheet/sheet-1\'>工作表</a><a HREF="/tenant/app/app-1">应用</a>',
);
assert.strictEqual(
  completeAdminLogLinks(
    '<a href="https://example.com/help">外链</a><a href="//cdn.example.com/a">资源</a><a href="#detail">锚点</a>',
  ),
  '<a href="https://example.com/help">外链</a><a href="//cdn.example.com/a">资源</a><a href="#detail">锚点</a>',
);
assert.strictEqual(completeAdminLogLinks('无链接内容'), '无链接内容');
assert.strictEqual(completeAdminLogLinks(''), '');
assert.strictEqual(completeAdminLogLinks(undefined), undefined);

[
  'components/AppAndWorksheetLog/index.js',
  'components/WorksheetLogDrawer/WorksheetLog.jsx',
  'orgLog/index.jsx',
  'orgLog/HistoryLogs.jsx',
  '../app/globalVariable/components/VarLog.jsx',
].forEach(file => {
  const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
  assert.match(source, /completeAdminLogLinks\(/, `${file} should complete operation-content links`);
});

console.log('Admin log subPath links tests passed');
