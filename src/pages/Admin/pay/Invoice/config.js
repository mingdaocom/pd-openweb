import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

export const TABS = [
  { key: 'taxNo', label: _l('开票税号'), permissionKey: PERMISSION_ENUM.TAX },
  { key: 'list', label: _l('开票记录'), permissionKey: PERMISSION_ENUM.INVOICE },
];

// 税号状态文本
export const TAX_STATUS_TEXT = { 0: _l('试用中'), 5: _l('已付费'), 99: _l('已过期') };

export const STEPS = [{ title: _l('填写开票税号') }, { title: _l('完善开票配置') }, { title: _l('导入商品管理表') }];

export const STATISTIC = [
  { id: 'successOutputInvoice', text: _l('已开票') },
  { id: 'waitOutputInvoice', text: _l('未开票') },
  { id: 'failOutputInvoice', text: _l('开票失败') },
  { id: 'successInvoiceAmount', text: _l('已开票金额') },
  { id: 'waitInvoiceAmount', text: _l('未开票金额') },
];

export const INVOICE_TYPE = {
  1: _l('数电专票'),
  2: _l('数电普票'),
};
