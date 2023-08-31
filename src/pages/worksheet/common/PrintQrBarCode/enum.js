import _ from 'lodash';

function getList(value = {}) {
  return Object.keys(value)
    .filter(key => !_.includes(['texts', 'shorts'], key))
    .map(key => ({
      value: value[key],
      text: (value.texts || {})[key],
      label: (value.texts || {})[key],
    }));
}

// 数据源类型
export const SOURCE_TYPE = {
  URL: 1, // 记录链接
  CONTROL: 2, // 字段
  texts: {
    URL: _l('记录链接'),
    CONTROL: _l('字段'),
  },
};
export const SOURCE_TYPE_LIST = getList(SOURCE_TYPE);

// 记录链接类型
export const SOURCE_URL_TYPE = {
  MEMBER: 1, // 内部链接
  PUBLIC: 2, // 公开链接
  texts: {
    MEMBER: _l('内部成员访问链接'),
    PUBLIC: _l('公开链接'),
  },
};
export const SOURCE_URL_TYPE_LIST = getList(SOURCE_URL_TYPE);

// 打印方式
export const PRINT_TYPE = {
  QR: 1, // 二维码
  A4: 2,
  BAR: 3, // 条码
  texts: {
    QR: _l('标签打印机'),
    A4: _l('A4打印机'),
    BAR: _l('条码'),
  },
};
export const PRINT_TYPE_LIST = getList(PRINT_TYPE);

// A4 排版布局
export const A4_LAYOUT = {
  A1x1: 1,
  A1x2: 2,
  A2x2: 3,
  A2x5: 4,
  A3x6: 5,
  texts: {
    A1x1: '1*1',
    A1x2: '1*2',
    A2x2: '2*2',
    A2x5: '2*5',
    A3x6: '3*6',
  },
};
export const A4_LAYOUT_LIST = getList(A4_LAYOUT);

// 二维码打印尺寸
export const QR_LABEL_SIZE = {
  L30x20: 1,
  L40x30: 2,
  L50x30: 3,
  L60x40: 4,
  L70x50: 5,
  L80x60: 6,
  L100x80: 7,
  CUSTOM: 100,
  texts: {
    L30x20: '30 x 20 mm',
    L40x30: '40 x 30 mm',
    L50x30: '50 x 30 mm',
    L60x40: '60 x 40 mm',
    L70x50: '70 x 50 mm',
    L80x60: '80 x 60 mm',
    L100x80: '100 x 80 mm',
    CUSTOM: _l('自定义'),
  },
};
export const QR_LABEL_SIZE_LIST = getList(QR_LABEL_SIZE);

export const QR_LABEL_SIZES = {
  [QR_LABEL_SIZE.L30x20]: { width: 30, height: 20 },
  [QR_LABEL_SIZE.L40x30]: { width: 40, height: 30 },
  [QR_LABEL_SIZE.L50x30]: { width: 50, height: 30 },
  [QR_LABEL_SIZE.L60x40]: { width: 60, height: 40 },
  [QR_LABEL_SIZE.L70x50]: { width: 70, height: 50 },
  [QR_LABEL_SIZE.L80x60]: { width: 80, height: 60 },
  [QR_LABEL_SIZE.L100x80]: { width: 100, height: 80 },
};

// 二维码布局
export const QR_LAYOUT = {
  PORTRAIT: 1, // 纵向
  LANDSCAPE: 2, // 横向
  texts: {
    PORTRAIT: _l('纵向'),
    LANDSCAPE: _l('横向'),
  },
};
export const QR_LAYOUT_LIST = getList(QR_LAYOUT);

// 二维码大小
/**
 * 二维码打印增加超大尺寸
 * 纵向布局：原大作为超大。增加小尺寸（默认超大）
 * 横向布局：原大作为超大。增加大尺寸（默认小）
 * --------------------------
 * 上面是 8.4 新增需求，迷惑的调整逻辑导致枚举值也变乱了
 * 新枚举值
 * 纵向 1:超大[默认] 2:大 3:中 4:小
 * 横向 1:超大 4:大 2:中 3:小[默认]
 */

// 纵向布局
export const PORTRAIT_QR_CODE_SIZE = {
  HUGE: 1, // 超大
  LARGE: 2, // 大
  MIDDLE: 3, // 中
  SMALL: 4, // 小
  texts: {
    HUGE: _l('超大'),
    LARGE: _l('大'),
    MIDDLE: _l('中'),
    SMALL: _l('小'),
  },
  shorts: {
    1: 'h',
    2: 'l',
    3: 'm',
    4: 's',
  },
};

// 横向布局
export const LANDSCAPE_QR_CODE_SIZE = {
  HUGE: 1, // 超大
  LARGE: 4, // 大
  MIDDLE: 2, // 中
  SMALL: 3, // 小
  texts: {
    HUGE: _l('超大'),
    LARGE: _l('大'),
    MIDDLE: _l('中'),
    SMALL: _l('小'),
  },
  shorts: {
    1: 'h',
    4: 'l',
    2: 'm',
    3: 's',
  },
};
export const PORTRAIT_CODE_SIZE_LIST = getList(PORTRAIT_QR_CODE_SIZE);
export const LANDSCAPE_QR_CODE_SIZE_LIST = getList(LANDSCAPE_QR_CODE_SIZE);

// 二维码位置
export const QR_POSITION = {
  TOP: 1, // 顶部
  BOTTOM: 2, // 底部
  LEFT: 3, // 左边
  RIGHT: 4, // 右边
  texts: {
    TOP: _l('顶部'),
    BOTTOM: _l('底部'),
    LEFT: _l('左边'),
    RIGHT: _l('右边'),
  },
};
export const QR_POSITION_LIST = getList(QR_POSITION);

export const CODE_FAULT_TOLERANCE = {
  L: 1, // 7%
  M: 0, // 15%
  Q: 3, // 25%
  H: 2, // 30%
  texts: {
    L: _l('7%'),
    M: _l('15%'),
    Q: _l('25%'),
    H: _l('35%'),
  },
};
export const CODE_FAULT_TOLERANCE_LIST = getList(CODE_FAULT_TOLERANCE);

// --- 条形码 ---

// 条形码尺寸
export const BAR_LABEL_SIZE = {
  B30x20: 1,
  B40x30: 2,
  B50x30: 3,
  B60x40: 4,
  B70x50: 5,
  B80x60: 6,
  B100x80: 7,
  CUSTOM: 100,
  texts: {
    B30x20: '30 x 20 mm',
    B40x30: '40 x 30 mm',
    B50x30: '50 x 30 mm',
    B60x40: '60 x 40 mm',
    B70x50: '70 x 50 mm',
    B80x60: '80 x 60 mm',
    B100x80: '100 x 80 mm',
    CUSTOM: _l('自定义'),
  },
};
export const BAR_LABEL_SIZE_LIST = getList(BAR_LABEL_SIZE);

export const BAR_LABEL_SIZES = {
  [BAR_LABEL_SIZE.B30x20]: { width: 30, height: 20 },
  [BAR_LABEL_SIZE.B40x30]: { width: 40, height: 30 },
  [BAR_LABEL_SIZE.B50x30]: { width: 50, height: 30 },
  [BAR_LABEL_SIZE.B60x40]: { width: 60, height: 40 },
  [BAR_LABEL_SIZE.B70x50]: { width: 70, height: 50 },
  [BAR_LABEL_SIZE.B80x60]: { width: 80, height: 60 },
  [BAR_LABEL_SIZE.B100x80]: { width: 100, height: 80 },
};

// 条形码布局
export const BAR_LAYOUT = {
  PORTRAIT: 1, // 纵向
  LANDSCAPE: 2, // 横向
  texts: {
    PORTRAIT: _l('纵向'),
    LANDSCAPE: _l('横向'),
  },
};
export const BAR_LAYOUT_LIST = getList(BAR_LAYOUT);

// 条形码位置
export const BAR_POSITION = {
  TOP: 1, // 顶部
  BOTTOM: 2, // 底部
  texts: {
    TOP: _l('顶部'),
    BOTTOM: _l('底部'),
  },
};
export const BAR_POSITION_LIST = getList(BAR_POSITION);

// 条形码高度
export const BAR_HEIGHT = {
  LARGE: 1, // 大
  MIDDLE: 2, // 中
  SMALL: 3, // 小
  texts: {
    LARGE: _l('大'),
    MIDDLE: _l('中'),
    SMALL: _l('小'),
  },
};
export const BAR_HEIGHT_LIST = getList(BAR_HEIGHT);

function getTextByValue(obj, value) {
  let keys = Object.keys(obj).filter(k => k !== 'texts');
  const matchedKey = _.find(keys, k => obj[k] === value);
  return _.get(obj, 'texts.' + matchedKey);
}

// 获取模板卡片显示信息;
export function getPrintCardInfoOfTemplate(template = {}) {
  const { printType, labelSize, layout } = template;
  const icon =
    {
      [PRINT_TYPE.QR]: 'qr_code',
      [PRINT_TYPE.A4]: 'qr_code',
      [PRINT_TYPE.BAR]: 'a-barcode',
    }[printType] || 'doc';
  let text = '';
  if (labelSize === 100) {
    text = _l('%0 x %1 mm', template.labelCustomWidth, template.labelCustomHeight);
  } else if (printType === PRINT_TYPE.QR) {
    text = getTextByValue(QR_LABEL_SIZE, labelSize);
  } else if (printType === PRINT_TYPE.A4) {
    text = getTextByValue(A4_LAYOUT, layout);
    if (text) {
      text = `A4(${text})`;
    }
  } else if (printType === PRINT_TYPE.BAR) {
    text = getTextByValue(BAR_LABEL_SIZE, labelSize);
  }
  return { icon, text };
}
