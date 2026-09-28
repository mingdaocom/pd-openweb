import moment from 'moment';
import { CREDIT_TYPES, getAITypeLabel } from '../config';

// 将消费类型值转换为展示文案，未知类型统一显示占位符。
export const getCreditTypeLabel = value => CREDIT_TYPES.find(item => item.value === value)?.label || '-';

// 将接口的多序列时间点展开为柱状图数据，并为每个时间桶补齐缺失分类的零值。
const transformColumnData = (items, getType) => {
  const buckets = [...new Set(items.flatMap(item => item.points.map(point => point.bucketStart)))].sort(
    (a, b) => a - b,
  );
  const pointMaps = items.map(item => new Map(item.points.map(point => [point.bucketStart, point.amount])));

  return buckets.flatMap(bucketStart =>
    items.map((item, index) => ({
      date: moment.utc(bucketStart).utcOffset(8).format('YYYY-MM-DD'),
      type: getType(item),
      value: pointMaps[index].get(bucketStart) ?? 0,
    })),
  );
};

// 使用整数放大方式规避常见浮点误差，并在结果超出安全整数范围时回退普通求和。
export const sumStatisticsValues = values => {
  const sum = values.reduce((total, value) => total + Number(value), 0);
  const decimals = values.reduce((max, value) => Math.max(max, (String(value).split('.')[1] || '').length), 0);

  if (!decimals || values.some(value => /e/i.test(String(value)))) return sum;

  const multiple = Math.pow(10, decimals);
  const total = values.reduce((sum, value) => sum + Math.round(Number(value) * multiple), 0);

  return Number.isSafeInteger(total) ? total / multiple : sum;
};

// 汇总接口已按分类返回 totalAmount，图表标题总计直接沿用接口汇总口径。
const sumTotalAmounts = items => sumStatisticsValues((items || []).map(item => Number(item.totalAmount || 0)));

// 将统计汇总接口结果转换为页面四类图表的数据结构。
export const transformStatisticsSummary = summary => ({
  creditTotal: sumTotalAmounts(summary?.trend?.items),
  aiModelTotal: sumTotalAmounts(summary?.models?.items),
  creditDistribution: (summary?.distribution?.items || [])
    .filter(item => item.totalAmount > 0)
    .map(item => ({ type: getCreditTypeLabel(item.businessType), value: item.totalAmount })),
  mingoDistribution: (summary?.scenes?.items || [])
    .filter(item => item.extensionData?.businessId && item.totalAmount > 0)
    .map(item => ({ type: getAITypeLabel(item.extensionData.businessId), value: item.totalAmount })),
  credit: transformColumnData(summary?.trend?.items, item => getCreditTypeLabel(item.businessType)),
  aiModel: transformColumnData(summary?.models?.items, item => item.extensionData.modelName?.trim() || _l('其他')),
});

// 将每日消费数据按目标时间粒度汇总，并为筛选范围补齐缺失的时间桶和分类。
export const aggregateColumnData = (data, granularity, startDate, endDate) => {
  if (!data.length) return [];

  const bucketUnit = granularity === 'week' ? 'isoWeek' : granularity;
  const stepUnit = granularity === 'week' ? 'week' : granularity;
  const groups = new Map();
  const types = [...new Set(data.map(item => item.type))];

  data.forEach(item => {
    const date = moment(item.date).startOf(bucketUnit).format('YYYY-MM-DD');
    const key = JSON.stringify([date, item.type]);

    groups.set(key, sumStatisticsValues([groups.get(key) || 0, Number(item.value || 0)]));
  });

  const bucketDates = [];
  const current = moment(startDate).startOf(bucketUnit);
  const selectedEnd = moment(endDate).startOf('day');

  while (!current.isAfter(selectedEnd, 'day')) {
    bucketDates.push(current.format('YYYY-MM-DD'));
    current.add(1, stepUnit);
  }

  return bucketDates.flatMap(date =>
    types.map(type => {
      const value = groups.get(JSON.stringify([date, type])) || 0;

      return { date, type, value };
    }),
  );
};

// 格式化柱状图坐标和 tooltip 日期，并将首尾周期裁剪到用户实际选择范围内。
export const formatColumnDate = (date, { granularity, startDate, endDate, full = false }) => {
  const periodStart = moment(date).startOf('day');
  const periodEnd =
    granularity === 'week'
      ? periodStart.clone().endOf('isoWeek')
      : granularity === 'day'
        ? periodStart.clone()
        : periodStart.clone().endOf('month');
  const selectedStart = moment(startDate).startOf('day');
  const selectedEnd = moment(endDate).startOf('day');
  const actualStart = selectedStart.isAfter(periodStart) ? selectedStart : periodStart;
  const actualEnd = selectedEnd.isBefore(periodEnd) ? selectedEnd : periodEnd;

  if (!full) {
    if (granularity === 'day') return actualStart.format('M/D');
    if (granularity === 'week') return `${actualStart.format('M/D')}–${actualEnd.format('M/D')}`;
    return actualStart.format('YYYY/M');
  }

  if (granularity === 'day') return actualStart.format('YYYY/M/D');
  return `${actualStart.format('YYYY/M/D')}–${actualEnd.format('YYYY/M/D')}`;
};
