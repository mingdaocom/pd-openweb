const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function loadCommon() {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'common.js'), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    if (request === 'src/api/appManagement' || request === 'src/api/qiniu' || request === 'src/api/webCache') {
      return {};
    }

    if (request === './enum') {
      return { PUBLIC_KEY: '' };
    }

    if (request === './expression') {
      return {};
    }

    if (request === './pssId') {
      return { getPssId: () => '' };
    }

    return require(request);
  }

  global.window = {
    subPath: '',
    __customSubPath__: '/tenant',
    md: { global: { Account: {}, Config: { WebUrl: 'https://example.com/tenant/' } } },
  };
  global.md = global.window.md;
  global.location = {
    origin: 'https://example.com',
    search: '',
    href: 'https://example.com/tenant/app/my',
  };
  global.navigator = { userAgent: 'node' };

  new Function('module', 'exports', 'require', 'window', 'location', 'navigator', 'md', code)(
    moduleLike,
    moduleLike.exports,
    localRequire,
    global.window,
    global.location,
    global.navigator,
    global.md,
  );

  return moduleLike.exports;
}

const common = loadCommon();

assert.strictEqual(common.pathCompletion('/login'), 'https://example.com/tenant/login');
assert.strictEqual(common.pathCompletion('/tenant/login'), 'https://example.com/tenant/login');
assert.strictEqual(common.pathCompletion('/login', { hasDomain: false }), '/tenant/login');
assert.strictEqual(common.getPathWithoutSubPath('/tenant/app/my?x=1#hash'), '/app/my?x=1#hash');
assert.strictEqual(common.addSubPathOfRoute('/app/my'), '/tenant/app/my');
assert.strictEqual(common.addSubPathOfRoute('/tenant/app/my'), '/tenant/app/my');

window.md.global.Config.WebUrl = '';

assert.strictEqual(common.pathCompletion('/login'), 'https://example.com/tenant/login');
assert.strictEqual(common.pathCompletion('/tenant/login'), 'https://example.com/tenant/login');

window.md.global.Config.WebUrl = 'https://example.com/tenant';

assert.strictEqual(common.pathCompletion('/login'), 'https://example.com/tenant/login');
assert.strictEqual(common.pathCompletion('/tenant/login'), 'https://example.com/tenant/login');

window.md.global.Config.WebUrl = 'https://app.example.com/tenant/';
location.origin = 'https://custom.example.com';

assert.strictEqual(common.pathCompletion('/login'), 'https://custom.example.com/tenant/login');
assert.strictEqual(common.pathCompletion('/tenant/login'), 'https://custom.example.com/tenant/login');

location.origin = 'https://example.com';
window.__customSubPath__ = '';
window.subPath = '';
window.md.global.Config.WebUrl = 'https://example.com/';

assert.strictEqual(common.pathCompletion('/login'), 'https://example.com/login');
assert.strictEqual(common.pathCompletion('/login', { hasDomain: false }), '/login');

window.md.global.Config.WebUrl = 'https://example.com/tenant/portal/';
window.subPath = '/tenant/portal';

assert.strictEqual(common.pathCompletion('/login'), 'https://example.com/tenant/portal/login');
assert.strictEqual(common.pathCompletion('/tenant/portal/login'), 'https://example.com/tenant/portal/login');
assert.strictEqual(common.pathCompletion('/login', { hasDomain: false }), '/tenant/portal/login');
assert.strictEqual(common.getPathWithoutSubPath('/tenant/portal/app/my'), '/app/my');

console.log('common subPath tests passed');
