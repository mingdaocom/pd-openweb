// const keys = [订单编号、交易金额、结算金额、结算手续费、退款金额、下单时间、支付方式、交易单号、支付时间]
export const infoKeys = [
  {
    key: 'orderId',
    txt: _l('订单编号'),
  },
  {
    key: 'amount',
    txt: _l('交易金额'),
  },
  {
    key: 'settlementAmount',
    txt: _l('结算金额'),
  },
  {
    key: 'taxAmount',
    txt: _l('结算手续费'),
  },
  {
    key: 'refundAmount',
    txt: _l('退款金额'),
  },
  {
    key: 'payOrderType',
    txt: _l('支付方式'),
  },
  {
    key: 'sourceType',
    txt: _l('订单来源'),
  },
  {
    key: 'shortName',
    txt: _l('收款账户'),
  },
  {
    key: 'createTime',
    txt: _l('下单时间'),
  },
  {
    key: 'paidTime',
    txt: _l('支付时间'),
  },
  {
    key: 'merchantOrderId',
    txt: _l('交易单号'),
  },
  {
    key: 'payAccountInfo',
    txt: _l('下单人'),
  },
];
// status 0待支付 1已支付 2 已申请退款｜退款中 3已退款 4支付超时 5部分退款
export const statusList = [
  {
    key: 0,
    text: _l('待支付'),
    type: 'wait',
  },
  {
    key: 1,
    text: _l('支付成功'),
    type: 'success',
  },
  {
    key: 2,
    text: _l('已申请退款'),
    type: 'war',
  },
  {
    key: 3,
    text: _l('已退款'),
    type: 'success',
  },
  {
    key: 4,
    text: _l('订单超时'),
    type: 'err',
  },
  {
    key: 5,
    text: _l('部分退款'),
    type: 'war',
  },
  {
    key: 7,
    text: _l('已取消'),
    type: 'cancel',
  },
  {
    key: 8,
    text: _l('已取消'),
    type: 'cancel',
  },
];

export const refundInfoKeys = [
  {
    key: 'refundOrderId',
    txt: _l('退款单号'),
  },
  {
    key: 'payAmount',
    txt: _l('交易金额'),
  },
  {
    key: 'amount',
    txt: _l('退款金额'),
  },
  {
    key: 'operatorAccountInfo',
    txt: _l('退款操作用户'),
  },
  {
    key: 'refundTime',
    txt: _l('退款时间'),
  },
  {
    key: 'createTime',
    txt: _l('申请时间'),
  },
  {
    key: 'payAccountInfo',
    txt: _l('申请用户'),
  },
];

// status  0 退款中 1 退款失败 2 已退款 3 待处理 4 已拒绝 5 已取消 6 同意退款
export const refundStatusList = [
  {
    key: 0,
    text: _l('退款中'),
  },
  {
    key: 1,
    text: _l('退款失败'),
  },
  {
    key: 2,
    text: _l('已退款'),
  },
  {
    key: 3,
    text: _l('待处理'),
  },
  {
    key: 4,
    text: _l('已拒绝'),
  },
  {
    key: 5,
    text: _l('已取消'),
  },
  {
    key: 6,
    text: _l('同意退款'),
  },
];

// 订单来源
export const sourceTypeInfo = {
  1: _l('公开表单'),
  2: _l('组织内'),
  3: _l('外部门户'),
  6: _l('他人代付'),
};

export const selectPayStatusList = [
  { key: 100, text: _l('支付订单'), type: 'wait' },
  { key: 7, text: _l('已取消'), type: 'err' },
  { key: 4, text: _l('订单超时'), type: 'err' },
];
