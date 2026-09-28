import moment from 'moment';
import { getTimeZone } from 'src/utils/platform/runtime/timeZone';
import { orderRecordPaidTypeDropdownData, orderRecordRechargeTypeDropdownData } from '../billCenter/billInfo/config';

const getTypes = types =>
  types
    .filter(item => item.value !== 0)
    .map(item => ({
      value: item.value,
      get label() {
        return item.text;
      },
    }));

export const PURCHASE_TYPES = getTypes(orderRecordPaidTypeDropdownData);
export const CREDIT_TYPES = getTypes(orderRecordRechargeTypeDropdownData);

export const AI_TYPES = [
  { value: 'app-build', label: _l('应用搭建') },
  { value: 'app-plan-builder', label: _l('应用规划') },
  { value: 'app-query', label: _l('数据查询') },
  { value: 'worksheet-generate', label: _l('创建工作表') },
  { value: 'record-create', label: _l('创建记录') },
  { value: 'app-info-rename', label: _l('优化名称和图标') },
  { value: 'worksheet-example-data', label: _l('生成示例数据') },
  { value: 'app-translate', label: _l('应用翻译') },
];

export const CHANNEL_TYPES = [
  { value: 'workflow', label: _l('工作流') },
  { value: 'worksheet', label: _l('工作表') },
  { value: 'externalPortal', label: _l('外部门户') },
  { value: 'mingo', label: _l('Mingo') },
];

export const getAITypeLabel = type =>
  AI_TYPES.find(item => item.value === (type === 'build-app' ? 'app-build' : type))?.label || type || '-';

export const getChannelLabel = channel => CHANNEL_TYPES.find(item => item.value === channel)?.label || channel || '-';

// 将账务筛选自然日附着到个人时区零点，避免按浏览器时区转换后日期发生偏移。
export const formatBillingDate = date => {
  if (!date) return '';

  const { userZone } = getTimeZone();

  return moment(date).utcOffset(userZone, true).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
};

export const createDefaultDateInfo = (now = moment()) => {
  const start = moment(now).subtract(5, 'months').startOf('month');
  const end = moment(now);

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    searchDateStr: `${start.format('YYYY-MM-DD')}~${end.format('YYYY-MM-DD')} `,
  };
};
