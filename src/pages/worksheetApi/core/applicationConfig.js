export const AddWorksheetParam = [
  {
    name: 'appKey',
    required: _l('是'),
    type: 'string',
    desc: 'AppKey',
  },
  {
    name: 'sign',
    required: _l('是'),
    type: 'string',
    desc: _l('签名'),
  },
  {
    name: 'name',
    required: _l('是'),
    type: 'string',
    desc: _l('工作表名称'),
  },
  {
    name: 'alias',
    required: _l('否'),
    type: 'string',
    desc: _l('别名'),
  },
  {
    name: 'controls',
    required: _l('是'),
    type: 'list',
    desc: _l('控件数据'),
  },
];

export const DATA_PIPELINE_MENUS = ['FieldTable', 'ViewTable', 'List', 'GetDetail', 'GetDetailPost', 'TotalNum'];
export const DATA_PIPELINE_FILTERS = {
  List: ['viewId', 'listType'],
  TotalNum: ['viewId'],
};

export const MENU_LIST = [
  {
    id: 'FieldTable',
    title: _l('字段对照表'),
    btnText: _l('设置字段别名'),
    type: 'control',
    fields: [
      { key: 'controlId', text: _l('字段ID(别名)'), className: 'w25 minWidthControlId' },
      { key: 'controlName', text: _l('字段名称'), className: 'w20 mLeft20' },
      { key: 'controlType', text: _l('字段类型(编号|名称)'), className: 'w28 mLeft20' },
      { key: 'desc', text: _l('说明'), className: 'w32 mLeft20' },
    ],
  },
  {
    id: 'ViewTable',
    title: _l('视图对照表'),
    btnText: _l('设置视图别名'),
    type: 'view',
    fields: [
      { key: 'viewId', text: _l('视图ID'), className: 'w46 minWidthViewId' },
      { key: 'name', text: _l('视图名称'), className: 'w32 mLeft20' },
      { key: 'viewType', text: _l('类型'), className: 'w22 mLeft20' },
    ],
  },
];

const sameHeader = [
  {
    title: _l('枚举值'),
    key: 'name',
    width: 25,
  },
  {
    title: _l('枚举字符'),
    key: 'type',
    width: 25,
  },
  {
    title: _l('说明'),
    key: 'desc',
    width: 50,
  },
];

export const MENU_LIST_APPENDIX_HEADER = {
  Filter: [
    {
      title: _l('参数'),
      key: 'name',
      width: 18,
    },
    {
      title: _l('必填'),
      key: 'required',
      width: 18,
    },
    {
      title: _l('类型'),
      key: 'type',
      width: 18,
    },
    {
      title: _l('说明'),
      key: 'desc',
      width: 46,
    },
  ],
  DataTypeEnum: [
    {
      title: _l('枚举值'),
      key: 'name',
      width: 25,
    },
    {
      title: _l('控件类型'),
      key: 'type',
      width: 25,
    },
    {
      title: _l('说明'),
      key: 'desc',
      width: 50,
    },
  ],
  FilterTypeEnum: sameHeader,
  DateRangeEnum: sameHeader,
  AccountID: [
    {
      title: 'ID',
      key: 'name',
      width: 50,
    },
    {
      title: _l('说明'),
      key: 'desc',
      width: 50,
    },
  ],
  ErrorCode: [
    {
      title: 'ErrorCode',
      key: 'name',
      width: 50,
    },
    {
      title: _l('说明'),
      key: 'desc',
      width: 50,
    },
  ],
};

export const SIDEBAR_LIST = [
  {
    key: 'authorizationInstr',
    title: _l('授权管理'),
  },
  {
    key: 'mcpServer',
    title: _l('MCP'),
  },
  {
    key: 'whiteList',
    title: _l('IP 白名单'),
  },
  {
    key: 'worksheetCreateForm',
    title: _l('工作表'),
    render: 'renderWorksheetSide',
  },
  {
    key: 'dataPipeline',
    title: _l('聚合表'),
    render: 'renderDataPipelineSide',
  },
  // {
  //   key: 'workflow',
  //   title: _l('工作流'),
  //   render: 'renderWorkflow',
  // },
];

export const ADD_API_CONTROLS = [
  {
    controlName: _l('文本'), //控件名称
    alias: _l('字段别名'),
    type: 2, //控件编号 2:文本,3:手机,4:座机,5:邮箱,15:日期,16:日期时间,19:地区—省,23:地区—省—市,24:地区—省—市—县
    required: true, //true：必填,false：非必填
  },
  {
    controlName: _l('数值'), //控件名称
    alias: _l('字段别名'),
    type: 6, // 6:数值,8:金额
    dot: 2, //保留小数位（0-14）
    required: true, //true：必填,false：非必填
  },
  {
    controlName: _l('单选'), //控件名称
    alias: _l('字段别名'),
    type: 11, //控件编号 11:单选,10:多选
    options: [
      {
        value: _l('选项名称1'),
        index: 1, //排序
      },
      {
        value: _l('选项名称2'),
        index: 2, //排序
      },
    ],
    required: true, //true：必填,false：非必填
  },
  {
    controlName: _l('多选'), //控件名称
    alias: _l('字段别名'),
    type: 10, //控件编号 11:单选,10:多选
    options: [
      {
        value: _l('选项名称1'),
        index: 1, //排序
      },
      {
        value: _l('选项名称2'),
        index: 2, //排序
      },
      {
        value: _l('选项名称3'),
        index: 3, //排序
      },
    ],
    required: true, //true：必填,false：非必填
  },
  {
    controlName: _l('时间-时分'),
    alias: _l('字段别名'),
    type: 46,
    required: true,
    unit: 1, // 1时分，6时分秒
  },
  {
    controlName: _l('时间-时分秒'),
    alias: _l('字段别名'),
    type: 46,
    required: true,
    unit: 6, // 1时分，6时分秒
  },
  {
    controlName: _l('成员-单选'),
    type: 26,
    alias: _l('字段别名'),
    enumDefault: 0,
    required: true,
  },
  {
    controlName: _l('成员-多选'),
    type: 26,
    alias: _l('字段别名'),
    enumDefault: 1,
    required: true,
  },
  {
    controlName: _l('附件'),
    alias: _l('字段别名'),
    type: 14,
    required: true,
  },
  {
    controlName: '日期',
    alias: '字段别名',
    type: 15,
    required: true,
  },
  {
    controlName: '日期时间',
    alias: '字段别名',
    type: 16,
    required: true,
  },
];

export const ADD_WORKSHEET_SUCCESS = {
  data: _l('工作表ID'),
  success: true,
  error_code: 1,
};

// 获取工作表结构信息成功返回
export const WORKSHEETINFO_SUCCESS_DATA = {
  data: {
    worksheetId: _l('工作表id'),
    name: _l('工作表名称'),
    views: [
      {
        viewId: _l('视图id'),
        name: _l('视图名称'),
      },
    ],
    controls: [
      {
        controlId: _l('控件id'),
        controlName: _l('控件名称'),
        type: _l('控件类型，参考枚举'), // 控件类型，参考枚举
        attribute: _l('属性 1：标题'), //属性 1：标题
        row: 1,
        col: 1,
        hint: _l('引导文字'),
        default: '',
        dot: _l('当type=6时，表示保留小数位（0-14）'),
        unit: _l('单位，当type=46时，1：时分，6：时分秒'),
        enumDefault: _l('1多选，0单选'),
        enumDefault2: '',
        defaultMen: [],
        dataSource: _l('源数据'),
        sourceControlId: _l('源控件id'),
        sourceControlType: _l('源控件类型'),
        showControls: [_l('显示字段id')],
        noticeItem: _l('当type=26时，通知项0：不通知 1：添加通知'),
        userPermission: _l('当type=26时，权限 0：仅录入 1：成员  2：拥有者'),
        options: [
          {
            value: _l('当type=11/10时,表示选项名称'),
            index: _l('排序'), //排序
          },
        ],
        required: _l('true：必填,false：非必填'),
        half: false,
        relationControls: [],
        viewId: _l('视图Id'),
        controlPermissions: '111',
        unique: false,
        coverCid: '',
        strDefault: _l('通用string字段,参考说明'),
        desc: _l('字段描述'),
        alias: _l('别名（API用）'),
        fieldPermission: _l('空或者 "111"，第一位能否查看，第二位能否编辑（只读），第三位能否添加； 1：能，0：不能'),
      },
    ],
  },
};

export const BATCH_ADD_WORKSHEET_SUCCESS = {
  data: [_l('工作表ID')],
  success: true,
  error_code: 1,
};
