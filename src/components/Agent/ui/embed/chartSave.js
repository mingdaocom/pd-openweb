import _ from 'lodash';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import reportConfigAjax from 'src/pages/Statistics/api/reportConfig';
import { canEditApp } from 'src/utils/domain/permission/app';

// 「保存图表」纯逻辑层：把 mingo_embed_data_chart 的 spec._source（create_chart 参数）
// 映射成 /reportConfig/createChart 的请求体，并按接口的信封契约归一化成功 / 失败结果。
// 契约要点（见《创建统计图接口 · 前端对接指南》）：
//   - 成功 { status: 1, data: {...} }；业务失败 { status: 2 | 430001, msg, data? }（HTTP 200）
//   - 未登录是 HTTP 401 且字段名换成 code / message
//   - 故调用侧必须走 customParseResponse 拿原始信封，标准契约解析会把业务失败当成功

// spec.type（语义类型）→ 接口 chartType。rose / heatmap 在 HAP 统计图里没有对应类型，
// 映射不到即视为不可保存（卡片不显示保存入口）。
const SPEC_TYPE_TO_CHART_TYPE = {
  pie: 'pieChart',
  column: 'columnChart',
  bar: 'barChart',
  line: 'lineChart',
  area: 'lineChart', // 面积图在 HAP 是折线图的一种形态，靠 style=area 区分
  funnel: 'funnelChart',
  radar: 'radarChart',
  wordcloud: 'wordCloud',
  scatter: 'scatterChart',
  bullet: 'progressChart',
  dualAxes: 'dualAxisChart',
  statistic: 'numberChart',
  gauge: 'gaugeChart',
};

// 折线类的形态：预览里折线/面积统一走平滑，保存下来的图表保持同一观感。
const SPEC_TYPE_TO_STYLE = { line: 'smooth', area: 'area' };

// 取 _source（agent 随图表一起下发的完整 create_chart 参数）；缺失 / 非对象 → null
function getSource(spec) {
  const source = spec && spec._source;

  return source && typeof source === 'object' && !Array.isArray(source) ? source : null;
}

// 工作表 ID：_source 里两种命名都可能出现（接口用驼峰 worksheetId，MCP 侧历史写法是 worksheet_id）
function getWorksheetId(source) {
  return source.worksheetId || source.worksheet_id || '';
}

// 图表数据源工作表 ID（取表名、拼请求体都用它）
export function getChartWorksheetId(spec) {
  const source = getSource(spec);

  return source ? getWorksheetId(source) : '';
}

// 图表数据源所属应用 ID（「保存到自定义页面」的默认应用）
export function getChartAppId(spec) {
  const source = getSource(spec);

  return (source && source.appId) || '';
}

// 该图表能否保存：带 _source、能定位到工作表、能映射出 chartType 三者都满足
export function canSaveChart(spec) {
  const source = getSource(spec);

  if (!source) return false;

  return !!getWorksheetId(source) && !!(source.chartType || SPEC_TYPE_TO_CHART_TYPE[spec.type]);
}

// 构造 createChart 请求体：以 _source 为主体，补齐接口必填但 _source 未必带的字段（图表名 / 类型 / 数据范围），
// 并把 stack / percent / style 与当前预览效果对齐。customPageId 存在则追加到该自定义页面。
export function buildCreateChartPayload(spec, { customPageId } = {}) {
  const source = getSource(spec);

  if (!source) return null;

  const worksheetId = getWorksheetId(source);
  const chartType = source.chartType || SPEC_TYPE_TO_CHART_TYPE[spec.type];

  if (!worksheetId || !chartType) return null;

  // 去掉下划线写法的键，避免同时出现 worksheet_id / worksheetId 两份
  const rest = _.omit(source, ['worksheet_id']);
  const title = typeof spec.title === 'string' ? spec.title.trim() : '';
  const style = source.style || SPEC_TYPE_TO_STYLE[spec.type];
  const percent = source.percent != null ? source.percent : spec.percent;
  const stack = source.stack != null ? source.stack : spec.stack;

  return {
    ...rest,
    worksheetId,
    chartType,
    chartName: source.chartName || title || _l('未命名图表'),
    // 不传后端会按必填拦下；默认跟随当前用户的数据权限，避免把越权数据存成公共图表
    dataScope: source.dataScope || 'permission',
    // stack / percent 只能二选一，percent 优先（与渲染侧 withSeries 的优先级保持一致）
    ...(percent ? { percent: true } : stack ? { stack: true } : null),
    ...(style ? { style } : null),
    ...(customPageId ? { addToCustomPageId: customPageId } : null),
  };
}

// 业务失败（HTTP 200，status !== 1）的提示文案：msg 为主，校验失败时 data 里是字段错误列表
function businessMessage(res) {
  const msg = (res && res.msg) || '';
  const detail = res && Array.isArray(res.data) && res.data.length ? String(res.data[0]) : '';

  if (msg && detail) return `${msg}（${detail}）`;

  return msg || detail || _l('请稍后重试');
}

// HTTP 失败的提示文案：401 的字段名是 message（不是 msg），其余尽量取后端原文
function httpMessage(response) {
  const data = (response && response.data) || {};

  if (response && response.status === 401) return data.message || _l('账号已退出，请重新登录');

  return data.msg || data.message || _l('请求失败，请稍后重试');
}

// 保存图表。统一返回 { ok, data } / { ok: false, message }，调用侧只管弹 toast。
export async function saveChart(payload) {
  try {
    const res = await reportConfigAjax.createChart(payload, { customParseResponse: true, silent: true });

    if (res && res.status === 1) return { ok: true, data: res.data || {} };

    return { ok: false, message: businessMessage(res) };
  } catch (response) {
    return { ok: false, message: httpMessage(response) };
  }
}

// 「保存到自定义页面」要求对图表所属应用有搭建权限（拥有者 / 管理员 / 开发者），
// 接口侧 addToCustomPageId 也是按应用管理员校验的，所以前端先按同一口径把入口禁掉。
// 一次会话里同一应用可能出现多张图表卡片，两级缓存都按 id 存 Promise，避免重复请求。
const appEditableCache = new Map();
const worksheetAppIdCache = new Map();

// 图表所属应用 ID：优先取 _source.appId；agent 没下发时用数据源工作表反查
function fetchChartAppId(spec) {
  const appId = getChartAppId(spec);

  if (appId) return Promise.resolve(appId);

  const worksheetId = getChartWorksheetId(spec);

  if (!worksheetId) return Promise.resolve('');

  if (!worksheetAppIdCache.has(worksheetId)) {
    worksheetAppIdCache.set(
      worksheetId,
      homeAppAjax
        .getAppSimpleInfo({ workSheetId: worksheetId }, { silent: true })
        .then(res => (res && res.appId) || '')
        .catch(() => ''),
    );
  }

  return worksheetAppIdCache.get(worksheetId);
}

function fetchAppEditable(appId) {
  if (!appId) return Promise.resolve(true);

  if (!appEditableCache.has(appId)) {
    appEditableCache.set(
      appId,
      homeAppAjax
        .getApp({ appId }, { silent: true })
        .then(detail => (detail ? canEditApp(detail.permissionType, detail.isLock) : true))
        .catch(() => true),
    );
  }

  return appEditableCache.get(appId);
}

// 该图表能否「保存到自定义页面」。返回 Promise<boolean>；定位不到应用或请求失败时返回 true
// （不误伤，仍由选择弹窗的应用过滤和接口侧校验兜底）。
export function fetchChartPageSavable(spec) {
  return fetchChartAppId(spec).then(fetchAppEditable);
}

// 菜单文案「保存到工作表（xxx）」用的表名。_source.worksheet_id 可能是别名，查不到就返回空串，
// 由调用侧退化成不带表名的文案（不影响保存本身）。
export function fetchWorksheetName(worksheetId) {
  if (!worksheetId) return Promise.resolve('');

  return worksheetAjax
    .getWorksheetInfo({ worksheetId }, { silent: true })
    .then(res => (res && res.name) || '')
    .catch(() => '');
}
