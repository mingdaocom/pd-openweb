export const TABS = [
  {
    key: 'transaction',
    label: _l('订单明细'),
    path: '/admin/transaction/:projectId',
  },
  {
    key: 'refund',
    label: _l('退款订单'),
    path: '/admin/refund/:projectId',
  },
];

// 支付渠道
export const PAY_CHANNEL = [
  {
    value: 0,
    label: _l('聚合支付'),
    desc: _l('由鲸先企付提供，提交资料需要1-3个工作日完成申请；支持微信和支付宝聚合支付，费率固定为0.25%'),
  },
  { value: 2, label: _l('微信支付'), desc: _l('使用微信商户号开通；费率参考微信支付官方规则'), icon: 'wechat_pay' },
  {
    value: 1,
    label: _l('支付宝支付'),
    desc: _l('使用支付宝商户号开通；费率参考支付宝支付官方规则；退款时服务费不退回'),
    icon: 'order-alipay',
  },
];

export const PAY_CHANNEL_TXT = { 0: _l('聚合支付'), 1: _l('支付宝'), 2: _l('微信') };

export const STEPS = [
  {
    title: _l('选择支付渠道'),
  },
  {
    title: _l('申请商户号'),
    description: _l('此处申请的商户号是支付场景下的唯一标识，用于后续的收款交易及提现等功能'),
  },
  {
    title: _l('开通支付'),
    description: _l('商户进件是由第三方支付公司（中投支付）提供，请按照支付公司要求完成资料填写及签约'),
  },
  {
    title: _l('支付意愿认证'),
    description: _l(
      '经办人/法人使用微信/支付宝扫码根据提示注册新商家后完成意愿认证，只有认证成功后才可使用微信/支付宝进行收款',
    ),
  },
];

// 商户状态
export const STATUS = {
  0: _l('注册中'),
  1: _l('待开通'),
  2: _l('开通中'),
  3: _l('已开通'),
  4: _l('已禁用'),
};

// 交易状态
export const ORDER_STATUS = [
  { label: _l('待支付'), value: 0 },
  { label: _l('已支付'), value: 1 },
  { label: _l('已申请退款'), value: 2 },
  { label: _l('已退款'), value: 3 },
  { label: _l('支付超时'), value: 4 },
  { label: _l('部分退款'), value: 5 },
];

// 支付状态
export const PAY_STATUS = [
  { label: _l('交易成功'), value: 0 },
  { label: _l('转入退款'), value: 1 },
  { label: _l('待支付'), value: 2 },
  { label: _l('已关闭'), value: 3 },
  { label: _l('已完结'), value: 4 },
  { label: _l('已撤销'), value: 5 },
  { label: _l('支付中'), value: 6 },
  { label: _l('支付超时'), value: 7 },
  { label: _l('部分退款'), value: 8 },
];

export const REFUND_STATUS = [
  { label: _l('待处理'), value: 3 },
  { label: _l('已退款'), value: 2 },
  { label: _l('已拒绝'), value: 4 },
  { label: _l('已取消'), value: 5 },
  { label: _l('退款失败'), value: 1 },
  // 0 退款中 1 退款失败 2 已退款 3 待处理 4 已拒绝 5 已取消 6 同意退款
];

export const PAY_METHOD = [
  { label: _l('微信'), value: 1 },
  { label: _l('支付宝'), value: 0 },
];

export const INVOICE_STATUS = [
  { label: _l('申请开票'), value: 1 },
  { label: _l('未开票'), value: 2 },
  { label: _l('已开票'), value: 3 },
  { label: _l('开票中'), value: 4 },
  { label: _l('开票失败'), value: 5 },
];

export const INCOME_INFO = [
  { id: 'totalAmount', text: _l('总收入') },
  { id: 'dateRangeTotalAmount', text: '' },
  { id: 'refundTotalAmount', text: _l('已退款') },
  { id: 'realAmount', text: _l('实际收入') },
];

export const BALANCE_INFO = [{ id: 'banlance', text: _l('账户余额') }];

export const DATE_CONFIG = [
  { id: 'today', text: _l('今天') },
  { id: 'yesterday', text: _l('昨天'), pastDays: 1 },
  { id: 'pastSevenDays', text: _l('过去七天'), pastDays: 7 },
  { id: 'pastThirtyDays', text: _l('过去30天'), pastDays: 30 },
  { id: 'custom', text: _l('自定义日期') },
];

export const ORDER_SOURCE = [
  { label: _l('公开表单'), value: 1 },
  { label: _l('组织内'), value: 2 },
  { label: _l('外部门户'), value: 3 },
];

export const getOrderStatusInfo = (orderStatus, msg = '') => {
  let text, icon, color;
  if (orderStatus === 0) {
    text = _l('待支付');
  } else if (_.includes([1, 2, 3, 5], orderStatus)) {
    text = _l('支付成功');
    icon = 'icon-ok';
    color = '#4CAF50';
  } else if (orderStatus === 4) {
    text = _l('订单超时');
    icon = 'icon-info1';
    color = '#FF9D00';
  } else {
    text = msg || _l('支付失败');
    icon = 'icon-task-folder-message';
    color = '#f44133';
  }

  return {
    text,
    icon,
    color,
  };
};
