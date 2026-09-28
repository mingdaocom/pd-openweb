import { formatNumberThousand } from 'src/utils/domain/control/number';
import { SYS_CHART_COLORS } from 'src/utils/domain/project/colors';
import { formatColumnDate, sumStatisticsValues } from './utils';

const CHART_COLORS = SYS_CHART_COLORS[0].colors;
const DATE_TICK_LIMITS = {
  day: 31,
  week: 12,
};

// 超出当前粒度上限时使用固定整数步长抽取刻度，避免相邻时间跨度不一致。
const getDateTicks = (values, limit) => {
  if (!limit || values.length <= limit) return values;

  const interval = Math.ceil((values.length - 1) / (limit - 1));

  return values.filter((_, index) => index % interval === 0);
};

export const GRANULARITY_OPTIONS = [
  { value: 'day', label: _l('天') },
  { value: 'week', label: _l('周') },
  { value: 'month', label: _l('月') },
];
export const OVERVIEW_CARD_CONFIG = [
  { key: 'periodConsumption', label: _l('本月信用点消费'), value: '-', unit: _l('信用点') },
  { key: 'totalRecharge', label: _l('累计充值'), value: '-', unit: _l('信用点') },
  { key: 'totalConsumption', label: _l('累计消费'), value: '-', unit: _l('信用点') },
];

// 两个占比饼图统一消费 { type, value } 数据，中心总计沿用统计模块的精度求和规则。
export const PIE_OPTIONS = {
  angleField: 'value',
  colorField: 'type',
  radius: 0.78,
  innerRadius: 0.62,
  color: CHART_COLORS,
  meta: {
    value: {
      formatter: formatNumberThousand,
    },
  },
  legend: {
    position: 'top-left',
    itemHeight: 20,
    radio: { style: { r: 6 } },
  },
  label: {
    type: 'spider',
    content: '{name} ({percentage})',
  },
  statistic: {
    title: false,
    content: {
      formatter: (_, data = []) => formatNumberThousand(sumStatisticsValues(data.map(item => Number(item.value || 0)))),
      style: {
        fontSize: 20,
        fontWeight: 500,
      },
    },
  },
  tooltip: {
    formatter: datum => ({ name: datum.type, value: formatNumberThousand(datum.value) }),
  },
};

// 两个消费柱状图统一按 type 堆叠，并根据时间粒度格式化坐标轴和 tooltip。
export const createStackedColumnOptions = (granularity, startDate, endDate) => {
  const dateOptions = { granularity, startDate, endDate };

  return {
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    isStack: true,
    color: CHART_COLORS,
    columnWidthRatio: 0.52,
    maxColumnWidth: 64,
    legend: {
      position: 'top-left',
      itemHeight: 20,
      radio: { style: { r: 6 } },
    },
    xAxis: {
      tickMethod: ({ values }) => getDateTicks(values, DATE_TICK_LIMITS[granularity]),
      label: {
        formatter: value => formatColumnDate(value, dateOptions),
        autoHide: granularity !== 'month',
        autoRotate: false,
      },
    },
    yAxis: {
      min: 0,
      grid: {
        line: {
          style: {
            lineDash: [4, 5],
          },
        },
      },
    },
    tooltip: {
      shared: true,
      showMarkers: true,
      title: value => formatColumnDate(value, { ...dateOptions, full: true }),
      formatter: datum => ({ name: datum.type, value: formatNumberThousand(datum.value) }),
    },
  };
};

// 应用消费接口已按应用聚合，表格直接展示其固定分类字段。
export const getAppColumns = () => [
  {
    title: _l('应用名称'),
    dataIndex: 'appId',
    width: 180,
    render: (appId, item) => item.application?.appName?.trim() || appId,
  },
  {
    title: _l('总消耗'),
    dataIndex: 'totalAmount',
    width: 170,
    render: formatNumberThousand,
  },
  { title: _l('短信发送'), dataIndex: 'smsAmount', width: 150, render: formatNumberThousand },
  { title: _l('AIGC'), dataIndex: 'aigcAmount', width: 150, render: formatNumberThousand },
  { title: _l('邮件发送'), dataIndex: 'emailAmount', width: 150, render: formatNumberThousand },
  {
    title: _l('生成 PDF'),
    dataIndex: 'fileConvertToPdfAmount',
    width: 180,
    render: formatNumberThousand,
  },
  { title: _l('文字识别'), dataIndex: 'ocrAmount', width: 150, render: formatNumberThousand },
  { title: _l('知识库向量化'), dataIndex: 'embeddingAmount', width: 180, render: formatNumberThousand },
];
