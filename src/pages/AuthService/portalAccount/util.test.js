const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function loadUtil({
  href,
  pathname,
  search,
  isMobile = true,
  subPath = '',
  completeDomain = false,
  completeSearch = false,
}) {
  const moduleLike = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, 'util.js'), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  global.window = {
    isWaiting: false,
    subPath,
    localStorage: {
      removeItem: () => null,
    },
  };
  global.location = {
    href,
    origin: new URL(href).origin,
    pathname,
    search: search === undefined ? new URL(href).search : search,
  };
  global.md = {
    global: {
      Account: {
        isPortal: true,
        appId: 'app-123',
        addressSuffix: 'xxxx12343',
      },
    },
  };
  global._l = text => text;
  global.alert = () => null;
  global.safeLocalStorageSetItem = () => null;

  function pathCompletion(url) {
    let targetUrl = url;

    if (isMobile && url === '/xxxx12343') targetUrl = '/app/app-123';
    if (isMobile && url === '/portal/xxxx12343') targetUrl = '/portal/app/app-123';
    if (isMobile && url === '/tenant/portal/xxxx12343') targetUrl = '/tenant/portal/app/app-123';

    if (completeSearch && location.search && !targetUrl.includes('?')) {
      targetUrl = `${targetUrl}${location.search}`;
    }

    return completeDomain && targetUrl.startsWith('/') ? `${location.origin}${targetUrl}` : targetUrl;
  }

  function localRequire(importPath) {
    if (importPath === 'src/api/externalPortal') {
      return {};
    }

    if (importPath === 'src/utils/common') {
      return {
        browserIsMobile: () => isMobile,
        getRequest: () => ({}),
        pathCompletion,
      };
    }

    if (importPath === 'src/utils/pssId') {
      return {
        setPssId: () => null,
      };
    }

    return require(importPath);
  }

  new Function('module', 'exports', 'require', 'window', 'location', 'md', '_l', 'alert', code)(
    moduleLike,
    moduleLike.exports,
    localRequire,
    global.window,
    global.location,
    global.md,
    global._l,
    global.alert,
  );

  return moduleLike.exports;
}

function runResetPortalUrl(options) {
  const { resetPortalUrl } = loadUtil(options);

  resetPortalUrl();

  return {
    href: global.location.href,
    isWaiting: global.window.isWaiting,
  };
}

assert.deepStrictEqual(
  runResetPortalUrl({
    href: 'https://www.theportal.cn/xxxx12343',
    pathname: '/xxxx12343',
  }),
  {
    href: '/app/app-123',
    isWaiting: true,
  },
);

assert.deepStrictEqual(
  runResetPortalUrl({
    href: 'https://meihua.mingdao.com/portal/xxxx12343',
    pathname: '/portal/xxxx12343',
    subPath: '/portal',
  }),
  {
    href: '/portal/app/app-123',
    isWaiting: true,
  },
);

assert.deepStrictEqual(
  runResetPortalUrl({
    href: 'https://meihua.mingdao.com/portal/mobile/app/app-123',
    pathname: '/portal/mobile/app/app-123',
    subPath: '/portal',
  }),
  {
    href: 'https://meihua.mingdao.com/portal/mobile/app/app-123',
    isWaiting: false,
  },
);

assert.deepStrictEqual(
  runResetPortalUrl({
    href: 'https://meihua.mingdao.com/portal/app/app-123',
    pathname: '/portal/app/app-123',
    subPath: '/portal',
    completeDomain: true,
  }),
  {
    href: 'https://meihua.mingdao.com/portal/app/app-123',
    isWaiting: false,
  },
);

assert.deepStrictEqual(
  runResetPortalUrl({
    href: 'https://meihua.mingdao.com/portal/app/app-123?rp=no',
    pathname: '/portal/app/app-123',
    subPath: '/portal',
    completeDomain: true,
    completeSearch: true,
  }),
  {
    href: 'https://meihua.mingdao.com/portal/app/app-123?rp=no',
    isWaiting: false,
  },
);

console.log('portalAccount util tests passed');
