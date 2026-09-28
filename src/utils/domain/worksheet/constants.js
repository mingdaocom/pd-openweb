import _ from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';

export const APP_ROLE_TYPE = {
  CUSTOM_ROLE: 0, // 自定义角色
  DEVELOPERS_ROLE: 1, // 开发者
  RUNNER_ROLE: 2, // 运营者
  RUNNER_DEVELOPERS_ROLE: 3, // 运营者+开发者
  ADMIN_ROLE: 100, // 管理员角色
  POSSESS_ROLE: 200, // 应用拥有者
  MAP_OWNER: 300,
};

export const WORKSHEET_TABLE_PAGESIZE = 50;

export const SUB_PERMISSION_NAME = {
  100: _l('可见的记录'),
  101: _l('自己拥有的记录'),
};

export const RECORD_INFO_FROM = {
  WORKSHEET: 1,
  WORKSHEET_ROW_LAND: 2,
  CHAT: 3,
  WORKFLOW: 4,
  DRAFT: 21,
};
const enumType = obj => {
  const res = {};
  _.keys(obj).forEach(key => {
    res[(res[key] = obj[key])] = key;
  });
  return res;
};

export const VIEW_DISPLAY_TYPE = enumType({
  0: 'sheet',
  1: 'board',
  4: 'calendar',
  3: 'gallery',
  2: 'structure',
  5: 'gunter',
  6: 'detail',
  7: 'resource',
  21: 'customize',
  8: 'map',
});

export const VIEW_TYPE_ICON = [
  { icon: 'table', color: '#3793FF', text: _l('表格%05017'), id: 'sheet', txt: _l('表格视图') },
  { icon: 'kanban', color: '#00BCD4', text: _l('看板%05016'), id: 'board', txt: _l('看板视图') },
  { icon: 'event', color: '#00C345', text: _l('日历%05015'), id: 'calendar', txt: _l('日历视图') },
  { icon: 'gallery_view', color: '#F5BF00', text: _l('画廊%05014'), id: 'gallery', txt: _l('画廊视图') },
  { icon: 'custom_chrome_reader_mode', color: '#FF9300', text: _l('详情'), id: 'detail', txt: _l('详情视图') },
  { icon: 'hierarchy', color: '#FF3D3D', text: _l('层级%05013'), id: 'structure', txt: _l('层级视图') },
  { icon: 'location_map', color: '#EB2F96', text: _l('地图'), id: 'map', txt: _l('地图视图') },
  { icon: 'gantt', color: '#8A2AEB', text: _l('甘特图%05012'), id: 'gunter', txt: _l('甘特视图') },
  { icon: 'person_three', color: '#2F4EEB', text: _l('资源'), id: 'resource', txt: _l('资源视图') },
  { icon: 'puzzle', color: '#757575', text: _l('插件'), id: 'customize', txt: _l('插件视图') },
];

/** 按钮执行类型 */
export const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

/** 表格行高 */
export const ROW_HEIGHT = [34, 62, 88, 142];

/** 关联记录显示类型 */
export const RELATE_RECORD_SHOW_TYPE = {
  CARD: 1,
  LIST: 2, // 老列表，后面选不了了
  DROPDOWN: 3,
  TABLE: 5,
  TAB_TABLE: 6,
};

/** 关联记录显示类型 */
export const RELATION_SEARCH_SHOW_TYPE = {
  CARD: 1,
  LIST: 2,
  TEXT: 3,
  EMBED_LIST: 5,
  TAB_LIST: 6,
};

/** 工作表表格位置 */
export const WORKSHEETTABLE_FROM_MODULE = {
  APP: 1,
  RELATE_RECORD: 2,
  SUBLIST: 3,
};

export const SYSTEM_CONTROLS = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    controlPermissions: '111',
    type: 26,
    enumDefault: 0,
    display: true,
  },
  {
    controlId: 'caid',
    controlName: _l('创建人'),
    controlPermissions: '100',
    type: 26,
    enumDefault: 0,
    display: true,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    controlPermissions: '100',
    type: 16,
    display: true,
  },
];

export const CONTROL_EDITABLE_WHITELIST = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
  WIDGETS_TO_API_TYPE_ENUM.MONEY,
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
  WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT,
  WIDGETS_TO_API_TYPE_ENUM.DATE,
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
  WIDGETS_TO_API_TYPE_ENUM.SCORE,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
  WIDGETS_TO_API_TYPE_ENUM.CASCADER,
  WIDGETS_TO_API_TYPE_ENUM.SWITCH,
  WIDGETS_TO_API_TYPE_ENUM.LOCATION,
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
  WIDGETS_TO_API_TYPE_ENUM.TIME,
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
];

export const SHEET_VIEW_HIDDEN_TYPES = [
  10010, // REMARK 备注
  22, // SPLIT_LINE 分割线
  43, // OCR
  45, // EMBED 嵌入
  49, // SEARCH_BTN 查询按钮
  51, // RELATION_SEARCH 查询记录
  51, // RELATION_SEARCH 查询记录
  WIDGETS_TO_API_TYPE_ENUM.SECTION, // 标签页
];

// 子表excel导入支持的字段
export const CHILD_TABLE_ALLOW_IMPORT_CONTROL_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.MONEY,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.DATE,
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
  WIDGETS_TO_API_TYPE_ENUM.TIME,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
  WIDGETS_TO_API_TYPE_ENUM.SWITCH,
  WIDGETS_TO_API_TYPE_ENUM.SCORE,
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
];

// 记录点击行为
export const VIEW_CONFIG_RECORD_CLICK_ACTION = {
  OPEN_RECORD: '0',
  OPEN_LINK: '1',
  NONE: '2',
};

// 记录点击行为
export const RECORD_COLOR_SHOW_TYPE = {
  LINE: '0',
  LINE_BG: '1',
  BG: '2',
  // DARK_BG: '3',
};

/**
 * 插件信息
 */
export const PLUGIN_INFO_STATE = {
  DISABLED: 0,
  ENABLED: 1,
  DELETED: 2,
  EXPIRED: 3,
};

export const PLUGIN_INFO_SOURCE = {
  DEVELOPMENT: 0,
  PUBLISH: 1,
  IMPORT: 2,
};

export const CUSTOM_WIDGET_VIEW_STATUS = {
  NORMAL: 1,
  NO_CONFIG: 2,
  NOT_PUBLISH: 3,
  LOAD_SCRIPT_SUCCESS: 4,
  LOAD_SCRIPT_ERROR: 5,
  DELETED: 6,
  DEVELOPING: 7,
  EXPIRED: 8,
};

export const WORKSHEET_ALLOW_SET_ALIGN_CONTROLS = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 座机号码
  WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮箱
  WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
  WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
  WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
  WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
  WIDGETS_TO_API_TYPE_ENUM.TIME, // 时间
  WIDGETS_TO_API_TYPE_ENUM.INTERNATIONAL_AREA, // 国际地区（特殊异化控件）
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 中国地区（省）
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 中国地区（市）
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 中国地区（县）
  WIDGETS_TO_API_TYPE_ENUM.MONEY_CN, // 大写金额
  WIDGETS_TO_API_TYPE_ENUM.SCORE, // 等级
  WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 数值公式
  WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
  WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
  WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 开关
  WIDGETS_TO_API_TYPE_ENUM.SUBTOTAL, // 汇总
  WIDGETS_TO_API_TYPE_ENUM.FORMULA_FUNC, // 公式函数
  WIDGETS_TO_API_TYPE_ENUM.LOCATION, // 定位
  WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联选择
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT, // 富文本
  WIDGETS_TO_API_TYPE_ENUM.FORMULA_DATE, //公式日期时间
];

export const BUTTON_ACTION_TYPE = {
  CLOSE: 1,
  CONTINUE_ADD: 2,
  OPEN_RECORD: 3,
};

export const UPLOAD_TYPE = {
  ATTACHMENT: 1,
  SIGNATURE: 2,
};
