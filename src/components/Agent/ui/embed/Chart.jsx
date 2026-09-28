import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import styled, { css, keyframes } from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown, Spin } from 'ming-ui/antd-components';
import loadG2Plot from 'src/pages/Statistics/Charts/loadG2Plot';
import { formatFileTimestamp } from 'src/utils/core/date';
import { downloadBlob } from 'src/utils/platform/browser/download';
import { getCurrentProjectId } from '../../buildContext';
import { colors, radii, shadows, spacing, transitions } from '../tokens';
import {
  buildCreateChartPayload,
  canSaveChart,
  fetchChartPageSavable,
  fetchWorksheetName,
  getChartAppId,
  getChartWorksheetId,
  saveChart,
} from './chartSave';
import { useChartSaveEnv } from './chartSaveContext';

// 「保存到自定义页面」直接复用工作表模块的跨应用选择弹窗（worksheetType=1 即自定义页面，
// 内部已按 canEditApp 只列有搭建权限的应用）；点击保存才用到，故懒加载。
const SelectOtherWorksheetDialog = lazy(
  () => import('src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog'),
);

// 无搭建权限时「保存到自定义页面」的置灰样式：不走 antd 的 disabled——disabled 项点不动，
// 就没法在点击时 toast 说明原因，故只做视觉禁用，拦截放在点击回调里
const DISABLED_LABEL_STYLE = { color: colors.textDisabled, cursor: 'not-allowed' };

// 无搭建权限时点「保存到自定义页面」的 toast 文案（语言包可能晚于本模块加载，故不在顶层固化 _l 结果）
function noBuildPermissionTip() {
  return _l('仅应用管理员允许保存');
}

// mingo_embed_data_chart 渲染器：把 app-query-agent / app-data-agent 输出的定量数据图 spec
// （契约见 mingo-embed-data-chart-contract.md）用 @antv/g2plot 渲染成交互式图表。
// 入参 { data, isStreaming }：data 为已解析的 spec 对象，CodeBlock 已保证 JSON 合法且非空。
// 职责边界：agent 只给语义数据（type/title/unit/stack/percent/data/value/target/compare/axes），配色/坐标/交互/主题由本组件 + g2plot 决定。
// 支持 15 种 type：定量图（pie/column/bar/line/area/funnel/rose/radar/wordcloud/heatmap/scatter/bullet/dualAxes）走 g2plot；
// 单值类 statistic 自绘大数卡、gauge 走 g2plot Gauge（按 value/target 算占比）。

// 图表分类色板：与 HAP 统计图表统一的 8 色（产品指定，见《Mingo 生成统计图支持保存》）。
// 数据可视化的分类色不属于主题语义色（--color-success 等），主题变量里没有对应项，故按设计稿固定色值。
const CHART_PALETTE = [
  '#1677FF', // 1. 科技蓝（主色）
  '#00B96B', // 2. 极光绿
  '#FAAD14', // 3. 日暮黄
  '#F5222D', // 4. 薄暮红
  '#13C2C2', // 5. 明青蓝
  '#722ED1', // 6. 酱紫
  '#FA541C', // 7. 火山橙
  '#78909C', // 8. 板岩蓝灰（其他/基线）
];

// data 中是否带系列（多系列图判断用）
function hasSeriesData(spec) {
  return Array.isArray(spec.data) && spec.data.some(d => d && d.series != null);
}

// 百分比堆叠下 y 轴/tooltip 的数值格式（g2plot isPercent 会把 value 归一到 0~1）
function percentText(v) {
  return `${(Number(v) * 100).toFixed(1)}%`;
}

// spec.type → { g2plot 类名, 该类型的字段映射 config 构造器 }（gauge/statistic 在 buildPlot 单独处理，不在此表）。
// 公共约定：data[].category（分类）/ data[].value（纯数字）/ data[].series（系列，视类型可选）。
const PLOT_BUILDERS = {
  pie: spec => ({
    plot: 'Pie',
    config: {
      data: spec.data,
      angleField: 'value',
      colorField: 'category',
      radius: 0.85,
      innerRadius: 0.5,
      // 外侧 spider 标签（名称+占比）；关掉图例避免与标签重复。
      // 关键：默认 layout 是 limit-in-plot(ellipsis)，会按"绘图区"边界把文字裁成省略号；
      // 改成 limit-in-canvas，让标签可延伸到整个画布宽度，不再被提前截断。
      label: { type: 'spider', content: '{name} {percentage}', layout: [{ type: 'limit-in-canvas' }] },
      legend: false,
      interactions: [{ type: 'element-active' }],
    },
  }),
  rose: spec => ({
    plot: 'Rose',
    config: {
      data: spec.data,
      xField: 'category',
      yField: 'value',
      seriesField: 'category',
      radius: 0.9,
      interactions: [{ type: 'element-active' }],
    },
  }),
  column: spec => ({
    plot: 'Column',
    config: withSeries(spec, { data: spec.data, xField: 'category', yField: 'value' }, 'isGroupStack'),
  }),
  bar: spec => ({
    plot: 'Bar',
    config: withSeries(spec, { data: spec.data, xField: 'value', yField: 'category' }, 'isGroupStack'),
  }),
  // 折线/面积统一走平滑曲线（产品约定：不再区分直线形态）
  line: spec => ({
    plot: 'Line',
    config: withSeries(spec, { data: spec.data, xField: 'category', yField: 'value', smooth: true }, 'series'),
  }),
  area: spec => ({
    plot: 'Area',
    config: withSeries(spec, { data: spec.data, xField: 'category', yField: 'value', smooth: true }, 'stack'),
  }),
  // 散点图（相关性分析）：category 作 x、value 作 y；有 series 时按系列着色（Scatter 用 colorField，不是 seriesField）
  scatter: spec => ({
    plot: 'Scatter',
    config: {
      data: spec.data,
      xField: 'category',
      yField: 'value',
      shape: 'circle',
      size: 4,
      pointStyle: { fillOpacity: 0.85 },
      ...(hasSeriesData(spec) ? { colorField: 'series' } : null),
    },
  }),
  funnel: spec => ({
    plot: 'Funnel',
    config: {
      // 漏斗按大→小排序更直观（即使 agent 未排好也兜底）
      data: _.orderBy(spec.data, ['value'], ['desc']),
      xField: 'category',
      yField: 'value',
      legend: false,
    },
  }),
  radar: spec => ({
    plot: 'Radar',
    config: withSeries(
      spec,
      {
        data: spec.data,
        xField: 'category',
        yField: 'value',
        area: { visible: false },
        point: { size: 2 },
      },
      'series',
    ),
  }),
  wordcloud: spec => ({
    plot: 'WordCloud',
    config: {
      data: spec.data,
      wordField: 'category',
      weightField: 'value',
      colorField: 'category',
      wordStyle: { fontFamily: 'PingFang SC', fontSize: [14, 60], rotation: 0 },
    },
  }),
  heatmap: spec => ({
    plot: 'Heatmap',
    // 热力图按 value 连续着色，分类色板数组会被当成色带插值，故不套色板
    palette: false,
    config: {
      data: spec.data,
      xField: 'category',
      yField: 'series', // 契约：heatmap 的 series 作 y 轴
      colorField: 'value',
      label: { style: { fill: colors.textInverse } },
    },
  }),
  // 子弹图（实际 vs 目标）：契约的 { category, value, target } 映射成 g2plot Bullet 的
  // { title, ranges, measures, target }；背景条上限取全局最大值上浮一档，让各条目共用同一标尺可比。
  bullet: spec => {
    const items = spec.data
      .filter(d => d && Number.isFinite(Number(d.value)) && Number.isFinite(Number(d.target)))
      .map(d => ({ title: d.category, value: Number(d.value), target: Number(d.target) }));

    if (!items.length) return null;
    const max = Math.max(...items.map(d => Math.max(d.value, d.target))) * 1.1;

    return {
      plot: 'Bullet',
      // Bullet 的 color 是 { range, measure, target } 结构，吃不了分类色板数组，故自带配色
      palette: false,
      config: {
        data: items.map(d => ({ title: d.title, ranges: [max], measures: [d.value], target: d.target })),
        xField: 'title',
        measureField: 'measures',
        rangeField: 'ranges',
        targetField: 'target',
        // range 用色板末位的板岩蓝灰调透明度作背景槽（亮/暗主题下都不抢视觉）
        color: { range: 'rgba(120, 144, 156, 0.15)', measure: CHART_PALETTE[0], target: CHART_PALETTE[3] },
        xAxis: { line: null },
        yAxis: false,
        legend: false,
      },
    };
  },
  // 双轴图：axes 恰好 2 项（axes[0]=主轴/左、axes[1]=副轴/右），按 series 把扁平 data 拆成两组；
  // 两组各用独立字段名（v0/v1），避免 DualAxes 两根 yField 同名冲突；geom 决定柱/线。
  dualAxes: spec => {
    const axes = Array.isArray(spec.axes) ? spec.axes : [];

    if (axes.length !== 2 || !axes[0] || !axes[1]) return null;
    const pick = (seriesName, key) =>
      spec.data.filter(d => d && d.series === seriesName).map(d => ({ category: d.category, [key]: d.value }));
    const left = pick(axes[0].series, 'v0');
    const right = pick(axes[1].series, 'v1');

    if (!left.length || !right.length) return null;
    const geom = g => (g === 'line' ? 'line' : 'column');

    // 逐轴配色 + 折线走平滑（DualAxes 的配色/形态只认 geometryOptions，顶层 color 数组无效）
    const geomOption = (axis, color) => {
      const geometry = geom(axis.geom);

      return { geometry, color, ...(geometry === 'line' ? { smooth: true } : null) };
    };

    return {
      plot: 'DualAxes',
      palette: false,
      config: {
        data: [left, right],
        xField: 'category',
        yField: ['v0', 'v1'],
        geometryOptions: [geomOption(axes[0], CHART_PALETTE[0]), geomOption(axes[1], CHART_PALETTE[1])],
        // v0/v1 是内部字段，用 meta.alias 映射回可读的 series 名（图例/tooltip 展示）
        meta: { v0: { alias: axes[0].series }, v1: { alias: axes[1].series } },
      },
    };
  },
};

// 多系列处理：
//   'isGroupStack'（柱/条）：有 series → seriesField + isStack(stack:true) / isGroup(默认分组)
//   'stack'（面积）：有 series → seriesField + isStack(stack:true)
//   'series'（折线/雷达）：有 series → seriesField
// percent（百分比堆叠，柱/条/面积）：g2plot 要求与 isStack 同开，优先级高于 stack；
// 归一后的 value 是 0~1 比例，故同时把 y 轴与 tooltip 换成百分比格式（单位 unit 此时无意义）。
function withSeries(spec, base, mode) {
  if (!hasSeriesData(spec)) return base;

  const next = { ...base, seriesField: 'series' };
  const stackable = mode === 'isGroupStack' || mode === 'stack';

  if (stackable && spec.percent) {
    next.isStack = true;
    next.isPercent = true;
    next.yAxis = { label: { formatter: v => percentText(v) } };
    next.tooltip = { formatter: d => ({ name: d.series || d.category, value: percentText(d.value) }) };
  } else if (stackable && spec.stack) {
    next.isStack = true;
  } else if (mode === 'isGroupStack') {
    next.isGroup = true;
  }

  return next;
}

// 校验 + 构造 g2plot 配置；spec 不合法 / 空 data / 未知 type → null（交由上层优雅降级，不渲染）。
function buildPlot(spec) {
  if (!spec || typeof spec !== 'object') return null;
  const unit = typeof spec.unit === 'string' ? spec.unit.trim() : '';

  // 指标卡：单值（不依赖 data），交给自绘大数卡 StatisticCard
  if (spec.type === 'statistic') {
    return Number.isFinite(Number(spec.value)) ? { kind: 'statistic' } : null;
  }

  // 仪表盘：按 value/target 算占比并钳到 0~1（防越界 >1 / 除零 target<=0），不依赖 data
  if (spec.type === 'gauge') {
    const value = Number(spec.value);
    const target = Number(spec.target);

    if (!Number.isFinite(value) || !Number.isFinite(target) || target <= 0) return null;
    const percent = Math.max(0, Math.min(1, value / target));

    return {
      kind: 'g2plot',
      plot: 'Gauge',
      config: {
        autoFit: true,
        animation: false,
        percent,
        statistic: {
          content: { style: { fontSize: '28px', fontWeight: 600 }, formatter: () => `${Math.round(percent * 100)}%` },
        },
      },
    };
  }

  const builder = PLOT_BUILDERS[spec.type];

  if (!builder) return null;
  if (!Array.isArray(spec.data) || !spec.data.length) return null;

  const built = builder(spec);

  if (!built) return null; // dualAxes 等内部校验失败 → 降级不渲染

  return {
    kind: 'g2plot',
    plot: built.plot,
    config: {
      autoFit: true,
      appendPadding: [16, 24, 16, 24],
      animation: false,
      // 与 HAP 统计图表统一的分类色板；连续着色 / 自带配色结构的类型（heatmap、bullet、dualAxes）标了 palette:false 跳过
      ...(built.palette === false ? null : { color: CHART_PALETTE }),
      // 单位拼到 tooltip：data[].value 恒为数值字段，name 优先系列名再分类名。
      // dualAxes 数据按 v0/v1 拆分、bullet 用 measures/target，都没有统一的 value 字段，走 g2plot 默认 tooltip。
      ...(unit && !_.includes(['dualAxes', 'bullet'], spec.type)
        ? {
            tooltip: {
              formatter: d => ({ name: d.series || d.category, value: `${d.value}${unit}` }),
            },
          }
        : null),
      // built.config 放最后：percent 的百分比 tooltip / yAxis 需要盖掉上面的 unit formatter
      ...built.config,
    },
  };
}

const Wrap = styled.div`
  position: relative;
  margin: ${spacing.md} 0;
  padding: ${spacing.section} ${spacing.section} ${spacing.xl};
  border: 1px solid ${colors.border};
  border-radius: ${radii.card};
  background: ${colors.background};

  &:hover .chart-toolbar {
    opacity: 1;
  }
`;

const Title = styled.div`
  margin-bottom: ${spacing.xl};
  color: ${colors.text};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
`;

const Canvas = styled.div`
  width: 100%;
  height: 340px;
`;

const Toolbar = styled.div`
  position: absolute;
  top: ${spacing.lg};
  right: ${spacing.lg};
  display: flex;
  gap: ${spacing.sm};
  opacity: 0;
  transition: opacity ${transitions.hover};
`;

const ToolBtn = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.border};
  border-radius: ${radii.item};
  background: ${colors.background};
  color: ${colors.textMuted};
  cursor: pointer;
  transition:
    background ${transitions.hover},
    color ${transitions.hover};

  &:hover {
    background: ${colors.backgroundHover};
    color: ${colors.text};
  }

  .icon {
    font-size: 16px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
`;

const FullscreenBox = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 86vw;
  height: 84vh;
  background: ${colors.background};
  border-radius: ${radii.card};
  box-shadow: ${shadows.floating};
  overflow: hidden;
`;

const FullscreenHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  padding: ${spacing.xl} ${spacing.section};
  flex-shrink: 0;
`;

const FullscreenTitle = styled.div`
  color: ${colors.text};
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
`;

const FullscreenCanvas = styled.div`
  flex: 1;
  min-height: 0;
  padding: 0 ${spacing.section} ${spacing.section};
`;

// 导出 PNG：g2plot 默认 canvas renderer，直接抓容器里的 <canvas> 合成到铺底色的画布再 toBlob 下载，
// 避免透明背景；底色取卡片实际背景（亮/暗主题自动适配），取不到时回退白色。
function downloadChartPng(canvasContainer, bgSource, filename) {
  const canvas = canvasContainer && canvasContainer.querySelector('canvas');

  if (!canvas) return;
  const out = document.createElement('canvas');

  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  const bg = (bgSource && getComputedStyle(bgSource).backgroundColor) || '';

  ctx.fillStyle = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' ? bg : '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0);
  out.toBlob(blob => {
    downloadBlob(blob, filename);
  }, 'image/png');
}

// 暗色主题：从最近的 [data-theme='dark'] 祖先判定（与 embed 卡片同一套主题切换），传给 g2plot theme。
function resolveTheme(el) {
  return el && el.closest && el.closest('[data-theme="dark"]') ? 'dark' : 'default';
}

// 指标卡（statistic）：g2plot 无对应 Plot，自绘大数卡——大号数值 + 单位 +（可选）同比/环比升降。
const StatWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  padding: ${spacing.md} 0 ${spacing.sm};

  .value {
    color: ${colors.text};
    font-size: 36px;
    font-weight: 700;
    line-height: 1.1;
    word-break: break-all;
  }

  .unit {
    margin-left: 4px;
    font-size: 16px;
    font-weight: 500;
    color: ${colors.textMuted};
  }

  .compare {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    line-height: 20px;
    color: ${colors.textMuted};
  }

  .delta {
    font-weight: 600;
    color: ${({ $up }) => ($up ? colors.success : colors.error)};
  }
`;

function StatisticCard({ spec }) {
  const value = Number(spec.value);
  const unit = typeof spec.unit === 'string' ? spec.unit.trim() : '';
  const cmp = spec.compare;
  const hasCompare = cmp && typeof cmp === 'object' && Number.isFinite(Number(cmp.delta));
  const delta = hasCompare ? Number(cmp.delta) : 0;
  const up = delta >= 0;

  return (
    <StatWrap $up={up}>
      <div className="value">
        {value.toLocaleString()}
        {unit ? <span className="unit">{unit}</span> : null}
      </div>
      {hasCompare && (
        <div className="compare">
          {cmp.label ? <span className="label">{cmp.label}</span> : null}
          <span className="delta">
            {up ? '↑' : '↓'} {Math.abs(delta * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </StatWrap>
  );
}

// 图表占位 loading：流式期间一旦确定是 chart 围栏（但 JSON 还没流完 / spec 还不可渲染），
// 先展示一张「柱状骨架 + 微光」占位卡，避免裸 JSON 闪现，提示「图表即将到来」。
const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const shimmerBg = css`
  background: linear-gradient(
    90deg,
    ${colors.backgroundMuted} 25%,
    ${colors.backgroundHover} 37%,
    ${colors.backgroundMuted} 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const SkeletonWrap = styled.div`
  margin: ${spacing.md} 0;
  padding: ${spacing.section} ${spacing.section} ${spacing.xl};
  border: 1px solid ${colors.border};
  border-radius: ${radii.card};
  background: ${colors.background};
`;

const SkeletonTitle = styled.div`
  width: 120px;
  height: 14px;
  margin-bottom: ${spacing.xl};
  border-radius: 4px;
  ${shimmerBg}
`;

const SkeletonBars = styled.div`
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 14px;
`;

const SkeletonBar = styled.div`
  flex: 1;
  height: ${p => p.$h};
  border-radius: 6px 6px 0 0;
  ${shimmerBg}
`;

const SkeletonHint = styled.div`
  margin-top: ${spacing.md};
  color: ${colors.textMuted};
  font-size: 12px;
  line-height: 18px;
`;

// 柱状骨架高度（模块级常量，避免每次渲染重建）
const SKELETON_BAR_HEIGHTS = ['46%', '72%', '58%', '88%', '64%', '40%'];

export function ChartSkeleton() {
  return (
    <SkeletonWrap aria-busy="true">
      <SkeletonTitle />
      <SkeletonBars>
        {SKELETON_BAR_HEIGHTS.map((h, i) => (
          <SkeletonBar key={i} $h={h} />
        ))}
      </SkeletonBars>
      <SkeletonHint>{_l('图表生成中...')}</SkeletonHint>
    </SkeletonWrap>
  );
}

export function Chart({ data: spec, isStreaming }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const plotRef = useRef(null);
  const plotTypeRef = useRef(null);
  const timerRef = useRef(null);
  const fullscreenBoxRef = useRef(null);
  const fullscreenCanvasRef = useRef(null);
  const mountedRef = useRef(true);
  // 保存中的目标（'worksheet' | 'page'），ref 与 state 并存：菜单的受控开合要在事件里同步读到最新值
  const savingRef = useRef('');
  const worksheetNameLoadedRef = useRef(false);
  // g2plot 配置在渲染期直接从 spec 派生（buildPlot 是纯函数），卡片态与全屏态共用同一份
  const built = useMemo(() => buildPlot(spec), [spec]);
  const renderable = !!built;
  const [fullscreen, setFullscreen] = useState(false);
  // 保存菜单展开位置：'' | 'card' | 'fullscreen'（卡片与全屏各有一套工具栏，共用一份状态会同时展开）
  const [openMenu, setOpenMenu] = useState('');
  const [saving, setSaving] = useState('');
  const [worksheetName, setWorksheetName] = useState('');
  // 对图表所属应用是否有搭建权限：null 表示还没查（菜单首次展开时懒查，点击「保存到自定义页面」时消费）
  const [pageEditable, setPageEditable] = useState(null);
  const [pageDialogVisible, setPageDialogVisible] = useState(false);
  // 选择弹窗要按组织列应用；context 没给就在打开弹窗时兜底取当前组织（读全局，不能放在渲染期）
  const [dialogProjectId, setDialogProjectId] = useState('');
  const { canSave: envCanSave, projectId } = useChartSaveEnv();

  const title = spec && typeof spec.title === 'string' ? spec.title.trim() : '';
  // 保存入口：环境允许（登录态对话，非分享/嵌入只读）+ 流式结束 + spec 带可用的 _source
  // （没有 _source 就拼不出 createChart 请求体，直接不给入口，避免点了必然失败）
  const savable = envCanSave && !isStreaming && canSaveChart(spec);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!built) return undefined;

    let cancelled = false;

    const doRender = () => {
      const el = canvasRef.current;

      if (cancelled || !el) return;

      loadG2Plot()
        .then(g2 => {
          if (cancelled || !canvasRef.current) return;
          const Plot = g2[built.plot];

          if (!Plot) return;
          const config = { ...built.config, theme: resolveTheme(canvasRef.current) };

          // 图表类型变化（如流式中途 type 改变）：销毁旧实例，避免 update 跨类型配置不匹配
          if (plotRef.current && plotTypeRef.current !== built.plot) {
            try {
              plotRef.current.destroy();
            } catch {
              /* noop */
            }

            plotRef.current = null;
          }

          // 已有同类型实例：仅 update 复用，避免重建闪动；g2plot 内部 diff
          if (plotRef.current) {
            plotRef.current.update(config);
          } else {
            plotRef.current = new Plot(canvasRef.current, config);
            plotTypeRef.current = built.plot;
            plotRef.current.render();
          }
        })
        .catch(() => {
          // 流式半包 / g2plot 渲染异常：静默忽略，保留上一帧（参考 MermaidBlock）
        });
    };

    // 流式期间防抖，避免每帧 spec 变化都重渲染
    if (isStreaming) timerRef.current = setTimeout(doRender, 400);
    else doRender();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [built, isStreaming]);

  // 卸载时销毁实例，释放 canvas / 事件
  useEffect(() => {
    return () => {
      if (plotRef.current) {
        try {
          plotRef.current.destroy();
        } catch {
          /* noop */
        }

        plotRef.current = null;
      }
    };
  }, []);

  // 全屏：另起一个独立 g2plot 实例渲染到弹层容器（复用同一份 config），关闭时销毁
  useEffect(() => {
    if (!fullscreen || !built) return undefined;

    let cancelled = false;
    let instance = null;

    loadG2Plot()
      .then(g2 => {
        if (cancelled || !fullscreenCanvasRef.current) return;
        const Plot = g2[built.plot];

        if (!Plot) return;
        instance = new Plot(fullscreenCanvasRef.current, {
          ...built.config,
          theme: resolveTheme(fullscreenCanvasRef.current),
        });
        instance.render();
      })
      .catch(() => {
        /* noop */
      });

    return () => {
      cancelled = true;
      if (instance) {
        try {
          instance.destroy();
        } catch {
          /* noop */
        }
      }
    };
  }, [fullscreen, built]);

  // Esc 关闭全屏
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') setFullscreen(false);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // 保存菜单开合：保存中不允许收起（要在菜单里显示行内 loading）；
  // 首次展开时懒查菜单要用的数据——工作表名（菜单文案）与所属应用的搭建权限（点「保存到自定义页面」时判断）
  function handleMenuOpenChange(scope, open) {
    if (!open && savingRef.current) return;
    setOpenMenu(open ? scope : '');

    if (!open || worksheetNameLoadedRef.current) return;
    worksheetNameLoadedRef.current = true;
    fetchWorksheetName(getChartWorksheetId(spec)).then(name => {
      if (mountedRef.current) setWorksheetName(name);
    });
    fetchChartPageSavable(spec).then(editable => {
      if (mountedRef.current) setPageEditable(editable);
    });
  }

  // 保存图表。kind 仅用于标记 loading 位置；customPageId 存在即保存到自定义页面
  async function runSave(kind, customPageId) {
    const payload = buildCreateChartPayload(spec, { customPageId });

    if (!payload) {
      alert(_l('图表配置解析失败'), 3);
      return false;
    }

    savingRef.current = kind;
    setSaving(kind);

    const res = await saveChart(payload);

    savingRef.current = '';
    if (!mountedRef.current) return res.ok;
    setSaving('');

    if (res.ok) {
      alert(_l('保存成功'));
      return true;
    }

    alert(_l('保存失败，%0', res.message), 2);
    return false;
  }

  async function handleSaveMenuClick(key) {
    if (savingRef.current) return;

    if (key === 'page') {
      // 无应用搭建权限（拥有者 / 管理员 / 开发者）不给保存，点击时 toast 说明原因。
      // 菜单展开时已预取，pageEditable 还是 null 说明请求未回，兜底再取一次（命中缓存，通常无额外请求）
      const editable = pageEditable === null ? await fetchChartPageSavable(spec) : pageEditable;

      if (mountedRef.current) setPageEditable(editable);

      if (!editable) {
        setOpenMenu('');
        alert(noBuildPermissionTip(), 3);
        return;
      }

      setOpenMenu('');
      setDialogProjectId(projectId || getCurrentProjectId());
      // 选择弹窗层级低于全屏遮罩，先退出全屏再开
      setFullscreen(false);
      setPageDialogVisible(true);
      return;
    }

    const ok = await runSave('worksheet');

    if (ok && mountedRef.current) setOpenMenu('');
  }

  // 选择弹窗点确定即自行关闭（onOk 内部会调 onHide），保存进行中的反馈落在工具栏按钮上
  function handleConfirmSaveToPage(_appId, customPageId) {
    runSave('page', customPageId);
  }

  // 保存入口（卡片工具栏与全屏工具栏各渲染一份，scope 用于区分展开的是哪一处菜单）
  function renderSaveEntry(scope) {
    if (!savable) return null;

    const items = [
      {
        key: 'worksheet',
        disabled: !!saving,
        icon: saving === 'worksheet' ? <Spin size="small" /> : null,
        label: worksheetName ? _l('保存到工作表（%0）', worksheetName) : _l('保存到工作表'),
      },
      {
        key: 'page',
        disabled: !!saving,
        label:
          pageEditable === false ? (
            <span style={DISABLED_LABEL_STYLE}>{_l('保存到自定义页面')}</span>
          ) : (
            _l('保存到自定义页面')
          ),
      },
    ];

    return (
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        open={openMenu === scope}
        menu={{ items, onClick: ({ key }) => handleSaveMenuClick(key) }}
        // 全屏遮罩 z-index 高于浮层默认层级，菜单挂到全屏容器内才不会被盖住
        {...(scope === 'fullscreen' ? { getPopupContainer: () => fullscreenBoxRef.current || document.body } : null)}
        onOpenChange={open => handleMenuOpenChange(scope, open)}
      >
        <ToolBtn type="button" title={_l('保存')}>
          {saving ? <Spin size="small" /> : <Icon icon="save" />}
        </ToolBtn>
      </Dropdown>
    );
  }

  // spec 还不可渲染：流式期间（JSON 已合法但 spec 字段还没补全）先占位 loading；非流式则降级不渲染
  if (!renderable) return isStreaming ? <ChartSkeleton /> : null;

  // statistic：自绘单值卡，无 canvas，不提供下载/全屏（抓不到 canvas 也无意义）
  const isStatistic = spec.type === 'statistic';
  // 下载时现取时间戳，文件名形如 运营总览_250616143022.png
  const makeFilename = () => `${title || 'chart'}_${formatFileTimestamp()}.png`;

  return (
    <>
      <Wrap ref={wrapRef}>
        {title && <Title>{title}</Title>}
        {isStatistic ? (
          <>
            <StatisticCard spec={spec} />
            {savable && <Toolbar className="chart-toolbar">{renderSaveEntry('card')}</Toolbar>}
          </>
        ) : (
          <>
            <Canvas ref={canvasRef} />
            <Toolbar className="chart-toolbar">
              {renderSaveEntry('card')}
              <ToolBtn
                type="button"
                title={_l('下载 PNG')}
                onClick={() => downloadChartPng(canvasRef.current, wrapRef.current, makeFilename())}
              >
                <Icon icon="download" />
              </ToolBtn>
              <ToolBtn type="button" title={_l('全屏查看')} onClick={() => setFullscreen(true)}>
                <Icon icon="fullscreen" />
              </ToolBtn>
            </Toolbar>
          </>
        )}
      </Wrap>
      {fullscreen &&
        createPortal(
          <Overlay onClick={() => setFullscreen(false)}>
            <FullscreenBox ref={fullscreenBoxRef} onClick={e => e.stopPropagation()}>
              <FullscreenHeader>
                <FullscreenTitle>{title}</FullscreenTitle>
                <Toolbar className="chart-toolbar" style={{ position: 'static', opacity: 1 }}>
                  {renderSaveEntry('fullscreen')}
                  <ToolBtn
                    type="button"
                    title={_l('下载 PNG')}
                    onClick={() =>
                      downloadChartPng(fullscreenCanvasRef.current, fullscreenBoxRef.current, makeFilename())
                    }
                  >
                    <Icon icon="download" />
                  </ToolBtn>
                  <ToolBtn type="button" title={_l('关闭')} onClick={() => setFullscreen(false)}>
                    <Icon icon="close" />
                  </ToolBtn>
                </Toolbar>
              </FullscreenHeader>
              <FullscreenCanvas ref={fullscreenCanvasRef} />
            </FullscreenBox>
          </Overlay>,
          document.body,
        )}
      {pageDialogVisible && (
        <Suspense fallback={null}>
          <SelectOtherWorksheetDialog
            visible
            worksheetType={1}
            projectId={dialogProjectId}
            title={_l('保存到自定义页面')}
            selectedAppId={getChartAppId(spec)}
            currentAppId={getChartAppId(spec)}
            onOk={handleConfirmSaveToPage}
            onHide={() => setPageDialogVisible(false)}
          />
        </Suspense>
      )}
    </>
  );
}

export default Chart;
