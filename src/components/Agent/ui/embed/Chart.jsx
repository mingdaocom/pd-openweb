import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import styled, { css, keyframes } from 'styled-components';
import loadG2Plot from 'src/pages/Statistics/Charts/loadG2Plot';
import { colors, radii, shadows, spacing, transitions } from '../tokens';

// 导出文件名时间戳后缀：yyMMddHHmmss（年月日时分秒，各 2 位）
const pad2 = n => String(n).padStart(2, '0');

function fileStamp(d = new Date()) {
  return `${pad2(d.getFullYear() % 100)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

// mingo_embed_data_chart 渲染器：把 app-query-agent / app-data-agent 输出的定量数据图 spec
// （契约见 mingo-embed-data-chart-contract.md）用 @antv/g2plot 渲染成交互式图表。
// 入参 { data, isStreaming }：data 为已解析的 spec 对象，CodeBlock 已保证 JSON 合法且非空。
// 职责边界：agent 只给语义数据（type/title/unit/stack/data/value/target/compare/axes），配色/坐标/交互/主题由本组件 + g2plot 决定。
// 支持 13 种 type：定量图（pie/column/bar/line/area/funnel/rose/radar/wordcloud/heatmap/dualAxes）走 g2plot；
// 单值类 statistic 自绘大数卡、gauge 走 g2plot Gauge（按 value/target 算占比）。

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
  line: spec => ({
    plot: 'Line',
    config: withSeries(spec, { data: spec.data, xField: 'category', yField: 'value', smooth: false }, 'series'),
  }),
  area: spec => ({
    plot: 'Area',
    config: withSeries(spec, { data: spec.data, xField: 'category', yField: 'value' }, 'stack'),
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
    config: {
      data: spec.data,
      xField: 'category',
      yField: 'series', // 契约：heatmap 的 series 作 y 轴
      colorField: 'value',
      label: { style: { fill: colors.textInverse } },
    },
  }),
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

    return {
      plot: 'DualAxes',
      config: {
        data: [left, right],
        xField: 'category',
        yField: ['v0', 'v1'],
        geometryOptions: [{ geometry: geom(axes[0].geom) }, { geometry: geom(axes[1].geom) }],
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
function withSeries(spec, base, mode) {
  const hasSeries = Array.isArray(spec.data) && spec.data.some(d => d && d.series != null);

  if (!hasSeries) return base;

  const next = { ...base, seriesField: 'series' };

  if (mode === 'isGroupStack') {
    if (spec.stack) next.isStack = true;
    else next.isGroup = true;
  } else if (mode === 'stack') {
    if (spec.stack) next.isStack = true;
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
      // 单位拼到 tooltip：data[].value 恒为数值字段，name 优先系列名再分类名。
      // dualAxes 数据按 v0/v1 拆分、无统一 value 字段，走 g2plot 默认 tooltip，不套此 formatter。
      ...(unit && spec.type !== 'dualAxes'
        ? {
            tooltip: {
              formatter: d => ({ name: d.series || d.category, value: `${d.value}${unit}` }),
            },
          }
        : null),
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

  svg {
    width: 14px;
    height: 14px;
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

function IconFullscreen() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 1v9M4.5 6.5 8 10l3.5-3.5M2 14h12" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 3l10 10M13 3 3 13" />
    </svg>
  );
}

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
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const [renderable, setRenderable] = useState(() => !!buildPlot(spec));
  const [fullscreen, setFullscreen] = useState(false);

  const title = spec && typeof spec.title === 'string' ? spec.title.trim() : '';

  useEffect(() => {
    const built = buildPlot(spec);

    setRenderable(!!built);

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
  }, [spec, isStreaming]);

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
    if (!fullscreen) return undefined;
    const built = buildPlot(spec);

    if (!built) return undefined;

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
  }, [fullscreen, spec]);

  // Esc 关闭全屏
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') setFullscreen(false);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  // spec 还不可渲染：流式期间（JSON 已合法但 spec 字段还没补全）先占位 loading；非流式则降级不渲染
  if (!renderable) return isStreaming ? <ChartSkeleton /> : null;

  // statistic：自绘单值卡，无 canvas，不提供下载/全屏（抓不到 canvas 也无意义）
  const isStatistic = spec.type === 'statistic';
  // 下载时现取时间戳，文件名形如 运营总览_250616143022.png
  const makeFilename = () => `${title || 'chart'}_${fileStamp()}.png`;

  return (
    <>
      <Wrap ref={wrapRef}>
        {title && <Title>{title}</Title>}
        {isStatistic ? (
          <StatisticCard spec={spec} />
        ) : (
          <>
            <Canvas ref={canvasRef} />
            <Toolbar className="chart-toolbar">
              <ToolBtn
                type="button"
                title={_l('下载 PNG')}
                onClick={() => downloadChartPng(canvasRef.current, wrapRef.current, makeFilename())}
              >
                <IconDownload />
              </ToolBtn>
              <ToolBtn type="button" title={_l('全屏查看')} onClick={() => setFullscreen(true)}>
                <IconFullscreen />
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
                  <ToolBtn
                    type="button"
                    title={_l('下载 PNG')}
                    onClick={() =>
                      downloadChartPng(fullscreenCanvasRef.current, fullscreenBoxRef.current, makeFilename())
                    }
                  >
                    <IconDownload />
                  </ToolBtn>
                  <ToolBtn type="button" title={_l('关闭')} onClick={() => setFullscreen(false)}>
                    <IconClose />
                  </ToolBtn>
                </Toolbar>
              </FullscreenHeader>
              <FullscreenCanvas ref={fullscreenCanvasRef} />
            </FullscreenBox>
          </Overlay>,
          document.body,
        )}
    </>
  );
}

export default Chart;
