import PropTypes from 'prop-types';

export const commonPropTypes = {
  flag: PropTypes.any,
  initSource: PropTypes.bool,
  from: PropTypes.number,
  projectId: PropTypes.string,
  worksheetId: PropTypes.string,
  recordId: PropTypes.string,
  appId: PropTypes.string,
  groupId: PropTypes.string,
  viewId: PropTypes.string,
  data: PropTypes.array,
  recordCreateTime: PropTypes.string,
  disabled: PropTypes.bool,
  forceFull: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disableRules: PropTypes.bool,
  isCreate: PropTypes.bool, // 是否新建
  widgetStyle: PropTypes.object, // 表单样式配置
  ignoreLock: PropTypes.bool, // 是否忽略锁定记录
  isRecordLock: PropTypes.bool, // 记录锁定，真锁定
  ignoreHideControl: PropTypes.bool, // 忽略隐藏控件
  verifyAllControls: PropTypes.bool, // 是否校验全部字段
  isWorksheetQuery: PropTypes.bool, // 是否配置工作表查询
  masterRecordRowId: PropTypes.string, // 主记录id
  smsVerificationFiled: PropTypes.string, // 公开表单设置短信验证字段id
  smsVerification: PropTypes.bool, // 公开表单是否设置短信验证
  sheetSwitchPermit: PropTypes.array, // 工作表业务板块权限
  rules: PropTypes.arrayOf(PropTypes.shape({})), // 业务规则
  searchConfig: PropTypes.arrayOf(PropTypes.shape({})), // 工作表查询配置
  getMasterFormData: PropTypes.func,
  openRelateSheet: PropTypes.func,
  registerCell: PropTypes.func,
  checkCellUnique: PropTypes.func,
  onFormDataReady: PropTypes.func,
  onWidgetChange: PropTypes.func,
  onRulesLoad: PropTypes.func,
  onSave: PropTypes.func,
  customWidgets: PropTypes.object, // 自定义组件 { key: value } key: control type, value: widget
  onManualWidgetChange: PropTypes.func, // 手动更新表单数据
  // 补充
  ignoreSection: PropTypes.any,
  tabControlProp: PropTypes.object,
  isDraft: PropTypes.any,
  handleEventPermission: PropTypes.func,
  systemControlData: PropTypes.array,
  controlProps: PropTypes.object,
  className: PropTypes.string,
};

export const commonDefaultProps = {
  initSource: false,
  widgetStyle: {},
  getMasterFormData: () => {},
  onChange: () => {},
  onBlur: () => {},
  openRelateSheet: () => {},
  registerCell: () => {},
  onFormDataReady: () => {},
  customWidgets: {},
  tabControlProp: {},
  handleEventPermission: () => {},
  systemControlData: [],
  controlProps: {},
};

// 移动端表单
export const mobileFormPropTypes = {
  ...commonPropTypes,
};

export const mobileFormDefaultProps = {
  ...commonDefaultProps,
};

// 桌面端表单
export const desktopFormPropTypes = {
  ...commonPropTypes,
};

export const desktopFormDefaultProps = {
  ...commonDefaultProps,
};
