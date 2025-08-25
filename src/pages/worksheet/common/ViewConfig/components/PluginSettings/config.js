export const PARAM_TYPES = [
  {
    fieldId: 'field',
    type: 200,
    paramName: _l('字段选择器'),
  },
  {
    fieldId: 'relationfield',
    type: 200,
    sourceControlType: 29,
    paramName: _l('关联字段选择器'),
  },
  {
    fieldId: 'text',
    type: 2,
    paramName: _l('字符串'),
  },
  {
    fieldId: 'numeric',
    type: 6,
    paramName: _l('数值'),
  },
  {
    fieldId: 'enum',
    type: 11,
    paramName: _l('枚举值'),
  },
  {
    fieldId: 'boolean',
    type: 36,
    paramName: _l('布尔值'),
  },
  {
    fieldId: 'group',
    type: 22,
    paramName: _l('分组标题'),
  },
];

//允许选择的字段类型
// 需要排除的字段类型有：文本识别、大写金额、条码、API查询、嵌入、查询记录、自由连接、分段、备注、标签页
export const controlTypeList = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 19, 23, 24, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41,
  42, 46, 48,
];
export const controlKeyNames = {
  controlName: _l('名称'),
  desc: _l('说明'),
  des: _l('内容'),
  allowitem: _l('允许选择数量'),
  controls: _l('允许选择的字段类型'),
  showControls: _l('允许选择的字段类型'),
  max: _l('最大数量'),
  // norange: _l('不限'),
  defsource: _l('默认值'),
  suffix: _l('单位'),
  dot: _l('小数位数'),
  checktype: _l('显示方式'),
  direction: _l('排列方式'),
  showtype: _l('显示方式'),
  options: _l('选项'),
};
export const controlKeys = {
  field: ['controlName', 'fieldId', 'desc', 'allowitem', 'controls', 'max'], //字段选择器
  relationfield: ['controlName', 'fieldId', 'desc', 'allowitem', 'controls', 'showControls', 'max'], //关联字段选择器
  text: ['controlName', 'fieldId', 'desc', 'defsource'], //字符串
  numeric: ['controlName', 'fieldId', 'desc', 'suffix', 'dot', 'defsource'], //数值
  enum: ['controlName', 'fieldId', 'desc', 'checktype', 'direction', 'options'], //枚举值
  boolean: ['controlName', 'fieldId', 'des', 'desc', 'showtype', 'defsource'], //布尔值
  group: ['controlName', 'fieldId', 'desc'], //分组标题
};

export const defaultData = (type, info) => {
  let data = info;
  switch (type) {
    case 200:
      data = {
        advancedSetting: {
          allowitem: '0',
        },
      };
      if (info.sourceControlType === 29) {
        data.sourceControlType = info.sourceControlType;
        data.controls = ['29'];
      }
      break;
    case 22:
      data = {
        type: 22,
        attribute: 0,
        hint: '',
        default: '',
        dot: 0,
        unit: '',
        enumDefault: 0,
        enumDefault2: 1,
        defaultMen: [],
        dataSource: '',
        sourceControlId: '',
        sourceControlType: 0,
        showControls: [],
        noticeItem: 0,
        userPermission: 0,
        options: [],
        required: false,
        half: false,
        relationControls: [],
        viewId: '',
        unique: false,
        coverCid: '',
        strDefault: '',
        desc: '',
        fieldPermission: '',
        alias: '',
        size: 12,
        editAttrs: [],
        deleteAccountId: '',
        deleteTime: '0001-01-01 08:05:00',
        encryId: '',
        sectionId: '',
        remark: '',
        lastEditTime: '0001-01-01 00:00:00',
        disabled: false,
        checked: false,
      };

      break;
    case 2:
      data = {
        type: 2,
        hint: '请填写',
        default: '',
        dot: 0,
        unit: '',
        enumDefault: 2,
        enumDefault2: 0,
        defaultMen: [],
        dataSource: '',
        sourceControlId: '',
        sourceControlType: 0,
        showControls: [],
        noticeItem: 0,
        userPermission: 0,
        options: [],
        required: false,
        half: false,
        relationControls: [],
        viewId: '',
        unique: false,
        coverCid: '',
        strDefault: '',
        desc: '',
        fieldPermission: '',
        advancedSetting: {
          analysislink: '1',
          sorttype: 'en',
          min: '',
          max: '',
        },
        alias: '',
        size: 12,
        editAttrs: [],
        deleteAccountId: '',
        deleteTime: '0001-01-01 08:05:00',
        encryId: '',
        sectionId: '',
        lastEditTime: '0001-01-01 00:00:00',
        disabled: false,
        checked: false,
      };
      break;
    case 6:
      data = {
        type: 6,
        hint: '请填写数值',
        default: '',
        dot: 0,
        unit: '',
        enumDefault: 0,
        enumDefault2: 0,
        defaultMen: [],
        dataSource: '',
        sourceControlId: '',
        sourceControlType: 0,
        showControls: [],
        noticeItem: 0,
        userPermission: 0,
        options: [],
        required: false,
        half: false,
        relationControls: [],
        viewId: '',
        unique: false,
        coverCid: '',
        strDefault: '',
        desc: '',
        fieldPermission: '',
        advancedSetting: {
          showtype: '0',
          roundtype: '2',
          thousandth: '0',
          min: '',
          max: '',
          sorttype: 'zh',
          numshow: '0',
        },
        alias: '',
        size: 6,
        editAttrs: [],
        deleteAccountId: '',
        deleteTime: '0001-01-01 08:05:00',
        encryId: '',
        sectionId: '',
        lastEditTime: '0001-01-01 00:00:00',
        disabled: false,
        checked: false,
      };
      break;
    case 11:
      data = {
        type: 11,
        hint: '请选择',
        default: '[]',
        dot: 0,
        unit: '',
        enumDefault: 0,
        enumDefault2: 0,
        defaultMen: [],
        dataSource: '',
        sourceControlId: '',
        sourceControlType: 0,
        showControls: [],
        noticeItem: 0,
        userPermission: 0,
        options: [],
        required: false,
        half: false,
        value: '[]',
        relationControls: [],
        viewId: '',
        unique: false,
        coverCid: '',
        strDefault: 'index',
        desc: '',
        fieldPermission: '',
        advancedSetting: {
          showtype: '1',
          sorttype: 'zh',
          direction: '2',
          checktype: '1',
        },
        alias: '',
        size: 6,
        editAttrs: [],
        deleteAccountId: '',
        deleteTime: '0001-01-01 08:05:00',
        encryId: '',
        sectionId: '',
        lastEditTime: '0001-01-01 00:00:00',
        disabled: false,
        checked: false,
      };
      break;
    case 36:
      data = {
        type: 36,
        hint: '',
        default: '',
        dot: 0,
        unit: '',
        enumDefault: 0,
        enumDefault2: 0,
        defaultMen: [],
        dataSource: '',
        sourceControlId: '',
        sourceControlType: 0,
        showControls: [],
        noticeItem: 0,
        userPermission: 0,
        options: [],
        required: false,
        half: false,
        relationControls: [],
        viewId: '',
        unique: false,
        coverCid: '',
        strDefault: '',
        desc: '',
        fieldPermission: '',
        advancedSetting: {
          defsource: '[{"cid":"","rcid":"","staticValue":false}]',
          showtype: '0',
          sorttype: 'zh',
        },
        alias: '',
        size: 6,
        editAttrs: [],
        deleteAccountId: '',
        deleteTime: '0001-01-01 08:05:00',
        encryId: '',
        sectionId: '',
        lastEditTime: '0001-01-01 00:00:00',
        disabled: false,
        checked: false,
      };
      break;
    default:
      break;
  }
  return { ...data, ...info };
};

export const ALLOW_ITEM_TYPES = [
  {
    value: '0',
    text: _l('单选'),
  },
  {
    value: '1',
    text: _l('多选'),
  },
];
export const SHOW_ITEM_TYPES = [
  {
    value: '1',
    text: _l('平铺'),
  },
  {
    value: '0',
    text: _l('下拉框'),
  },
];
export const BOOLEAN_SHOW_ITEM_TYPES = [
  {
    value: '0',
    text: _l('勾选框'),
  },
  {
    value: '1',
    text: _l('开关'),
  },
];
export const MULTI_SELECT_DISPLAY = [
  {
    value: '2',
    text: _l('横向排列'),
  },
  {
    value: '1',
    text: _l('纵向排列'),
  },
];
export const BOOLEAN_ITEM_DEFAULT = [
  {
    value: false,
    text: _l('未选中'),
  },
  {
    value: true,
    text: _l('选中'),
  },
];
