import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import loadG2Plot from 'src/pages/Statistics/Charts/loadG2Plot';
import { formatFileTimestamp } from 'src/utils/core/date';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { downloadBlob } from 'src/utils/platform/browser/download';

const CHART_COMPONENT_NAMES = {
  pie: 'Pie',
  column: 'Column',
};

const EXPORT_PADDING_X = 20;
const EXPORT_TITLE_Y = 32;
const EXPORT_TITLE_HEIGHT = 56;
const EXPORT_TITLE_GAP = 20;

const resolveCanvasColor = (source, property, fallback) => {
  const color = source && getComputedStyle(source)[property];

  return color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ? color : fallback;
};

const getCanvasTextStyle = (element, scale, fallback) => {
  const style = element && getComputedStyle(element);
  const fontSize = Number.parseFloat(style?.fontSize) || fallback.fontSize;

  return {
    color: style?.color || fallback.color,
    font: `${style?.fontStyle || 'normal'} ${style?.fontWeight || fallback.fontWeight} ${fontSize * scale}px ${style?.fontFamily || fallback.fontFamily}`,
  };
};

// 将标题、可选总计和 G2Plot 画布合成为完整 PNG，导出内容不包含网页卡片边框和操作按钮。
const createChartPng = ({ canvasContainer, card, title, total }) =>
  new Promise((resolve, reject) => {
    try {
      const sourceCanvas = canvasContainer?.querySelector('canvas');

      if (!sourceCanvas) throw new Error('Billing chart canvas is unavailable');

      const output = document.createElement('canvas');
      const scale = sourceCanvas.width / (sourceCanvas.clientWidth || sourceCanvas.width) || 1;
      const headerHeight = EXPORT_TITLE_HEIGHT;

      const exportPadding = Math.round(EXPORT_PADDING_X * scale);

      output.width = sourceCanvas.width + exportPadding * 2;
      output.height = sourceCanvas.height + Math.round(headerHeight * scale) + exportPadding;

      const context = output.getContext('2d');

      if (!context) throw new Error('Billing chart export context is unavailable');

      context.fillStyle = resolveCanvasColor(card, 'backgroundColor', '#ffffff');
      context.fillRect(0, 0, output.width, output.height);
      context.textBaseline = 'middle';
      const titleStyle = getCanvasTextStyle(card?.querySelector('.statisticsChartTitle > .Bold'), scale, {
        color: resolveCanvasColor(card, 'color', '#151515'),
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        fontSize: 14,
        fontWeight: 700,
      });

      context.fillStyle = titleStyle.color;
      context.font = titleStyle.font;
      context.fillText(title, EXPORT_PADDING_X * scale, EXPORT_TITLE_Y * scale);

      if (total !== undefined) {
        const titleWidth = context.measureText(title).width;
        const totalStyle = getCanvasTextStyle(card?.querySelector('.statisticsChartTitle > .textSecondary'), scale, {
          color: '#757575',
          fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
          fontSize: 13,
          fontWeight: 400,
        });

        context.fillStyle = totalStyle.color;
        context.font = totalStyle.font;
        context.fillText(
          `${_l('总计：')}${formatNumberThousand(total)}`,
          EXPORT_PADDING_X * scale + titleWidth + EXPORT_TITLE_GAP * scale,
          EXPORT_TITLE_Y * scale,
        );
      }

      context.drawImage(sourceCanvas, exportPadding, Math.round(headerHeight * scale));
      output.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Billing chart PNG generation failed'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });

// 账务图表渲染器，按需加载 G2Plot，并统一处理加载、空数据、失败和实例生命周期。
export default function BillingChart({ type, title, total, data = [], loading = false, options = {}, className }) {
  const cardRef = useRef(null);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const downloadPendingRef = useRef(false);
  const [status, setStatus] = useState('loading');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // 数据或配置快速变化时，已失效的异步加载结果不能再创建图表实例。
    let cancelled = false;

    if (!chartContainerRef.current || !data.length) return;

    setStatus('loading');
    loadG2Plot()
      .then(g2plot => {
        if (cancelled || !chartContainerRef.current) return;

        const ChartComponent = g2plot[CHART_COMPONENT_NAMES[type]];
        if (!ChartComponent) throw new Error(`Unsupported billing chart type: ${type}`);

        chartRef.current = new ChartComponent(chartContainerRef.current, {
          ...options,
          data,
          autoFit: true,
          // 图表实例不在 React 主题上下文中，需要从容器所在主题节点显式确定主题。
          theme: chartContainerRef.current.closest?.('[data-theme="dark"]') ? 'dark' : 'default',
        });
        chartRef.current.render();
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      // 依赖变化或组件卸载时销毁旧实例，避免重复画布和事件监听残留。
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, options, type]);

  const handleDownload = async () => {
    if (downloadPendingRef.current || status !== 'ready') return;

    downloadPendingRef.current = true;
    setDownloading(true);
    try {
      const blob = await createChartPng({
        canvasContainer: chartContainerRef.current,
        card: cardRef.current,
        title,
        total,
      });

      downloadBlob(blob, `${title}_${formatFileTimestamp()}.png`);
    } catch {
      alert(_l('图片生成失败'), 2);
    } finally {
      downloadPendingRef.current = false;
      setDownloading(false);
    }
  };

  return (
    <div className={cx('billingChartCard', className)} ref={cardRef}>
      <div className="statisticsChartTitle flexRow alignItemsCenter">
        <span className="Bold">{title}</span>
        {total !== undefined && (
          <span className="textSecondary mLeft20">
            {_l('总计：')}
            {formatNumberThousand(total)}
          </span>
        )}
        {!!data.length && !loading && status === 'ready' && (
          <Button
            color="default"
            variant="text"
            size="small"
            className="billingChartDownload"
            title={_l('下载 PNG')}
            aria-label={_l('下载 PNG')}
            loading={downloading}
            disabled={downloading}
            icon={<Icon icon="download" />}
            onClick={handleDownload}
          />
        )}
      </div>
      {data.length ? (
        <div className="billingChartWrap">
          <div className="billingChartContainer" ref={chartContainerRef} />
          {status === 'loading' && (
            <div className="billingChartFeedback flexRow alignItemsCenter justifyContentCenter">
              <LoadDiv />
            </div>
          )}
          {status === 'error' && (
            <div className="billingChartFeedback flexRow alignItemsCenter justifyContentCenter textSecondary">
              {_l('图表加载失败')}
            </div>
          )}
        </div>
      ) : (
        <div className="billingChartEmpty">{loading ? <LoadDiv /> : _l('暂无数据')}</div>
      )}
    </div>
  );
}
