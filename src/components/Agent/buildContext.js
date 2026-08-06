import { getPathWithoutSubPath } from 'src/utils/common';

// Plan 产出物 → 下游 agent 入参派生。对齐 assets/agents/prod/build-app/build-app-agent.yaml inputs。
// required: projectId / appName / groupNames / worksheets
// optional: dashboards / workspaces / aiAssistants / customActions / roles / workflows
// 数据源：6 文件 schema 中的 worksheets.json + custom-pages.json + roles.json + custom-actions.json + workflows.json。
// build-app-agent 的 inputs schema 保持不变（filter 在前端做完，a2a 仍按 worksheets/dashboards/workspaces 分输入）。

export function getCurrentProjectId() {
  try {
    const explicit = localStorage.getItem('currentProjectId');

    if (explicit) return explicit;
  } catch {
    /* ignore */
  }

  const projects = window.md && window.md.global && window.md.global.Account && window.md.global.Account.projects;

  return (projects && projects[0] && projects[0].projectId) || '';
}

// appId 为固定的 GUID 格式（8-4-4-4-12 hex）。用格式校验判定「是否为具体应用」，
// 比维护 my/lib 等列表页黑名单更稳：/app/my、/app/lib 及任何非应用首段都不匹配。
const APP_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 从 BrowserRouter 路径解析 /app/:seg 的首段（无则空串）。getPathWithoutSubPath 先剥子路径前缀，兼容子路径部署。
function currentAppSeg() {
  const m = getPathWithoutSubPath(window.location.pathname || '').match(/^\/app\/([^/]+)/);
  return (m && m[1]) || '';
}

// 应用列表/非应用页：URL 在 /app/ 下但首段不是合法 appId（如 /app/my「我的应用」、/app/lib「应用库」）。
// 这类页面不属于任何具体应用，即使本会话已建出 / 续建了某应用，停留在此也应判定为「不在应用下」。
export function isAppListPage() {
  const seg = currentAppSeg();
  return !!seg && !APP_ID_RE.test(seg);
}

// 当前所在应用 id：从 BrowserRouter 路径 /app/:appId/... 解析，仅当首段是合法 appId 时返回。
// /app/my、/app/lib 等列表页首段不是 appId，返回空；没在 /app/ 下（如首页 / 仪表盘）也返回空。
export function getCurrentAppId() {
  const seg = currentAppSeg();
  return APP_ID_RE.test(seg) ? seg : '';
}

function parsedOf(files, path) {
  return files && files[path] && files[path].parsed;
}

function asArray(v) {
  return Array.isArray(v) ? v : [];
}

function isObj(v) {
  return v && typeof v === 'object';
}

// 按 Relation 依赖对 worksheets 做确定性拓扑排序：被引用的表（关联目标）排到引用方前面，
// 保证 build 阶段建表时关联目标表已存在、能内联 Relation 字段（dataSource）到正确布局位置。
// 后端 plan agent 的 system prompt 已要求 worksheets.json 按拓扑序产出，前端这里再做一次确定性兜底，
// 防 LLM 偶发漂移（如为了同 groupName 挨着写而打破拓扑序）。
// 拓扑排序是「数据准备」职责，归调用方（前端）；build agent 只负责按给定顺序执行 + 迭代间累积。
function topoSortWorksheets(worksheets) {
  const byName = new Map();

  for (const ws of worksheets) {
    if (isObj(ws) && ws.name) byName.set(ws.name, ws);
  }

  // 提取某张表依赖的「本批内」目标表名（解析 fields 里的 "(Relation:目标表名)"）。
  // fields 兼容两种产出：数组（逐项 token）或逗号分隔的紧凑字符串；统一拼成一段文本后全局扫描。
  // selfRelation、指向本批外的表、指向自身的，都不算依赖。
  const depsOf = ws => {
    const deps = new Set();
    const raw = Array.isArray(ws.fields)
      ? ws.fields.filter(f => typeof f === 'string').join(', ')
      : typeof ws.fields === 'string'
        ? ws.fields
        : '';
    const re = /\(Relation:([^)]+)\)/g;
    let m;

    while ((m = re.exec(raw))) {
      const target = m[1].trim();

      if (target && target !== ws.name && byName.has(target)) deps.add(target);
    }

    return deps;
  };

  const visited = new Set(); // 已排定
  const inStack = new Set(); // 当前 DFS 路径，用于检测循环依赖
  const result = [];

  // DFS 后序：先递归排定所有依赖（目标表），再排定自己 → 目标表自然落在引用方前面。
  const visit = ws => {
    if (!isObj(ws) || !ws.name || visited.has(ws.name)) return;
    if (inStack.has(ws.name)) return; // 循环依赖（A↔B）：跳过深入，环内表靠 build 的 bidirectional 兜底反向回填

    inStack.add(ws.name);
    for (const dep of depsOf(ws)) visit(byName.get(dep));
    inStack.delete(ws.name);

    visited.add(ws.name);
    result.push(ws);
  };

  // 按原顺序遍历做 tie-break（无依赖关系的表保持 plan 原有相对顺序，稳定排序）；
  // 无 name 的异常元素原样保留，不丢数据。
  for (const ws of worksheets) {
    if (isObj(ws) && ws.name) visit(ws);
    else result.push(ws);
  }

  return result;
}

export function composeAppContext({ files, appName }) {
  // 新 6 文件 schema：worksheets.json + custom-pages.json 各管一个 UI tab，1 file = 1 tab。
  // 旧 app-items.json（混排 worksheet+dashboard+workspace+aiAssistant）已下线，本函数不再读取。
  const worksheetsRaw = asArray(parsedOf(files, '/jsons/worksheets.json'));
  const customPages = asArray(parsedOf(files, '/jsons/custom-pages.json'));
  const customActions = asArray(parsedOf(files, '/jsons/custom-actions.json'));
  const roles = asArray(parsedOf(files, '/jsons/roles.json'));
  const workflows = asArray(parsedOf(files, '/jsons/workflows.json'));
  // plan.md：plan 阶段产出的需求方案 markdown 原文（markdown 文件 parsed 即原始内容），
  // 随 build app stream 的 context 透传（planMarkdown），供 build agent 参考完整方案。
  const planMarkdown = parsedOf(files, '/plan.md');
  // app.json：非 tab 的应用元信息（appIcon/appColor/enableExternalPortal/language），plan 直接产出，build 用同一份。
  const appMeta = parsedOf(files, '/jsons/app.json');
  const appIcon = isObj(appMeta) ? appMeta.appIcon : undefined;
  const appColor = isObj(appMeta) ? appMeta.appColor : undefined;
  // enableExternalPortal：plan 在存在 roleScope=externalPortal 的外部角色时置 true，build 透传给 create_app。
  const enableExternalPortal = isObj(appMeta) ? appMeta.enableExternalPortal : undefined;
  // language：plan 在 app.json 给出的应用语言，build 透传为 appLanguage 供 create_app 设置应用语言。
  const appLanguage = isObj(appMeta) ? appMeta.language : undefined;
  // navGroups：plan 在 app.json 里给出的导航分组呈现排序（覆盖 worksheets + custom-pages 的全部 groupName）。
  // 下面据此对 groupNames 排序，决定 build 建分组（即应用左侧导航）的顺序。
  const navGroups = isObj(appMeta) && Array.isArray(appMeta.navGroups) ? appMeta.navGroups : [];
  // 按 Relation 依赖拓扑排序，纠正 plan 可能的乱序，保证关联目标表先于引用方建出。
  // worksheets.json 后端已按拓扑序产出，这里仍做一次确定性兜底防漂移。
  const worksheets = topoSortWorksheets(worksheetsRaw.filter(i => isObj(i) && i.type === 'worksheet'));
  // custom-pages.json 现含 dashboard / workspace 两种 type（aiAssistant 已拆到独立文件），分两路透传给 build agent。
  const dashboards = customPages.filter(i => isObj(i) && i.type === 'dashboard');
  const workspaces = customPages.filter(i => isObj(i) && i.type === 'workspace');
  // aiAssistant 独立成 /jsons/ai-assistants.json（7 文件 schema）→ build-app step-create-chatbots。
  // 兼容历史 6 文件 plan：旧 plan 无该文件、aiAssistant 仍混在 custom-pages.json，回退按 type 过滤。
  const aiAssistantsFile = asArray(parsedOf(files, '/jsons/ai-assistants.json'));
  const aiAssistants = aiAssistantsFile.length
    ? aiAssistantsFile.filter(isObj)
    : customPages.filter(i => isObj(i) && i.type === 'aiAssistant');
  // 实际用到的 groupName 集合：合并两文件、按首次出现去重（worksheets 在前）。仅作为"存在性"判断
  // 与 navGroups 漏写时的兜底序，导航排序本身交给下面的 navGroups。
  const usedGroups = [];
  const used = new Set();

  // 含 aiAssistants：AI助手 已独立成文件，其 groupName 也要纳入导航分组存在性判断，避免 AI助手-only 分组被漏建。
  for (const item of [...worksheetsRaw, ...customPages, ...aiAssistants]) {
    const g = isObj(item) ? item.groupName : '';

    if (g && !used.has(g)) {
      used.add(g);
      usedGroups.push(g);
    }
  }

  // 导航排序以 app.json.navGroups 为准：先按 navGroups 顺序取出确实存在的分组，
  // 再把 navGroups 漏写的分组按其首次出现顺序兜底追加到末尾——保证不丢分组、且 plan 指定的顺序生效。
  const groupNames = [];
  const placed = new Set();

  for (const g of navGroups) {
    if (typeof g === 'string' && used.has(g) && !placed.has(g)) {
      placed.add(g);
      groupNames.push(g);
    }
  }

  for (const g of usedGroups) {
    if (!placed.has(g)) {
      placed.add(g);
      groupNames.push(g);
    }
  }

  return {
    appName,
    appIcon,
    appColor,
    enableExternalPortal,
    appLanguage,
    worksheets,
    dashboards,
    workspaces,
    aiAssistants,
    groupNames,
    customActions,
    roles,
    workflows,
    // plan 方案原文：有内容才带，避免空串污染 context
    ...(planMarkdown ? { planMarkdown } : {}),
  };
}

// 只在以下情况认为 context "有值"：plan 阶段已有任意一份产出，或者用户至少给了 appName
export function hasMeaningfulContext(context) {
  if (!context) return false;
  if (context.appName) return true;
  // plan.md 原文也是 plan 阶段产出，存在即视为有值，保证 planMarkdown 不被整体丢弃
  if (context.planMarkdown) return true;
  return [
    'worksheets',
    'dashboards',
    'workspaces',
    'aiAssistants',
    'groupNames',
    'customActions',
    'roles',
    'workflows',
  ].some(k => Array.isArray(context[k]) && context[k].length > 0);
}
