import { DefaultValueOptions, InputType, RangeLengthType } from '../component/widgets/datetimeRange/data';
import { getRequest } from 'src/util';

const isOA = getRequest().sourceType === '1';

export default {
  // 隐藏填充
  EDIT_HIDE: {
    type: -1,
    enumName: 'EDIT_HIDE',
    data: {
      half: true,
    },
  },
  // 填充
  EDIT_FILLER: {
    type: 0,
    enumName: 'EDIT_FILLER',
  },
  // 'TEXT_INPUT': {
  //   'type': 1,
  //   'half': false,
  //   'enumName': 'TEXT_INPUT',
  //   'widgetName': '单行文本框',
  //   'defaultHint': '引导文字',
  //   'data': {
  //     'type': 1,
  //     'controlName': '单行文本框',
  //     'hint': '引导文字',
  //   },
  //   'OAOptions': {
  //     'printHide': false,
  //     'required': true,
  //   },
  // },
  TEXTAREA_INPUT: {
    type: 2,
    showInTask: true,
    enumName: 'TEXTAREA_INPUT',
    icon: 'icon-task_custom_text-box',
    widgetName: _l('文本框'),
    defaultHint: _l('填写文本内容'),
    toggleHalf: true, // 是否支持切换整行、半行
    data: {
      half: false,
      attribute: 0,
      type: 2,
      controlName: _l('文本框'),
      hint: _l('填写文本内容'),
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  PHONE_NUMBER: {
    type: 3,
    showInTask: true,
    enumName: 'PHONE_NUMBER',
    icon: 'icon-task_custom_phone',
    widgetName: _l('电话号码'),
    checkedValue: 3, // 默认选中的'type'
    validateTxt: _l('数字组成'),
    defaultHintArr: [
      {
        type: 3,
        hint: _l('填写手机号码'),
      },
      {
        type: 4,
        hint: _l('填写座机号码'),
      },
    ],
    typeArr: [
      {
        type: 3,
        name: _l('手机'),
      },
      {
        type: 4,
        name: _l('座机'),
      },
    ],
    data: {
      half: true,
      type: 3,
      controlName: _l('手机号码'),
      hint: _l('填写手机号码'),
    },
    OAOptions: {
      validate: true,
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  NUMBER_INPUT: {
    type: 4,
    showInTask: true,
    enumName: 'NUMBER_INPUT',
    icon: 'icon-task_custom_looks_6',
    widgetName: _l('数值'),
    validateTxt: _l('数字组成'),
    defaultHint: _l('填写数值'),
    defaultUnit: _l('个'),
    data: {
      half: true,
      type: 6,
      controlName: _l('数值'),
      hint: _l('填写数值'),
      unit: '个',
      dot: 2,
      needEvaluate: true,
      enumDefault2: 2,
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  MONEY_AMOUNT: {
    type: 5,
    showInTask: true,
    enumName: 'MONEY_AMOUNT',
    icon: 'icon-task_custom_amount_money',
    widgetName: _l('金额'),
    validateTxt: _l('数字组成'),
    defaultHint: _l('填写金额'),
    defaultUnit: _l('元'),
    data: {
      half: true,
      type: 8,
      controlName: _l('金额'),
      hint: _l('填写金额'),
      unit: _l('元'),
      dot: 2,
      needEvaluate: true,
      'enumDefault': 0,
      enumDefault2: 2,
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  MONEY_CN: {
    type: 25,
    showInTask: false,
    enumName: 'MONEY_CN',
    icon: 'icon-task_custom_amount_money_capital',
    widgetName: _l('大写金额'),
    data: {
      half: true,
      type: 25,
      controlName: _l('大写金额'),
      dataSource: null,
    },
    OAOptions: {
      printHide: false,
    },
  },
  OPTIONS: {
    type: 6,
    showInTask: true,
    enumName: 'OPTIONS',
    icon: 'icon-radio',
    widgetName: _l('选项'),
    hasFilter: true, // 有筛选设置
    defaultOption: {
      value: _l('选项'),
      isDeleted: false,
      index: 1,
      checked: false,
    },
    SINGLE: 9, // 单选枚举
    MULTIPLE: 10, // 多选枚举
    typeArr: [
      {
        type: 9,
        name: _l('单选框'),
      },
      {
        type: 10,
        name: _l('多选框'),
      },
    ],
    data: {
      half: false,
      type: 9,
      controlName: _l('选项'),
      hint: _l('请选择'),
      isFilter: true,
      options: [
        { value: _l('选项1'), isDeleted: false, index: 1, checked: true },
        { value: _l('选项2'), isDeleted: false, index: 2, checked: false },
        { value: _l('选项3'), isDeleted: false, index: 3, checked: false },
      ],
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  DROPDOWN: {
    type: 7,
    showInTask: true,
    enumName: 'DROPDOWN',
    icon: 'icon-task_custom_btn_unfold',
    widgetName: _l('单选下拉菜单'),
    defaultHint: _l('请选择'),
    hasFilter: true, // 有筛选设置
    defaultOption: { value: _l('选项'), isDeleted: false, index: 1, checked: false },
    data: {
      half: true,
      type: 11,
      controlName: _l('单选下拉菜单'),
      hint: _l('请选择'),
      isFilter: true,
      sourceType: 1, // 自定义/数据源
      dataSource: '', // 关联的数据源项目 ID
      options: [
        { value: _l('选项1'), isDeleted: false, index: 1, checked: true },
        { value: _l('选项2'), isDeleted: false, index: 2, checked: false },
        { value: _l('选项3'), isDeleted: false, index: 3, checked: false },
      ],
      list: [], // 数据源内容
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  EMAIL_INPUT: {
    type: 9,
    showInTask: true,
    enumName: 'EMAIL_INPUT',
    icon: 'icon-task_custom_markunread',
    widgetName: _l('邮件地址'),
    validateTxt: _l('填写邮件地址'),
    defaultHint: _l('填写邮件地址'),
    data: {
      half: true,
      type: 5,
      controlName: _l('邮件地址'),
      hint: _l('填写邮件地址'),
    },
    OAOptions: {
      validate: true,
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  DATE_INPUT: {
    type: 10,
    showInTask: true,
    enumName: 'DATE_INPUT',
    icon: 'icon-task_custom_today',
    widgetName: _l('时间'),
    checkedValue: 3, // 默认选中的'type'
    defaultArr: [
      {
        value: 1,
        name: _l('不设置'),
      },
      {
        value: 2,
        name: _l('当日'),
      },
      {
        value: 3,
        name: _l('下一天'),
      },
      {
        value: 4,
        name: _l('指定日期'),
      },
    ],
    typeArr: [
      {
        type: 15,
        name: _l('日期'),
      },
      {
        type: 16,
        name: _l('日期和时间'),
      },
    ],
    data: {
      half: true,
      type: 15,
      controlName: _l('时间'),
      enumDefault: 1,
      default: '',
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  DATE_TIME_RANGE: {
    type: 19,
    showInTask: false,
    enumName: 'DATE_TIME_RANGE',
    icon: 'icon-task_custom_event_note',
    widgetName: _l('时间段'),
    typeArr: [
      {
        type: 17,
        name: _l('日期'),
      },
      {
        type: 18,
        name: _l('日期时间'),
      },
    ],
    data: {
      half: false,
      controlName: _l('时间段'),
      type: InputType.DATE,
      enumDefault: DefaultValueOptions.NONE, // 默认项（默认时间段）
      enumDefault2: RangeLengthType.hide, // 是否显示时长统计
      default: '', // 自定义时间段 'start_ms,end_ms'
      dataSource: '0', // 关联的考勤类型
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
  },
  CRED_INPUT: {
    type: 11,
    showInTask: true,
    enumName: 'CRED_INPUT',
    icon: 'icon-task_custom_position',
    widgetName: _l('证件'),
    validateTxt: _l('身份证格式'),
    defaultHintArr: [
      {
        value: 1,
        hint: _l('填写身份证'),
      },
      {
        value: 2,
        hint: _l('填写护照'),
      },
      {
        value: 3,
        hint: _l('填写港澳通行证'),
      },
      {
        value: 4,
        hint: _l('填写台湾通行证'),
      },
    ],
    certArr: [
      {
        value: 1,
        name: _l('身份证'),
      },
      {
        value: 2,
        name: _l('护照'),
      },
      {
        value: 3,
        name: _l('港澳通行证'),
      },
      {
        value: 4,
        name: _l('台湾通行证'),
      },
    ],
    data: {
      half: true,
      type: 7,
      enumDefault: 1,
      controlName: _l('身份证'),
      hint: _l('填写身份证'),
    },
    OAOptions: {
      validate: true,
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  AREA_INPUT: {
    type: 12,
    showInTask: true,
    enumName: 'AREA_INPUT',
    icon: 'icon-task_custom_pin_drop',
    widgetName: _l('地区'),
    typeArr: [
      {
        type: 19,
        name: _l('省'),
      },
      {
        type: 23,
        name: _l('省-市'),
      },
      {
        type: 24,
        name: _l('省-市-县'),
      'dot': 2,
      },
    ],
    data: {
      half: true,
      type: 24,
      controlName: _l('地区'),
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  USER_PICKER: {
    type: 26,
    showInTask: false,
    enumName: 'USER_PICKER',
    icon: 'icon-task_custom_personnel',
    widgetName: _l('人员选择'),
    data: {
      half: true,
      type: 26,
      controlName: _l('人员选择'),
      hint: _l('请选择人员'),
      enumDefault: 0,
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
  },
  GROUP_PICKER: {
    type: 27,
    showInTask: false,
    enumName: 'GROUP_PICKER',
    icon: 'icon-task_custom_department',
    widgetName: _l('部门选择'),
    data: {
      half: true,
      type: 27,
      controlName: _l('部门选择'),
      hint: _l('请选择部门'),
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
  },
  AUTOID: {
    type: 33,
    half: true,
    enumName: 'AUTOID',
    icon: 'icon-task_custom_hash',
    widgetName: _l('自动编号'),
    data: {
      controlName: _l('自动编号'),
      type: 33,
      enumDefault: 0,
      enumDefault2: 3,
    },
    OAOptions: {
      printHide: false,
    },
  },
  SWITCH: {
    type: 36,
    showInTask: false,
    enumName: 'SWITCH',
    icon: 'icon-checkbox_01',
    widgetName: _l('检查框'),
    data: {
      half: true,
      type: 36,
      controlName: _l('检查框'),
    },
    OAOptions: {
      printHide: false,
      required: isOA,
    },
  },
  SUBTOTAL: {
    type: 37,
    enumName: 'SUBTOTAL',
    icon: 'icon-custom_layers',
    widgetName: _l('汇总'),
    data: {
      half: true,
      type: 37,
      controlName: _l('汇总'),
      enumDefault: 6,
      enumDefault2: 6,
    },
    OAOptions: {},
  },
  FORMULA: {
    type: 18,
    showInTask: false,
    enumName: 'FORMULA',
    icon: 'icon-task_custom_iso',
    widgetName: _l('公式'),
    data: {
      half: true,
      type: 20,
      controlName: _l('公式'),
      needEvaluate: true,
      enumDefault2: 2,
      hint: _l('请选择'),
      dataSource: '',
      unit: '',
      dot: 2,
    },
    OAOptions: {
      printHide: false,
    },
  },
  NEW_FORMULA: {
    type: 31,
    showInTask: false,
    enumName: 'NEW_FORMULA',
    icon: 'icon-task_functions',
    widgetName: _l('公式'),
    data: {
      type: 31,
      controlName: _l('公式'),
      half: true,
      enumDefault: 2,
      enumDefault2: 2,
      dataSource: '',
      unit: '',
      dot: 2,
    },
    OAOptions: {
      printHide: false,
    },
  },
  CONCATENATE: {
    type: 32,
    showInTask: false,
    enumName: 'CONCATENATE',
    icon: 'icon-task_composite_text',
    widgetName: _l('文本组合'),
    data: {
      type: 32,
      controlName: _l('文本组合'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  DETAILED: {
    type: 17,
    showInTask: false,
    enumName: 'DETAILED',
    icon: 'icon-task_custom_form',
    widgetName: _l('表单明细'),
    positionArr: [
      {
        'value': 1,
        'name': _l('上方'),
      },
      {
        'value': 0,
        'name': _l('下方'),
      },
      {
        'value': 2,
        'name': _l('上下方'),
      },
    ],
    data: {
      half: false,
      type: 0,
      controlName: _l('表单明细'),
      enumDefault: 0,
      controls: [{ hint: _l('请选择') }, { hint: _l('请选择') }, { hint: _l('请选择') }],
    },
    OAOptions: {
      printHide: false,
    },
  },
  ATTACHMENT: {
    type: 13,
    showInTask: true,
    enumName: 'ATTACHMENT',
    icon: 'icon-task_custom_attachment',
    widgetName: _l('附件'),
    data: {
      half: false,
      type: 14,
      controlName: _l('附件'),
    },
    OAOptions: {
      required: isOA,
    },
    TASKOptions: {
      display: false,
    },
  },
  RELATESHEET: {
    type: 29,
    half: false,
    showInTask: false,
    enumName: 'RELATESHEET',
    icon: 'icon-link-worksheet',
    widgetName: _l('关联表记录'),
    tip: _l('关联多个工作表，联动数据，以反映实际业务关系。例如:《订单》表中，每个订单的“客户”字段从关联的《客户》表里选择1条“客户”记录来填入。'),
    data: {
      controlName: _l('关联表记录'),
      type: 29,
      showControls: [],
      enumDefault: 1, // 数量1-一条， 2-多条
      enumDefault2: 1,
    },
    OAOptions: {},
    TASKOptions: {
      display: false,
    },
  },
  SHEETFIELD: {
    type: 30,
    half: false,
    showInTask: false,
    enumName: 'SHEETFIELD',
    icon: 'icon-lookup',
    widgetName: _l('他表字段'),
    data: {
      controlName: _l('他表字段'),
      type: 30,
      enumDefault: 1,
      dataSource: '',
      sourceControlId: '', // 字段id
      fieldList: [], // 选中的关联表的控件（临时存）
    },
    OAOptions: {},
    TASKOptions: {
      display: false,
    },
  },
  RELATION: {
    type: 21,
    half: false,
    showInTask: true,
    enumName: 'RELATION',
    icon: 'icon-link2',
    widgetName: _l('自由连接'),
    tip: _l('可添加其他项目、任务、文件、审批单等，以卡片(引用链接)形式展示出来。例：一个“产品更新”任务可添加多个“需求”任务卡片，由于只是引用，不会影响被引用的任务本身的子母任务结构'),
    defaultArr: [
      {
        value: 0,
        name: _l('全部'),
      },
      {
        value: 1,
        name: _l('任务'),
      },
      {
        value: 2,
        name: _l('项目'),
      },
      {
        value: 3,
        name: _l('日程'),
      },
      {
        value: 5,
        name: _l('申请单'),
      },
    ],
    data: {
      controlName: _l('自由连接'),
      type: 21,
      enumDefault: 0,
    },
    OAOptions: {
      printHide: false,
    },
  },
  SPLIT_LINE: {
    type: 14,
    showInTask: true,
    enumName: 'SPLIT_LINE',
    icon: 'icon-task_custom_subsection',
    widgetName: _l('分段'),
    data: {
      half: false,
      type: 22,
      controlName: '',
      enumDefault: 1,
    },
    OAOptions: {
      printHide: false,
    },
  },
  SCORE: {
    type: 28,
    half: false,
    showInTask: true,
    enumName: 'SCORE',
    icon: 'icon-task_custom_starred',
    widgetName: _l('等级'),
    scoreArr: [
      {
        type: 1,
        name: _l('1-5颗星'),
      },
      {
        type: 2,
        name: _l('1-10级'),
      },
    ],
    data: {
      controlName: _l('等级'),
      type: 28,
      enumDefault: 1,
    },
    OAOptions: {
      printHide: false,
      required: false,
    },
    TASKOptions: {
      display: false,
    },
  },
  APPLICANT: {
    type: 10001,
    readonly: true,
    enumName: 'APPLICANT',
    icon: 'icon-task_custom_person',
    widgetName: _l('申请人'),
    defaultHint: 'Tom' + _l('（只读）'),
    data: {
      half: true,
      type: 10001,
      controlName: _l('申请人'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  APPLI_DATE: {
    type: 10002,
    readonly: true,
    enumName: 'APPLI_DATE',
    icon: 'icon-task_custom_date_range',
    widgetName: _l('申请日期'),
    defaultHint: '2016-1-1' + _l('（只读）'),
    data: {
      half: true,
      type: 10002,
      controlName: _l('申请日期'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  DEPARTMENT: {
    type: 10003,
    readonly: true,
    enumName: 'DEPARTMENT',
    icon: 'icon-task_custom_flag',
    widgetName: _l('所属部门'),
    defaultHint: _l('销售部') + _l('（只读）'),
    data: {
      half: true,
      type: 10003,
      controlName: _l('所属部门'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  POSITION: {
    type: 10004,
    readonly: true,
    enumName: 'POSITION',
    icon: 'icon-task_custom_assignment_ind',
    widgetName: _l('职位'),
    defaultHint: _l('销售经理') + _l('（只读）'),
    data: {
      half: true,
      type: 10004,
      controlName: _l('职位'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  JOB_NUMBER: {
    type: 10009,
    readonly: true,
    enumName: 'JOB_NUMBER',
    icon: 'icon-task_custom_hash',
    widgetName: _l('工号'),
    defaultHint: '001' + _l('（只读）'),
    data: {
      half: true,
      type: 10009,
      controlName: _l('工号'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  WORK_PLCAE: {
    type: 10005,
    readonly: true,
    enumName: 'WORK_PLCAE',
    icon: 'icon-task_custom_room',
    widgetName: _l('工作地点'),
    defaultHint: _l('上海市') + _l('（只读）'),
    data: {
      half: true,
      type: 10005,
      controlName: _l('工作地点'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  WORK_PHONE: {
    type: 10007,
    readonly: true,
    enumName: 'WORK_PHONE',
    icon: 'icon-task_custom_settings_phone',
    widgetName: _l('工作电话'),
    defaultHint: '021-XXXXXXX' + _l('（只读）'),
    data: {
      half: true,
      type: 10007,
      controlName: _l('工作电话'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  MOBILE_PHONE: {
    type: 10008,
    readonly: true,
    enumName: 'MOBILE_PHONE',
    icon: 'icon-task_custom_phone_android',
    widgetName: _l('移动电话'),
    defaultHint: '13011111111' + _l('（只读）'),
    data: {
      half: true,
      type: 10008,
      controlName: _l('移动电话'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  COMPANY: {
    type: 10006,
    readonly: true,
    enumName: 'COMPANY',
    icon: 'icon-task_custom_ic_task_internet',
    widgetName: _l('组织'),
    defaultHint: _l('（只读）'),
    data: {
      half: true,
      type: 10006,
      controlName: _l('组织'),
    },
    OAOptions: {
      printHide: false,
    },
  },
  REMARK: {
    type: 10010,
    enumName: 'REMARK',
    showInTask: true,
    icon: 'icon-task_custom_mode_edit',
    widgetName: _l('备注'),
    defaultHint: _l('在此添加 注意事项 或 填写要求 等，来指导使用者(或填写者)正确地操作'),
    tip: _l('把注意事项或填写要求作为“备注”加入，来指导使用者(或填写者)正确使用'),
    data: {
      half: false,
      type: 10010,
      controlName: _l('备注'),
      dataSource: '',
    },
    OAOptions: {
      printHide: false,
    },
  },
};
