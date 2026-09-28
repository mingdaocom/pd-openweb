import _ from 'lodash';
import { formatNumberThousand } from 'src/utils/domain/control/number';
import { AI_TYPES, CHANNEL_TYPES, CREDIT_TYPES, PURCHASE_TYPES } from '../config';

const RECHARGE_PRODUCT_CODE = 10201;

// 统一格式化账务数字，保留后端返回的正负号，并为无效值展示占位符。
export const formatBillingNumber = value => {
  if (_.isNil(value) || value === '' || !_.isFinite(Number(value))) return '-';
  return formatNumberThousand(value);
};

export const formatBillingDeduction = value => {
  const amount = formatBillingNumber(value);
  return amount === '-' ? '-' : `-${amount}`;
};

export const getCreditTypeLabel = businessType => CREDIT_TYPES.find(item => item.value === businessType)?.label || '-';

// 订单产品编码 10201 为充值并展示正数，其他购买订单统一展示负数。
export const formatOrderAmount = (value, productCode) => {
  if (_.isNil(value) || value === '' || !_.isFinite(Number(value))) return '-';

  const amount = Math.abs(Number(value));
  return formatBillingNumber(Number(productCode) === RECHARGE_PRODUCT_CODE ? amount : -amount);
};

export const DETAIL_TABS = [
  // { key: 'purchase', label: _l('充值与购买') },
  { key: 'credit', label: _l('自动扣费') },
  { key: 'aiBenefit', label: _l('AI 福利点消费') },
  { key: 'refund', label: _l('扣费退回') },
];

export const ORDER_STATUS_OPTIONS = [
  { value: 1, label: _l('待支付') },
  { value: 2, label: _l('已支付') },
  { value: 3, label: _l('订单已完成') },
  { value: 4, label: _l('已过期') },
];

export const FILTER_OPTIONS = {
  purchaseContent: PURCHASE_TYPES,
  orderStatus: ORDER_STATUS_OPTIONS,
  invoiceStatus: [_l('无需开票'), _l('未申请'), _l('已开票')].map(value => ({ value, label: value })),
  creditType: CREDIT_TYPES,
  aiType: AI_TYPES,
  channel: CHANNEL_TYPES,
};

const createTimeSearchItem = label => ({
  key: 'time',
  type: 'selectTime',
  label,
  placeholder: _l('选择日期范围'),
});

export function getSearchList(tab, searchValues = {}) {
  const searchLists = {
    purchase: [
      {
        key: 'content',
        type: 'select',
        label: _l('类型'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.content,
        options: FILTER_OPTIONS.purchaseContent,
      },
      createTimeSearchItem(_l('下单时间')),
      {
        key: 'orderStatus',
        type: 'select',
        label: _l('订单状态'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.orderStatus,
        options: FILTER_OPTIONS.orderStatus,
      },
      {
        key: 'invoiceStatus',
        type: 'select',
        label: _l('发票状态'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.invoiceStatus,
        options: FILTER_OPTIONS.invoiceStatus,
      },
    ],
    credit: [
      {
        key: 'type',
        type: 'select',
        label: _l('产品类型'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.type,
        options: FILTER_OPTIONS.creditType,
      },
      createTimeSearchItem(_l('时间')),
      {
        key: 'app',
        type: 'selectApp',
        label: _l('应用'),
        placeholder: _l('全部'),
        value: searchValues.app,
      },
      {
        key: 'channel',
        type: 'select',
        label: _l('操作来源'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.channel,
        options: FILTER_OPTIONS.channel,
      },
      { key: 'creator', type: 'selectUser', label: _l('操作人'), placeholder: _l('搜索操作人'), unique: true },
    ],
    aiBenefit: [
      {
        key: 'type',
        type: 'select',
        label: _l('产品类型'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.type,
        options: FILTER_OPTIONS.aiType,
      },
      createTimeSearchItem(_l('时间')),
    ],
    refund: [
      {
        key: 'type',
        type: 'select',
        label: _l('产品类型'),
        placeholder: _l('全部'),
        allowClear: true,
        value: searchValues.type,
        options: FILTER_OPTIONS.creditType,
      },
      createTimeSearchItem(_l('退款时间')),
    ],
  };

  return searchLists[tab] || [];
}
