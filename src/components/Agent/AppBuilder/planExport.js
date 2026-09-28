// 搭建方案导出 —— 把 plan 的全部产物（plan.md + 各 tab JSON）拼成一份 markdown 说明书。
// 结构对齐《应用搭建计划导出模板》：头部信息 → 应用概览（plan.md 原文，标题降级）→ 详细设计
// （角色 / 工作表 / 自定义页面 / 自定义动作 / 自动化工作流 / AI 助手，按实际有数据的模块顺序编号）。
//
// 纯函数模块：不碰 DOM、不读组件 state，时间由调用方传入，方便测试与复用。
import moment from 'moment';
import { parseCompactList, parseCompactStr } from './panels/compactValue';

// 类型 → 中文名的映射一律放在函数工厂里生成：语言包可能晚于本模块加载，
// 模块顶层固化 _l() 结果会导致切换语言后拿到旧文案。
function getFieldTypeLabels() {
  return {
    Text: _l('文本'),
    Number: _l('数值'),
    Currency: _l('金额'),
    DateTime: _l('日期时间'),
    Date: _l('日期'),
    Time: _l('时间'),
    SingleSelect: _l('单选'),
    MultipleSelect: _l('多选'),
    Checkbox: _l('检查框'),
    Email: _l('邮箱'),
    PhoneNumber: _l('电话'),
    Region: _l('地区'),
    Attachment: _l('附件'),
    RichText: _l('富文本'),
    Relation: _l('关联记录'),
    selfRelation: _l('关联本表'),
    SubTable: _l('子表'),
    Collaborator: _l('人员'),
    Department: _l('部门'),
    AutoNumber: _l('自动编号'),
    Formula: _l('公式'),
    Concatenate: _l('文本组合'),
    Signature: _l('签名'),
    Barcode: _l('条码'),
    Lookup: _l('他表字段'),
    Rollup: _l('汇总'),
    CascadingSelect: _l('级联选择'),
    CustomField: _l('自定义字段'),
  };
}

function getChartTypeLabels() {
  return {
    NumberChart: _l('数值图'),
    BarChart: _l('条形图'),
    ColumnChart: _l('柱状图'),
    LineChart: _l('折线图'),
    AreaChart: _l('面积图'),
    PieChart: _l('饼图'),
    RadarChart: _l('雷达图'),
    FunnelChart: _l('漏斗图'),
    DualAxes: _l('双轴图'),
    ScatterChart: _l('散点图'),
    WordCloudChart: _l('词云图'),
    GaugeChart: _l('仪表图'),
    ProgressChart: _l('进度图'),
    RankingChart: _l('排行榜'),
    TopChart: _l('排行榜'),
    BidirectionalBarChart: _l('对称条形图'),
    PivotTable: _l('交叉表'),
    CountryLayer: _l('地图'),
    WorldMap: _l('世界地图'),
  };
}

function getComponentTypeLabels() {
  return {
    Button: _l('按钮'),
    View: _l('视图'),
    Text: _l('文本'),
    RichText: _l('富文本'),
    Filter: _l('筛选器'),
    FiltersGroup: _l('筛选器'),
    Carousel: _l('轮播图'),
    Image: _l('图片'),
    Embed: _l('嵌入内容'),
    EmbedUrl: _l('嵌入链接'),
    Section: _l('分割线'),
    Tabs: _l('标签页'),
    Card: _l('卡片'),
  };
}

function getItemTypeLabels() {
  return {
    worksheet: _l('工作表'),
    dashboard: _l('仪表盘'),
    workspace: _l('工作台'),
    aiAssistant: _l('AI 助手'),
  };
}

function getActionTypeLabels() {
  return {
    updateCurrentRecord: _l('更新当前记录'),
    createRelatedRecord: _l('新建关联记录'),
    triggerWorkflow: _l('触发工作流'),
  };
}

function getTriggerTypeLabels() {
  return {
    worksheet_event: _l('工作表事件触发'),
    schedule: _l('定时触发'),
    date_field: _l('日期触发'),
    custom_action: _l('自定义动作触发'),
  };
}

// 角色 permissions 的紧凑类型 → 导出行的图标 + 标题；顺序即输出顺序
function getPermissionSections() {
  return [
    { type: 'worksheet', label: `📋 **${_l('工作表')}**` },
    { type: 'customPage', label: `🖥️ **${_l('自定义页面')}**` },
    { type: 'aiAssistant', label: `🤖 **${_l('AI 助手')}**` },
  ];
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readFile(files, path) {
  return (files && files[path]) || {};
}

// 表格单元格里的竖线与换行会破坏 markdown 表格结构
function escapeCell(text) {
  return String(text == null ? '' : text)
    .replace(/\|/g, '\\|')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

function codeSpan(text) {
  return `\`${String(text == null ? '' : text).trim()}\``;
}

// 遍历 / 改写 markdown 行：visit 拿到 (line, heading, index)，heading 只在真标题上有值
// （```/~~~ 代码块内的 # 不算标题）。visit 返回字符串即替换该行，否则保持原样。
function mapLines(markdown, visit) {
  let inFence = false;

  return String(markdown == null ? '' : markdown)
    .split('\n')
    .map((line, index) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return line;
      }

      if (inFence) return line;
      const matched = line.match(/^(#{1,6})(\s+.*)$/);
      const next = visit(line, matched ? { level: matched[1].length, rest: matched[2] } : null, index);

      return typeof next === 'string' ? next : line;
    });
}

// plan.md 首行通常是「XX 应用搭建方案」这类文档标题，与导出文档自身的一级标题重复。
// 并入「应用概览」前剥掉它——仅当它确实是全文唯一的最高级标题时才剥，避免误删正文小节。
export function stripDocTitle(markdown) {
  const source = typeof markdown === 'string' ? markdown : '';

  if (!source.trim()) return '';
  let titleIndex = -1;
  let titleLevel = 0;
  let sameLevelCount = 0;
  let started = false;

  const lines = mapLines(source, (line, heading, index) => {
    if (!started && line.trim()) {
      started = true;
      // 正文开头不是标题 → 没有文档标题可剥
      if (heading) {
        titleIndex = index;
        titleLevel = heading.level;
      }
    }

    if (heading && titleIndex >= 0 && heading.level === titleLevel) sameLevelCount += 1;
  });

  if (titleIndex < 0 || sameLevelCount > 1) return source;
  return lines.slice(titleIndex + 1).join('\n');
}

// 把最小标题级别抬到三级（模板要求一级标题降级为三级），避免与导出文档自身的一、二级标题打架。
export function demoteHeadings(markdown, targetTop = 3) {
  const source = typeof markdown === 'string' ? markdown : '';

  if (!source.trim()) return '';
  let minLevel = 7;

  mapLines(source, (line, heading) => {
    if (heading) minLevel = Math.min(minLevel, heading.level);
  });

  const shift = minLevel > 6 ? 0 : Math.max(0, targetTop - minLevel);

  if (!shift) return source.trim();

  return mapLines(source, (line, heading) =>
    heading ? `${'#'.repeat(Math.min(6, heading.level + shift))}${heading.rest}` : undefined,
  )
    .join('\n')
    .trim();
}

// "Relation:客房:single:bi" → { base: 'Relation', extra: '客房:single:bi' }：
// 类型串以冒号带参数（关联目标表、选项值、筛选字段等），映射中文名要按基础类型查表。
function splitType(type) {
  const [base, ...rest] = String(type || '').split(':');

  return { base: base.trim(), extra: rest.join(':').trim() };
}

// "客户名称(Relation:客户)" → { name, typeLabel, note }：类型映射成中文，冒号后的补充信息进「属性与说明」
function describeField(raw, typeLabels) {
  const { name, type } = parseCompactStr(raw);
  const { base, extra } = splitType(type);
  // 子表（SubTable:预算明细）的参数同样是目标工作表名，与关联字段同口径取第一段
  const isRelation = base === 'Relation' || base === 'selfRelation' || base === 'SubTable';

  return {
    name,
    typeLabel: typeLabels[base] || base || '',
    // 关联类字段的参数形如「客房:single:bi」，只有第一段是目标表，后面是关联方式等内部标记
    note: extra && isRelation ? _l('关联工作表：%0', extra.split(':')[0]) : extra,
  };
}

// 按 groupName 首次出现顺序分组（与 panel 渲染同口径）
function groupByName(items) {
  const groups = [];
  const map = new Map();

  items.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const key = item.groupName || item.group || '';

    if (!map.has(key)) {
      const group = { name: key, items: [] };

      map.set(key, group);
      groups.push(group);
    }

    map.get(key).items.push(item);
  });
  return groups;
}

function itemName(item) {
  if (!item || typeof item !== 'object') return '';
  return item.name || item.title || item.worksheetName || item.dashboardName || item.assistantName || '';
}

// `步骤A`  ➔  `步骤B`：自定义动作与工作流共用的流程步骤行
function renderSteps(steps) {
  const list = steps.filter(Boolean).map(codeSpan);

  if (!list.length) return [];
  return ['', `**⚡️${_l('流程步骤')}**`, '', list.join('  ➔  ')];
}

function renderRoles(roles, order) {
  const lines = [`## ${order}. ${_l('角色')}`];
  const sections = getPermissionSections();

  roles.forEach((role, index) => {
    const name = role.name || role.roleName || _l('（未命名）');
    const external = role.roleScope === 'externalPortal' ? ` \`[${_l('外部门户')}]\`` : '';

    lines.push('', `### ${order}.${index + 1} ${name}${external}`);
    if (role.description) lines.push(`>  **${_l('描述')}**：${role.description}`);

    const perms = asArray(role.permissions).map(parseCompactStr);
    const permLines = sections
      .map(section => {
        const names = perms.filter(p => p.type === section.type).map(p => codeSpan(p.name));

        return names.length ? `   - ${section.label}：${names.join(' ｜ ')}` : '';
      })
      .filter(Boolean);

    if (permLines.length) lines.push(`-  **${_l('可访问应用项')}**：`, ...permLines);
  });

  return lines;
}

function renderWorksheets(worksheets, order, actionsByWorksheet) {
  const lines = [`## ${order}. ${_l('工作表')}`];
  const typeLabels = getFieldTypeLabels();
  let seq = 0;

  groupByName(worksheets).forEach(group => {
    if (group.name) lines.push('', `#### ${_l('分组：%0', group.name)}`);

    group.items.forEach(item => {
      const name = itemName(item);

      if (!name) return;
      seq += 1;
      lines.push('', `### ${order}.${seq} ${name}`);
      if (item.description) lines.push('', `>  **${_l('描述')}**：${item.description}`);

      const fields = parseCompactList(item.fields).map(f => describeField(f, typeLabels));

      if (fields.length) {
        lines.push(
          '',
          `-  **📋${_l('字段清单')}**：`,
          '',
          `| ${_l('字段名称')} | ${_l('字段类型')} | ${_l('属性与说明')} |`,
          '| :--- | :--- | :--- |',
          ...fields.map(f => `| ${escapeCell(f.name)} | ${escapeCell(f.typeLabel)} | ${escapeCell(f.note)} |`),
        );
      }

      const views = parseCompactList(item.views).map(v => codeSpan(parseCompactStr(v).name));

      if (views.length) lines.push('', `-  **👁️${_l('视图')}**：${views.join(' | ')}`);

      const actions = (actionsByWorksheet[name] || []).map(codeSpan);

      if (actions.length) lines.push(`-  **📌${_l('自定义动作')}**：${actions.join(' | ')}`);
    });
  });

  return lines;
}

function renderPages(pages, order, title) {
  const lines = [`## ${order}. ${title}`];
  const chartLabels = getChartTypeLabels();
  const componentLabels = getComponentTypeLabels();
  const typeLabels = getItemTypeLabels();
  let seq = 0;

  groupByName(pages).forEach(group => {
    if (group.name) lines.push('', `#### ${_l('分组：%0', group.name)}`);

    group.items.forEach(item => {
      const name = itemName(item);

      if (!name) return;
      seq += 1;
      const typeLabel = typeLabels[item.type];

      lines.push('', `### ${order}.${seq} ${name}${typeLabel ? ` \`[${typeLabel}]\`` : ''}`);
      if (item.description) lines.push('', `>  **${_l('描述')}**：${item.description}`);

      // 仪表盘给 charts、工作台给 components；工作台组件也可能是统计图表，两张表都查
      const parts = [...parseCompactList(item.charts), ...parseCompactList(item.components)];

      if (parts.length) {
        lines.push('', `-  **📊${_l('图表与组件')}**：`);
        parts.forEach(raw => {
          const { name: partName, type } = parseCompactStr(raw);
          const { base, extra } = splitType(type);
          // 组件类型可带参数（如筛选器的字段列表），基础类型映射中文后把参数附在括号里
          const label = chartLabels[base] || componentLabels[base] || base;
          const suffix = [label, extra].filter(Boolean).join('：');

          lines.push(`    -  ${codeSpan(partName)}${suffix ? ` (${suffix})` : ''}`);
        });
      }
    });
  });

  return lines;
}

function renderCustomActions(groups, order) {
  const lines = [`## ${order}. ${_l('自定义动作')}`];
  const typeLabels = getActionTypeLabels();
  let seq = 0;

  groups.forEach(group => {
    const actions = asArray(group && group.actions);

    if (!actions.length) return;
    if (group.worksheet) lines.push('', `#### ${_l('工作表：%0', group.worksheet)}`);

    actions.forEach(action => {
      const name = action.name || _l('（未命名）');
      const typeLabel = typeLabels[action.type] || action.type || '';

      seq += 1;
      lines.push('', `### ${order}.${seq} ${name}${typeLabel ? `  \`[${typeLabel}]\`` : ''}`);
      if (action.description) lines.push('', `> **${_l('描述')}**：${action.description}`);
      if (action.type !== 'triggerWorkflow' && action.targetWorksheet) {
        lines.push('', `-  **${_l('目标表')}**：${codeSpan(action.targetWorksheet)}`);
      }

      // 触发工作流的动作自身即流程起点，后面接 intentHints（与 panel 的箭头链一致）
      if (action.type === 'triggerWorkflow') {
        const hints = asArray(action.intentHints).map(h => (h && h.label) || '');

        lines.push(...renderSteps([name, ...hints]));
      }
    });
  });

  return lines;
}

function renderWorkflows(workflows, order) {
  const lines = [`## ${order}. ${_l('自动化工作流')}`];
  const typeLabels = getTriggerTypeLabels();

  workflows.forEach((wf, index) => {
    const trigger = wf.trigger || {};
    const typeLabel = typeLabels[trigger.type] || trigger.type || '';
    const name = wf.name || _l('（未命名）');

    lines.push('', `### ${order}.${index + 1} ${name}${typeLabel ? ` \`[${typeLabel}]\`` : ''}`);
    if (wf.description) lines.push('', `>  **${_l('描述')}**：${wf.description}`);

    // 触发步：工作表事件 / 日期触发拼「来源 · 说明」，定时触发只有说明（与 panel 同口径）
    const triggerText =
      (trigger.type === 'worksheet_event' || trigger.type === 'date_field') && trigger.source
        ? `${trigger.source} · ${trigger.label || ''}`
        : trigger.label || typeLabel;
    const hints = asArray(wf.intentHints).map(h => (h && h.label) || '');

    lines.push(...renderSteps([triggerText, ...hints]));
  });

  return lines;
}

function renderAiAssistants(assistants, order) {
  const lines = [`## ${order}. ${_l('AI 助手')}`];
  let seq = 0;

  assistants.forEach(item => {
    const name = itemName(item);

    if (!name) return;
    seq += 1;
    lines.push('', `### ${order}.${seq} ${name} \`[${_l('AI 助手')}]\``);
    if (item.description) lines.push('', `>  **${_l('描述')}**：${item.description}`);
  });

  return lines;
}

/**
 * 按导出模板拼装完整方案 markdown。
 * @param {object} params.files      AppBuilder 的 file store（path → { content, parsed }）
 * @param {string} params.appName    应用名称
 * @param {number} params.estimateCredits 预估消耗信用点；无值时不输出该行
 * @param {Date}   params.now        导出时间，由调用方传入
 */
export function buildPlanMarkdown({ files, appName, estimateCredits, now } = {}) {
  const name = (appName || '').trim() || _l('未命名应用');
  // plan.md 的文档标题与导出文档标题重复，剥掉后整体降到三级并入「应用概览」
  const overview = demoteHeadings(stripDocTitle(readFile(files, '/plan.md').content));
  const roles = asArray(readFile(files, '/jsons/roles.json').parsed);
  const worksheets = asArray(readFile(files, '/jsons/worksheets.json').parsed);
  const pages = asArray(readFile(files, '/jsons/custom-pages.json').parsed);
  const actionGroups = asArray(readFile(files, '/jsons/custom-actions.json').parsed);
  const workflows = asArray(readFile(files, '/jsons/workflows.json').parsed);
  const aiAssistants = asArray(readFile(files, '/jsons/ai-assistants.json').parsed);

  // 工作表章节要列出该表下的自定义动作：先按工作表名归拢一次
  const actionsByWorksheet = {};

  actionGroups.forEach(group => {
    if (!group || !group.worksheet) return;
    actionsByWorksheet[group.worksheet] = asArray(group.actions)
      .map(action => action && action.name)
      .filter(Boolean);
  });

  const head = [`# 📦 ${_l('%0 搭建计划说明书', name)}`, '', `>  **${_l('应用名称')}**：${name}`];

  if (estimateCredits != null) head.push(`>  **${_l('预估消耗')}**：${_l('%0 信用点', estimateCredits)}`);
  head.push(`>  **${_l('导出时间')}**：${moment(now || undefined).format('YYYY-MM-DD HH:mm:ss')}`);

  const sections = [];
  const pushSection = renderer => sections.push(renderer(sections.length + 1));

  if (roles.length) pushSection(order => renderRoles(roles, order));
  if (worksheets.length) pushSection(order => renderWorksheets(worksheets, order, actionsByWorksheet));
  if (pages.length) pushSection(order => renderPages(pages, order, _l('自定义页面')));
  if (actionGroups.length) pushSection(order => renderCustomActions(actionGroups, order));
  if (workflows.length) pushSection(order => renderWorkflows(workflows, order));
  if (aiAssistants.length) pushSection(order => renderAiAssistants(aiAssistants, order));

  const blocks = [head.join('\n')];

  if (overview) blocks.push(`## ${_l('应用概览')}\n\n${overview}`);
  if (sections.length) {
    // 「详细设计」导语与第 1 个模块同属一块，模块之间才用分隔线
    const rendered = sections.map(lines => lines.join('\n').trim());
    const intro = `## ${_l('详细设计')}\n${_l('以下是各模块的详细设计内容清单：')}`;

    blocks.push(`${intro}\n\n${rendered[0]}`, ...rendered.slice(1));
  }

  return `${blocks.join('\n\n---\n\n')}\n`;
}

/**
 * 导出文件名：{{应用名称}}应用搭建方案{{版本}}_{{年月日时分}}.md
 */
export function buildPlanFileName({ appName, versionLabel, now } = {}) {
  // Windows / macOS 文件名非法字符统一去掉，避免下载被浏览器改名或截断
  const name = String(appName || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();
  const version = String(versionLabel || '')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();

  return `${name || _l('未命名应用')}${_l('应用搭建方案')}${version}_${moment(now || undefined).format('YYYYMMDDHHmm')}.md`;
}
