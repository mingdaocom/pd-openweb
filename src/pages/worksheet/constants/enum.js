import _ from 'lodash';
export const APP_ROLE_TYPE = {
  CUSTOM_ROLE: 0, // 自定义角色
  DEVELOPERS_ROLE: 1, // 开发者
  RUNNER_ROLE: 2, // 运营者
  RUNNER_DEVELOPERS_ROLE: 3, // 运营者+开发者
  ADMIN_ROLE: 100, // 管理员角色
  POSSESS_ROLE: 200, // 应用拥有者
  MAP_OWNER: 300,
};

export const WORKSHEET_SOURCE_TYPE = {
  WORKSHEET: 1,
  APP: 2,
};

export const WORKSHEET_DETAIL_TYPE = {
  DESCRIPTION: 1,
  CHARGE: 2,
  ADMIN: 3,
  MEMBERS: 4,
};

export const WORKSHEET_DETAIL_TYPE_NAME = {
  DESCRIPTION: _l('工作表描述'),
  CHARGE: _l('负责人'),
  ADMIN: _l('管理员'),
  MEMBERS: _l('普通成员'),
};

export const WORKSHEET_TABLE_PAGESIZE = 50;

export const MEMBER_ORIGIN_TYPE = {
  DEFAULT: 0,
  APKROLE: 1,
  APK: 2,
  ALL: 99,
};

export const COMMON_ROLE_TYPE = {
  ALL: 99,
  MAIN_WEB: 0,
  APP_PACKAGE: 1,
  APP: 2,
  WORKSHEET: 3,
  KC: 4,
  FOLDER: 5,
};

export const WORKSHEET_ROLE_TYPE = {
  NONE: 0,
  ADMIN: 1, // 管理员
  PREFABRICATED_ADMIN: 2, // 预制管理员
  PREFABRICATED: 3, // 预制成员
  OBSERVER: 4, // 查看者
  WOKESHEETNOTICE: 5, // 工作表通知者
  ALLROLE: 99, // 所有
  CHARGE: 9999, // 负责人
};

export const WORKSHEET_ROLE_NAME = {
  CHARGE: _l('负责人'),
  2: _l('管理员'),
  3: _l('普通成员'),
  5: _l('通知人'),
};

export const WORKSHEET_ROLE_DESC = {
  CHARGE: _l('拥有工作表所有权限'),
  2: _l('除删除工作表以外的所有权限'),
  5: _l('当增加、删除记录时将收到通知。同时拥有普通成员的权限'),
};

export const USER_ROLE_STATUS = {
  ALL: 0, // 查询使用
  NORMAL: 1, // 正常
  UNAUDITED: 2, // 申请未审批
  REFUSED: 3, // 拒绝申请
};

export const PERMISSION_TYPE = {
  VISIBLE: 301, // 可见
  EDIT: 302, // 编辑
  SHARE: 303, // 分享
  EXPORT: 304, // 导出
};

export const SUB_PERMISSION_TYPE = {
  ALL: 100,
  MY: 101,
};

export const SUB_PERMISSION_NAME = {
  100: _l('可见的记录'),
  101: _l('自己拥有的记录'),
};

export const PERMISSION_TYPE_NAME = {
  301: _l('可见'), // 可见
  302: _l('编辑'), // 可编辑
  303: _l('分享'), // 分享
  304: _l('导出'), // 导出
};

export const PERMISSION_RESULT_TYPE = {
  NONE: 0, // 无权限
  ALL: 1, // 所有
  SELF: 2, // 自己的
};

export const RECORD_INFO_FROM = {
  WORKSHEET: 1,
  WORKSHEET_ROW_LAND: 2,
  CHAT: 3,
  WORKFLOW: 4,
  DRAFT: 21,
};
export const controlName = {
  2: _l('文本框'),
  3: _l('电话号码'),
  4: _l('电话号码'),
  5: _l('邮件地址'),
  6: _l('数值'),
  7: _l('证件'),
  8: _l('金额'),
  9: _l('选项'),
  10: _l('选项'),
  11: _l('单选下拉菜单'),
  14: _l('附件'),
  15: _l('时间'),
  16: _l('时间'),
  17: _l('时间段'),
  18: _l('时间段'),
  19: _l('地区'),
  20: _l('公式'),
  21: _l('自由连接'),
  23: _l('地区'),
  24: _l('地区'),
  25: _l('大写金额'),
  26: _l('人员选择'),
  27: _l('部门选择'),
  28: _l('等级'),
  29: _l('关联他表'),
  30: _l('他表字段'),
  31: _l('公式'),
  32: _l('文本组合'),
  33: _l('自动编号'),
  36: _l('检查项'),
  10010: _l('备注'),
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
});

export const VIEW_TYPE_ICON = [
  { icon: 'view', color: '#ffa515', text: _l('表格%05017'), id: 'sheet' },
  { icon: 'kanban', color: '#4CAF50', text: _l('看板%05016'), id: 'board' },
  { icon: 'event', color: '#F64082', text: _l('日历%05015'), id: 'calendar' },
  { icon: 'gallery_view', color: '#3949ab', text: _l('画廊%05014'), id: 'gallery' },
  { icon: 'hierarchy', color: '#9C27AF', text: _l('层级%05013'), id: 'structure' },
  { icon: 'gantt', color: '#01BCD5', text: _l('甘特图%05012'), id: 'gunter' },
];

export const WORKSHEET_VIEW_PAGE_SIZE = {
  0: 50,
  1: 50,
  2: 100,
  3: 50,
  4: 1000,
};

/** 按钮执行类型 */
export const CUSTOM_BUTTOM_CLICK_TYPE = {
  IMMEDIATELY: 1,
  CONFIRM: 2,
  FILL_RECORD: 3,
};

/** 表格行高 */
export const ROW_HEIGHT = [34, 62, 88, 142];

/** 单元格渲染类型 */
export const CELL_RENDER_TYPE = {
  STRING: 0,
  HTML: 1,
  COMPONENT: 2,
};

/** 关联记录显示类型 */
export const RELATE_RECORD_SHOW_TYPE = {
  CARD: 1,
  LIST: 2,
  DROPDOWN: 3,
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
    controlName: _l('创建者'),
    controlPermissions: '100',
    type: 26,
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

export const CONTROL_EDITABLE_BLACKLIST = [22, 25, 30, 31, 32, 33, 34, 37, 42, 45, 47];

export const SHEET_VIEW_HIDDEN_TYPES = [
  10010, // REMARK 备注
  22, // SPLIT_LINE 分割线
  43, // OCR
  45, // EMBED 嵌入
  49, // SEARCH_BTN 查询按钮
];
