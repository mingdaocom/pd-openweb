import { parse as parsePartial } from 'partial-json';

// 单一登记表：每一行同时定义了 sidebar 入口 + 对应文件（path/type/initial）。
// 没有 file 的行（如 'other'）只参与 sidebar 列表，不进 file store。
// path 与后端 LLM 协议（artifact-file-writing.path）保持一致。
//
// 当前后端 agent：app-plan-builder（artifact name "create_app_plan"），
// 一次产出 6 个文件，对应 6 个 sidebar tab。
// 旧 schema（app-items.json 单文件混排 worksheet+dashboard+workspace+aiAssistant）已下线，
// 现按前端 tab 拆为 worksheets.json + custom-pages.json，1 file = 1 tab 维持流式渲染契约。
export const SIDEBAR_ITEMS = [
  {
    key: 'overview',
    title: _l('总览'),
    icon: 'abstract',
    description: _l('梳理核心需求'),
    file: '/plan.md',
    type: 'markdown',
    initial: '',
  },
  {
    key: 'roles',
    title: _l('角色'),
    icon: 'group',
    description: _l('确定应用参与者'),
    file: '/jsons/roles.json',
    type: 'json',
    initial: [],
  },
  {
    key: 'worksheets',
    title: _l('工作表'),
    icon: 'worksheet',
    description: _l('确定字段和视图'),
    file: '/jsons/worksheets.json',
    type: 'json',
    initial: [],
  },
  {
    key: 'customPages',
    title: _l('自定义页面'),
    icon: 'dashboard',
    description: _l('确定工作台和仪表盘'),
    file: '/jsons/custom-pages.json',
    type: 'json',
    initial: [],
  },
  {
    key: 'customActions',
    title: _l('自定义动作'),
    icon: 'custom_actions',
    description: _l('确定操作按钮'),
    file: '/jsons/custom-actions.json',
    type: 'json',
    initial: [],
  },
  {
    key: 'workflows',
    title: _l('工作流'),
    icon: 'workflow',
    description: _l('确定自动化业务流'),
    file: '/jsons/workflows.json',
    type: 'json',
    initial: [],
  },
  {
    // 「AI助手」独立 tab：与其它 tab 同构（1 文件 = 1 tab），aiAssistant 从 custom-pages.json 拆出单独成文件，
    // 流式时 file path 直接决定 tab，无需虚拟过滤。后端 app-plan-builder 产出此文件（7 文件 schema）。
    key: 'aiAssistants',
    title: _l('AI 助手'),
    icon: 'AI_Agent',
    description: _l('使用AI辅助查询'),
    file: '/jsons/ai-assistants.json',
    type: 'json',
    initial: [],
  },
];

// 非 tab 的应用元信息文件：appName / appIcon / appColor / navGroups，供左上角 Sidebar + 会话卡片
// 渲染应用图标、以及 build 派生导航顺序。不进 SIDEBAR_ITEMS（不产生 tab），但要进 file store 以便流式接收 + 解析。
// object:true —— app.json 本身就是对象，解析时**不**走 unwrapJson 的"脱壳取数组"逻辑（否则它含的数组字段
// 如 navGroups 会被误当成壳里的数组取出，把整份元信息对象压成 navGroups 数组）。
export const META_FILE_ENTRIES = [{ key: 'appMeta', file: '/jsons/app.json', type: 'json', initial: {}, object: true }];

export const FILE_ENTRIES = [...SIDEBAR_ITEMS.filter(item => item.file), ...META_FILE_ENTRIES];

export function entryByPath(path) {
  return FILE_ENTRIES.find(e => e.file === path);
}

export function entryByKey(key) {
  return SIDEBAR_ITEMS.find(e => e.key === key);
}

// LLM 输出的 JSON 习惯外面套一层对象，例如 {"roles": [...]}、{"items": [...]} 等。
// panel 一律按数组渲染，这里统一脱壳：
//  1. 已经是数组直接返回
//  2. 是对象 → 优先按 entry.wrapperKey 或 entry.key 取；找不到再退化到「第一个数组属性」
//  3. 否则原样返回（让 panel 自行判空）
function unwrapJson(entry, raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const wrapperKey = entry.wrapperKey || entry.key;

    if (wrapperKey && Array.isArray(raw[wrapperKey])) return raw[wrapperKey];

    const arrayProp = Object.values(raw).find(v => Array.isArray(v));

    if (arrayProp) return arrayProp;
  }

  return raw;
}

// partial-json 在内容已完整时与原生 JSON.parse 行为一致；半截内容则尽力返回当前已构造的子结构。
// 所以流式 file:delta 与最终 file:write/file:end 共用同一个解析函数，无需区分。
export function parseFile(entry, content) {
  if (!entry) throw new Error('unknown file');
  if (entry.type === 'markdown') return content || '';
  const raw = parsePartial(content);
  // 对象型元信息文件（app.json）：本身是对象、不是"套壳数组"，原样返回，避免 unwrapJson 把含数组字段
  // （navGroups）的对象误脱壳成那个数组。
  if (entry.object) return raw;
  return unwrapJson(entry, raw);
}

export function serializeFile(entry, parsed) {
  if (!entry) return '';
  if (entry.type === 'markdown') return parsed || '';
  return JSON.stringify(parsed, null, 2);
}

export function hasData(file) {
  if (!file) return false;
  const parsed = file.parsed;

  if (typeof parsed === 'string') return parsed.length > 0;
  if (Array.isArray(parsed)) return parsed.length > 0;
  return parsed != null;
}

export function makeInitialFiles() {
  const files = {};

  FILE_ENTRIES.forEach(entry => {
    files[entry.file] = {
      content: serializeFile(entry, entry.initial),
      parsed: entry.initial,
      status: 'idle',
    };
  });
  return files;
}
