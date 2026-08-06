const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file, stubs = {}) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  function localRequire(request) {
    if (stubs[request]) {
      return stubs[request];
    }

    return require(request);
  }

  new Function('module', 'exports', 'require', code)(module, module.exports, localRequire);
  return module.exports;
}

function createStorage(initialData = {}) {
  const store = { ...initialData };

  return {
    getItem: key => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
  };
}

global.md = {
  global: {
    Account: {
      accountId: 'account-1',
    },
  },
};
global.safeParse =
  global.safeParse ||
  ((value, defaultValue = {}) => {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue === 'array' ? [] : defaultValue;
    }
  });

const {
  formatAdvancedThemes,
  getAdvancedThemeAssetUrls,
  getAdvancedThemeBulletinPicExt,
  getAdvancedThemeChannel,
  getAppItemUrl,
  getAppNavigateUrl,
} = requireEsm('./utils.js', {
  'src/components/Form/core/formUtils/helper': {
    getEmbedValue: () => '',
  },
  'src/utils/controlCommon': {
    transferValue: () => [],
  },
});

global.localStorage = createStorage({
  'mdAppCache_account-1_app-1': '{bad json',
});

assert.doesNotThrow(() => {
  assert.strictEqual(getAppNavigateUrl('app-1', 1), '/app/app-1');
  assert.strictEqual(getAppItemUrl('app-1', 'section-1', 'worksheet-1'), '/app/app-1/section-1/worksheet-1');
});

global.localStorage = createStorage({
  'mdAppCache_account-1_app-1': JSON.stringify({
    lastGroupId: 'section-1',
    lastWorksheetId: 'worksheet-1',
    lastViewId: 'view-1',
    worksheets: [{ groupId: 'section-1', worksheetId: 'worksheet-1', viewId: 'view-1' }],
  }),
});

assert.strictEqual(getAppNavigateUrl('app-1', 1), '/app/app-1/section-1/worksheet-1/view-1?from=insite');
assert.strictEqual(getAppItemUrl('app-1', 'section-1', 'worksheet-1'), '/app/app-1/section-1/worksheet-1/view-1');

assert.strictEqual(getAdvancedThemeChannel('www.mingdao.com'), 'prod');
assert.strictEqual(getAdvancedThemeChannel('meihua.mingdao.com'), 'test');
assert.strictEqual(getAdvancedThemeChannel('sandbox.mingdao.com'), 'test');

assert.deepStrictEqual(getAdvancedThemeAssetUrls('leap', 'https://fp1.mingdaoyun.cn/dashboard/assets'), {
  appIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/app.png',
  appCollectIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/app_collect.png',
  chartCollectIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/chart.png',
  recordFavIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/record.png',
  processIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/process.png',
  recentIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/recent.png',
  bgImg: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/background.png',
});

assert.strictEqual(getAdvancedThemeBulletinPicExt({ bannerExt: 'gif' }), 'gif');
assert.strictEqual(getAdvancedThemeBulletinPicExt({ bannerExt: '.gif' }), 'gif');
assert.strictEqual(getAdvancedThemeBulletinPicExt({}), 'jpg');

assert.deepStrictEqual(
  formatAdvancedThemes(
    {
      themes: [
        { themeKey: 'spring', themeName: '春日' },
        { themeKey: 'leap', themeName: 'AI 飞跃版', bannerExt: 'gif' },
      ],
      channels: {
        test: 'leap',
        prod: ['spring', 'missing'],
      },
    },
    {
      channel: 'test',
      assetUrlPrefix: 'https://fp1.mingdaoyun.cn/dashboard/assets',
    },
  ),
  [
    {
      themeKey: 'leap',
      themeName: 'AI 飞跃版',
      bannerExt: 'gif',
      assetBaseUrl: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap',
      themeIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/main.png',
      bulletinPic: 'https://fp1.mingdaoyun.cn/dashboard/assets/leap/banner.gif',
    },
  ],
);

assert.deepStrictEqual(
  formatAdvancedThemes(
    {
      themes: [
        { themeKey: 'spring', themeName: '春日' },
        { themeKey: 'leap', themeName: 'AI 飞跃版' },
      ],
      channels: {
        test: 'leap',
        prod: ['spring', 'missing'],
      },
    },
    {
      channel: 'prod',
      assetUrlPrefix: 'https://fp1.mingdaoyun.cn/dashboard/assets',
    },
  ),
  [
    {
      themeKey: 'spring',
      themeName: '春日',
      assetBaseUrl: 'https://fp1.mingdaoyun.cn/dashboard/assets/spring',
      themeIcon: 'https://fp1.mingdaoyun.cn/dashboard/assets/spring/main.png',
      bulletinPic: 'https://fp1.mingdaoyun.cn/dashboard/assets/spring/banner.jpg',
    },
  ],
);

assert.deepStrictEqual(formatAdvancedThemes(null), []);

console.log('AppCenter utils tests passed');
