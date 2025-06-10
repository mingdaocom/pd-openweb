export const DEFAULT_INTRO_LINK = 'https://help.mingdao.com/worksheet/controls';
export const OPTION_COLORS_LIST = [
  '#C9E6FC',
  '#C3F2F2',
  '#C2F1D2',
  '#FEF6C6',
  '#FFE5C2',
  '#FDCACA',
  '#FACDE6',
  '#DEC2FA',
  '#CCD2F1',
  '#D3D3D3',
  '#2196F3',
  '#08C9C9',
  '#00C345',
  '#FAD714',
  '#FF9300',
  '#F52222',
  '#EB2F96',
  '#7500EA',
  '#2D46C4',
  '#484848',
];
export const OPTION_COLORS_LIST_HOVER = [
  '#1E85D9',
  '#07B0B0',
  '#00A83B',
  '#E0C112',
  '#E68600',
  '#DB1F1F',
  '#D12A86',
  '#6900D1',
  '#273DAB',
  '#2E2E2E',
  '#A3D6FF',
  '#A9E9E9',
  '#A3E9BC',
  '#FDF1AA',
  '#FFD8A3',
  '#FCAFAF',
  '#F8B4D9',
  '#CDA3F8',
  '#B3BCEA',
  '#BDBDBD',
];
/* 不可以作为标题字段的控件
  36: 检查框
  14：附件
  10010：备注
  21：自由连接
  22：分割线
  34: 子表
  45: 嵌入
  49: 查询按钮
*/
export const NOT_AS_TITLE_CONTROL = [14, 10010, 21, 22, 29, 34, 35, 36, 37, 41, 42, 43, 45, 47, 49, 51, 52, 54];

/**
 * 不需要设置只读的控件
 * 22： 分割线
 * 25: 大写金额
 * 30：他表字段
 * 31：公式
 * 32：文本组合
 * 33：自动编号
 * 10010: 备注
 * 45: 嵌入
 * 47: 条码
 * 51: 查询记录
 * 52: 分段
 * 53: 函数公式
 * 54: 自定义
 */
export const NOT_NEED_SET_READONLY_CONTROL = [22, 25, 30, 31, 32, 33, 37, 38, 43, 45, 47, 51, 52, 53, 54, 10010];

/**
 * 无内容控件: 备注、分割线,
 *
 */
export const NO_CONTENT_CONTROL = [10010, 22];

/**
 * 无引导文字控件
 * 33: 自动编号
 * 36: 开关
 */

export const HAS_EXPLAIN_CONTROL = [2, 3, 4, 5, 6, 7, 8, 14, 15, 16, 35, 43, 46, 49, 50];

/**
 * 没有自定义配置的控件
 * 邮件
 * 检查框
 * 富文本
 * 签名
 */
export const NO_CUSTOM_SETTING_CONTROL = [5, 41, 42];

export const HAS_DYNAMIC_DEFAULT_VALUE_CONTROL = [
  2, 3, 4, 5, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 35, 36, 40, 41, 46, 48,
];

// 无描述控件
export const NO_DES_WIDGET = [22, 10010];

// 无验证
export const NO_VERIFY_WIDGET = [
  6, 14, 21, 22, 25, 29, 30, 31, 32, 33, 34, 37, 38, 43, 45, 47, 49, 51, 52, 53, 54, 10010,
];

// 有提示文案的控件
export const HAS_WARNING_CONTROL = [30, 31, 32, 37, 38, 53];

// 不能作为文本组合的字段类型
export const CAN_NOT_AS_TEXT_GROUP = [14, 21, 22, 34, 36, 41, 42, 43, 45, 47, 49, 51, 52, 10010];

// 不能被他表字段引用的控件
export const CAN_NOT_AS_OTHER_FIELD = [20, 22, 25, 29, 34, 35, 43, 45, 47, 49, 50, 51, 52, 10010];

// 需要单独显示样式的控件
export const NEED_SPECIAL_DISPLAY_CONTROLS = [
  2, 6, 9, 10, 11, 14, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 34, 35, 36, 38, 40, 41, 42, 43, 47, 48, 49, 51, 52, 53,
  10010,
];

// 独占一行的控件
export const FULL_LINE_CONTROL = [21, 22, 34, 41, 52];

export const NOT_NEED_DELETE_CONFIRM = [22, 25, 30, 31, 32, 37, 38, 43, 52, 53, 10010];

// 没有宽度设置的控件
export const NOT_HAVE_WIDTH_CONFIG = [43, 49, 52];

export const MAX_CONTROLS_COUNT = 2000;
export const MAX_OPTIONS_COUNT = 1000;

export const HAVE_CONFIG_SUB_LIST = [2, 3, 10, 15, 16, 28, 32, 35, 46];

// 有字段掩码的字段
export const HAVE_MASK_WIDGET = [3, 4, 5, 7, 8];

// 有操作的控件
export const HAVE_OPTION_WIDGET = [14, 29, 34];

// 有表格样式的控件
export const HAVE_TABLE_STYLE_WIDGET = [34];

// 有高级设置的控件
export const HAVE_HIGH_SETTING_WIDGET = [2, 6, 10, 14, 15, 16, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 38, 40, 42, 46];

// 有移动端设置的控件
export const HAVE_MOBILE_WIDGET = [2, 29, 34, 43];

// 有字段值样式设置的控件
export const HAVE_VALUE_STYLE_WIDGET = [3, 4, 5, 6, 7, 8, 15, 16, 19, 23, 24, 25, 31, 32, 33, 37, 38, 46, 53];

// 没有必填的控件
export const UN_REQUIRED_WIDGET = [31, 38, 33, 25, 32, 43, 47, 45, 49, 30, 21, 37, 22, 51, 52, 53, 54, 10010];

// 支持在关联表中可以被搜索的控件
export const SUPPORT_RELATE_SEARCH = [2, 3, 4, 5, 7, 33, 50];
