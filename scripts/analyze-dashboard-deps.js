/**
 * 分析 Dashboard/AppHomepage 依赖体积前后对比
 * node scripts/analyze-dashboard-deps.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const ALIASES = {
  worksheet: path.join(SRC, 'pages/worksheet'),
  mobile: path.join(SRC, 'pages/Mobile'),
  statistics: path.join(SRC, 'pages/Statistics'),
  router: path.join(SRC, 'router'),
};

const IMPORT_RE = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const APP_HOMEPAGE_ENTRIES = [
  'src/pages/AppHomepage/AppCenter/index.jsx',
  'src/router/PageHeader/AppCenterHeader/index.jsx',
];

const FULL_PAGE_ENTRIES = [...APP_HOMEPAGE_ENTRIES, 'src/router/App.jsx'];

const BEFORE_IMPORT_OVERRIDES = {
  'src/pages/AppHomepage/Dashboard/index.jsx': {
    'src/utils/controlCommon': 'src/pages/widgetConfig/util',
  },
  'src/pages/AppHomepage/Dashboard/utils.js': {
    'src/utils/controlCommon': 'src/pages/widgetConfig/util',
  },
  'src/pages/AppHomepage/Dashboard/DashboardSetting.jsx': {
    'src/utils/controlCommon': 'src/pages/widgetConfig/util',
  },
  'src/pages/AppHomepage/AppCenter/components/AppGrid.jsx': {
    'src/utils/controlCommon': 'src/pages/widgetConfig/util',
  },
  'src/pages/AppHomepage/AppCenter/utils.js': {
    'src/utils/controlCommon': 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util',
  },
};

function normalizeRequest(fromFile, request) {
  if (request.startsWith('src/')) return path.join(ROOT, request);
  if (ALIASES[request.split('/')[0]]) {
    const aliasKey = request.split('/')[0];
    return path.join(ALIASES[aliasKey], request.slice(aliasKey.length + 1));
  }

  if (request.startsWith('.')) return path.resolve(path.dirname(fromFile), request);
  return null;
}

function resolveFile(filePath) {
  return [
    filePath,
    `${filePath}.js`,
    `${filePath}.jsx`,
    path.join(filePath, 'index.js'),
    path.join(filePath, 'index.jsx'),
  ].find(p => fs.existsSync(p));
}

function applyImportOverrides(fromFile, request, isBefore) {
  if (!isBefore) return request;
  const rel = path.relative(ROOT, fromFile).split(path.sep).join('/');
  return BEFORE_IMPORT_OVERRIDES[rel]?.[request] || request;
}

function getImports(filePath, isBefore) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = [];
  let match;

  while ((match = IMPORT_RE.exec(content)) !== null) {
    const request = applyImportOverrides(filePath, match[1] || match[2], isBefore);
    if (!request || (!request.includes('/') && !request.startsWith('.'))) continue;
    if (request.includes('node_modules')) continue;
    imports.push(request);
  }

  return imports;
}

function categorize(filePath) {
  const rel = path.relative(SRC, filePath).split(path.sep).join('/');
  if (rel.startsWith('pages/widgetConfig')) return 'widgetConfig';
  if (rel.startsWith('utils/controlCommon')) return 'controlCommon';
  if (rel.startsWith('pages/AppHomepage')) return 'AppHomepage';
  if (rel.startsWith('socket')) return 'socket';
  if (rel.startsWith('pages/worksheet')) return 'worksheet';
  if (rel.startsWith('components/Form')) return 'Form';
  if (rel.startsWith('utils/')) return 'utils';
  return 'other';
}

function walk(entryPaths, isBefore) {
  const visited = new Set();
  const fileMap = new Map();
  const queue = entryPaths.map(p => path.join(ROOT, p));

  while (queue.length) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (!fs.existsSync(current)) continue;

    const stat = fs.statSync(current);

    if (stat.isDirectory()) {
      queue.push(...fs.readdirSync(current).map(name => path.join(current, name)));
      continue;
    }

    if (!/\.(js|jsx)$/.test(current)) continue;

    fileMap.set(current, { path: current, size: stat.size, category: categorize(current) });
    getImports(current, isBefore).forEach(request => {
      const base = normalizeRequest(current, request);
      if (!base) return;
      const resolved = resolveFile(base);
      if (resolved) queue.push(resolved);
    });
  }

  return fileMap;
}

function summarize(fileMap) {
  const files = [...fileMap.values()];
  const byCategory = {};
  let total = 0;
  files.forEach(({ size, category }) => {
    total += size;
    byCategory[category] = (byCategory[category] || 0) + size;
  });

  const widgetModules = {};
  files
    .filter(f => f.path.includes(`${path.sep}widgetConfig${path.sep}`))
    .forEach(f => {
      const rel = path.relative(path.join(SRC, 'pages/widgetConfig'), f.path).split(path.sep);
      const key = rel.slice(0, Math.min(2, rel.length)).join('/') || rel[0];
      widgetModules[key] = (widgetModules[key] || 0) + f.size;
    });

  return { total, byCategory, widgetModules, fileCount: files.length, paths: new Set(fileMap.keys()) };
}

function diffPaths(beforePaths, afterPaths) {
  const removed = [];
  beforePaths.forEach(p => {
    if (!afterPaths.has(p)) removed.push(p);
  });
  return removed;
}

function sumSizes(paths, fileMap) {
  return paths.reduce((sum, p) => sum + (fileMap.get(p)?.size || 0), 0);
}

function topModules(widgetModules, limit = 10) {
  return Object.entries(widgetModules)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, bytes]) => ({ name, kiB: +(bytes / 1024).toFixed(1) }));
}

function analyze(entries, label) {
  const beforeMap = walk(entries, true);
  const afterMap = walk(entries, false);
  const before = summarize(beforeMap);
  const after = summarize(afterMap);
  const removedPaths = diffPaths(before.paths, after.paths);
  const addedPaths = diffPaths(after.paths, before.paths);
  const removedSize = sumSizes(removedPaths, beforeMap);
  const addedSize = sumSizes(addedPaths, afterMap);

  const removedWidget = removedPaths.filter(p => p.includes(`${path.sep}widgetConfig${path.sep}`));
  const removedWidgetSize = sumSizes(removedWidget, beforeMap);

  return {
    label,
    before: {
      totalKiB: +(before.total / 1024).toFixed(1),
      widgetConfigKiB: +((before.byCategory.widgetConfig || 0) / 1024).toFixed(1),
      controlCommonKiB: +((before.byCategory.controlCommon || 0) / 1024).toFixed(1),
      fileCount: before.fileCount,
      topWidgetModules: topModules(before.widgetModules),
    },
    after: {
      totalKiB: +(after.total / 1024).toFixed(1),
      widgetConfigKiB: +((after.byCategory.widgetConfig || 0) / 1024).toFixed(1),
      controlCommonKiB: +((after.byCategory.controlCommon || 0) / 1024).toFixed(1),
      fileCount: after.fileCount,
      topWidgetModules: topModules(after.widgetModules),
    },
    delta: {
      totalSavedKiB: +((before.total - after.total) / 1024).toFixed(1),
      widgetConfigSavedKiB: +(
        ((before.byCategory.widgetConfig || 0) - (after.byCategory.widgetConfig || 0)) /
        1024
      ).toFixed(1),
      exclusiveRemovedKiB: +(removedSize / 1024).toFixed(1),
      exclusiveRemovedWidgetKiB: +(removedWidgetSize / 1024).toFixed(1),
      exclusiveAddedKiB: +(addedSize / 1024).toFixed(1),
      removedFileCount: removedPaths.length,
      topRemovedWidgetModules: topModules(
        removedWidget.reduce((acc, p) => {
          const rel = path.relative(path.join(SRC, 'pages/widgetConfig'), p).split(path.sep);
          const key = rel.slice(0, Math.min(2, rel.length)).join('/') || rel[0];
          acc[key] = (acc[key] || 0) + (beforeMap.get(p)?.size || 0);
          return acc;
        }, {}),
        8,
      ),
    },
  };
}

const appHomepage = analyze(APP_HOMEPAGE_ENTRIES, 'AppHomepage子图');
const fullPage = analyze(FULL_PAGE_ENTRIES, '整页含Socket');

console.log(
  JSON.stringify(
    {
      note: '体积按源文件字节累加估算，gzip 后 webpack chunk 约为 25%-35%',
      appHomepage,
      fullPage,
      userImageModules: [
        { name: 'widgetSetting/settings', beforeKiB: 123.6 },
        { name: 'DevelopWithAI', beforeKiB: 93.0 },
        { name: 'WidgetHighSetting', beforeKiB: 86.2 },
        { name: 'DynamicDefaultValue', beforeKiB: 84.6 },
        { name: 'OptionList', beforeKiB: 32.2 },
        { name: 'relateSheet', beforeKiB: 31.2 },
        { name: 'config/widget.js', beforeKiB: 23.2 },
        { name: 'styled/index.js', beforeKiB: 21.4 },
        { name: 'WidgetVerify', beforeKiB: 21.1 },
        { name: 'util/data.js', beforeKiB: 20.8 },
      ],
    },
    null,
    2,
  ),
);
