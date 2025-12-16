export const INVOICE_TYPE_OPTIONS = [
  { text: _l('数电普票'), value: 2 },
  { text: _l('数电专票'), value: 1 },
];

export const RADIO_DATA = {
  invoiceOutputType: [
    { text: _l('企业'), value: 1 },
    { text: _l('个人'), value: 2 },
  ],
  contentType: [
    { text: _l('按类目汇总'), value: 1 },
    { text: _l('明细（开发中）'), value: 2, disabled: true },
  ],
  invoiceType: INVOICE_TYPE_OPTIONS,
};

export const TITLE_TEXT = {
  apply: _l('申请开票'),
  confirm: _l('审核开票'),
  edit: _l('修改开票'),
  test: _l('开票测试'),
};

export const INVOICE_STATUS = {
  UN_INVOICED: 0, // 未开票
  INVOICED: 1, // 开票成功
  FAILED: 2, // 开票失败
  PROCESSING: 3, // 开票中
  CANCELLED: 4, // 取消开票
};

export const INVOICE_STATUS_OPTIONS = [
  { label: _l('未开票'), value: INVOICE_STATUS.UN_INVOICED },
  { label: _l('已开票'), value: INVOICE_STATUS.INVOICED },
  { label: _l('开票失败'), value: INVOICE_STATUS.FAILED },
  { label: _l('开票中'), value: INVOICE_STATUS.PROCESSING },
  { label: _l('已取消'), value: INVOICE_STATUS.CANCELLED },
];

export const STATUS_INFO_APPLY = {
  [INVOICE_STATUS.UN_INVOICED]: { title: _l('发票申请中...'), okText: _l('修改信息'), icon: 'wait', color: '#bdbdbd' },
  [INVOICE_STATUS.PROCESSING]: { title: _l('发票开具中...'), icon: 'wait', color: '#bdbdbd' },
  [INVOICE_STATUS.INVOICED]: { title: _l('发票开具成功'), okText: _l('查看发票'), icon: 'Finish', color: '#4caf50' },
  [INVOICE_STATUS.FAILED]: { title: _l('发票开具失败'), okText: _l('重新申请'), icon: 'cancel', color: '#f44336' },
  [INVOICE_STATUS.CANCELLED]: { title: _l('发票已取消申请'), okText: _l('重新申请'), icon: 'cancel', color: '#f78900' },
  error: { title: _l('订单异常不支持开票'), icon: 'cancel', color: '#f44336' },
};

export const STATUS_INFO_CONFIRM = {
  [INVOICE_STATUS.PROCESSING]: { title: _l('正在开票中...'), okText: _l('刷新'), icon: 'wait', color: '#bdbdbd' },
  [INVOICE_STATUS.INVOICED]: { title: _l('开票成功'), okText: _l('查看发票'), icon: 'Finish', color: '#4caf50' },
  [INVOICE_STATUS.FAILED]: { title: _l('开票失败'), icon: 'cancel', color: '#f44336' },
  [INVOICE_STATUS.CANCELLED]: { title: _l('已取消申请开票'), icon: 'cancel', color: '#f78900' },
  error: { title: _l('开票单号异常不支持开票'), icon: 'cancel', color: '#f44336' },
  noAuth: { title: _l('无审核开票权限'), icon: 'info1', color: '#f78900' },
};
