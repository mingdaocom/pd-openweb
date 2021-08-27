const stateConfig = {
  // oa还是任务还是工作表
  ENVIRONMENT: {
    TASK: '2',
    OA: '1',
    WORKSHEET: '5',
  },
  // 是oa环境
  isOA: false,
  // 是任务环境
  isTask: false,
  // 是工作表环境
  isWorkSheet: false,
  // 组件拖动状态
  DRAG_STATE: {
    DEFAULT: 0, // 未拖动
    LEFT_HALF_DRAGGING: 1, // 正在拖动左边组件
    LEFT_NORMAL_DRAGGING: 2, // 正在拖动左边组件
    MIDDLE_HALF_DRAGGING: 3, // 正在拖动中间半块组件
    MIDDLE_NORMAL_DRAGGING: 4, // 正在拖动中间全块组件
    OPTIONS_DRAGGING: 5, // 拖拽选项
    LEFT_ANIMATE: 6, // 动画中
    MIDDLE_ANIMATE: 7, // 动画中
  },

  // 拖拽的整行控件的宽度
  DRAG_PREVIEW_WIDGET: 600,

  // 编辑栏组件总数
  EDIT_WIDGET_COUNT: 10,

  // 选项控件数据来源
  OPTIONS_DATA: {
    CUSTOM: 0,
    DATA_SOURCE: 1,
  },

  // 为文本为空的撤销保存的副本
  dataCopy: null,

  // 全局数据信息
  global: {
    version: null,
    sourceId: null,
    templateId: null,
    souceType: null,
    enviroment: null,
    fromURL: null,
  },

  OARequest: () => md.global.Config.FormOAUrl,

  // 防止多次触发拖拽move事件，存下editItem
  lastMoveIn: '',

  // 用于存储widgets信息来进行提交时的对比
  initalWidgets: [[]],

  // 按下拖拽时鼠标位置
  mouseOffset: {
    top: 0,
    left: 0,
  },

  // oa的设置
  uniqueParam: {
    companyId: '',
    typeId: '',
    name: '',
    icon: '101',
    explain: '',
    number: '',
  },

  // 明细字段控件类型
  detailWidgetTypes: [
    'TEXTAREA_INPUT',
    'PHONE_NUMBER',
    'NUMBER_INPUT',
    'MONEY_AMOUNT',
    'MONEY_CN',
    'DROPDOWN',
    'EMAIL_INPUT',
    'DATE_INPUT',
    'DATE_TIME_RANGE',
    'CRED_INPUT',
    'AREA_INPUT',
    'USER_PICKER',
    'GROUP_PICKER',
    'FORMULA',
    'APPLICANT',
    'APPLI_DATE',
    'DEPARTMENT',
    'POSITION',
    'JOB_NUMBER',
    'WORK_PLCAE',
    'WORK_PHONE',
    'MOBILE_PHONE',
    'COMPANY',
    'REMARK',
],

  // 公式type
  formulaType: [
    {
      type: 2,
      name: '求和',
      formulaName: 'SUM',
    },
    {
      type: 3,
      name: '平均值',
      formulaName: 'AVG',
    },
    {
      type: 4,
      name: '最小值',
      formulaName: 'MIN',
    },
    {
      type: 5,
      name: '最大值',
      formulaName: 'MAX',
    },
    {
      type: 6,
      name: '乘积',
      formulaName: 'PRODUCT',
    },
    {
      type: 1,
      name: '自定义',
      formulaName: 'f(x)',
    },
  ],

  formulaEdit: false, // 编辑公式

  // 数据快照
  snapShot: [],

  // 文案
  txt: {},
};

export default stateConfig;
