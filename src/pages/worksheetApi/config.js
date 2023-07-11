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

export const sameParameters = [
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
    name: 'worksheetId',
    required: _l('是'),
    type: 'string',
    desc: _l('工作表ID'),
  },
];

export const appInfoParameters = [
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
];

export const MENU_LIST = [
  {
    id: 'Table',
    title: _l('字段对照表'),
  },
  {
    id: 'List',
    title: _l('获取列表 POST'),
    apiName: 'worksheet/getFilterRows',
    data: sameParameters.concat([
      {
        name: 'viewId',
        required: _l('是'),
        type: 'string',
        desc: _l('视图ID'),
      },
      {
        name: 'pageSize',
        required: _l('是'),
        type: 'number',
        desc: _l('行数'),
      },
      {
        name: 'pageIndex',
        required: _l('是'),
        type: 'number',
        desc: _l('页码'),
      },
      {
        name: 'sortId',
        required: _l('否'),
        type: 'string',
        desc: _l('排序字段ID'),
      },
      {
        name: 'isAsc',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否升序'),
      },
      {
        name: 'filters',
        required: _l('否'),
        type: 'list',
        desc: _l('筛选器组合，每个筛选器的参数请参考'),
        linkid: 'Filter',
      },
      {
        name: 'notGetTotal',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否不统计总行数以提高性能'),
      },
      {
        name: 'useControlId',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否只返回controlId，默认false'),
      },
      {
        name: 'getSystemControl',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否获取系统字段，默认false'),
      },
    ]),
  },
  {
    id: 'AddRow',
    title: _l('新建行记录 POST'),
    apiName: 'worksheet/addRow',
    data: sameParameters.concat([
      {
        name: 'controls',
        required: _l('是'),
        type: 'list',
        desc: _l('控件数据'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
    ]),
  },
  {
    id: 'AddRows',
    title: _l('批量新建行记录 POST'),
    apiName: 'worksheet/addRows',
    data: sameParameters.concat([
      {
        name: 'rows',
        required: _l('是'),
        type: '[list]',
        desc: _l('控件数据'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
    ]),
  },
  {
    id: 'GetDetail',
    title: _l('获取行记录详情 GET'),
    apiName: 'worksheet/getRowById',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'getSystemControl',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否获取系统字段，默认false'),
      },
    ]),
  },
  {
    id: 'GetDetailPost',
    title: _l('获取行记录详情 POST'),
    apiName: 'worksheet/getRowByIdPost',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'getSystemControl',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否获取系统字段，默认false'),
      },
    ]),
  },
  {
    id: 'UpdateDetail',
    title: _l('更新行记录详情 POST'),
    apiName: 'worksheet/editRow',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'controls',
        required: _l('是'),
        type: 'list',
        desc: _l('控件数据'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
    ]),
  },
  {
    id: 'UpdateDetails',
    title: _l('批量更新行记录详情 POST'),
    apiName: 'worksheet/editRows',
    data: sameParameters.concat([
      {
        name: 'rowIds',
        required: _l('是'),
        type: 'list[string]',
        desc: _l('行记录ID集合'),
      },
      {
        name: 'control',
        required: _l('是'),
        type: 'object',
        desc: _l('控件数据'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
    ]),
  },
  {
    id: 'Del',
    title: _l('删除行记录 POST'),
    apiName: 'worksheet/deleteRow',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
    ]),
  },
  {
    id: 'Relation',
    title: _l('获取关联记录 POST'),
    apiName: 'worksheet/getRowRelations',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'controlId',
        required: _l('是'),
        type: 'string',
        desc: _l('字段ID'),
      },
      {
        name: 'pageSize',
        required: _l('是'),
        type: 'number',
        desc: _l('行数'),
      },
      {
        name: 'pageIndex',
        required: _l('是'),
        type: 'number',
        desc: _l('页码'),
      },
      {
        name: 'getSystemControl',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否获取系统字段，默认false'),
      },
    ]),
  },
  {
    id: 'GetRowShareLink',
    title: _l('获取记录分享链接 POST'),
    apiName: 'worksheet/getRowShareLink',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'visibleFields',
        required: _l('否'),
        type: 'list[string]',
        desc: _l('可见字段ID集合'),
      },
      {
        name: 'validTime',
        required: _l('否'),
        type: 'number',
        desc: _l('单位s,为空表示永久有效'),
      },
      {
        name: 'password',
        required: _l('否'),
        type: 'string',
        desc: _l('为空表示不需要密码'),
      },
    ]),
  },
  {
    id: 'TotalNum',
    title: _l('获取工作表总行数 POST'),
    apiName: 'worksheet/getFilterRowsTotalNum',
    data: sameParameters.concat([
      {
        name: 'viewId',
        required: _l('是'),
        type: 'string',
        desc: _l('视图ID'),
      },
      {
        name: 'filters',
        required: _l('否'),
        type: 'list',
        desc: _l('筛选器组合，每个筛选器的参数请参考'),
        linkid: 'Filter',
      },
      {
        name: 'keywords',
        required: _l('否'),
        type: 'string',
        desc: _l('关键词'),
      },
    ]),
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

const sameAppRoleParams = [
  {
    name: 'roleId',
    required: _l('是'),
    type: 'string',
    desc: _l('角色Id'),
  },
  {
    name: 'operatorId',
    required: _l('是'),
    type: 'string',
    desc: _l('当前登录用户的账号Id'),
  },
  {
    name: 'userIds',
    required: _l('否'),
    type: 'list[string]',
    desc: _l('账号Id合集'),
  },
  {
    name: 'departmentIds',
    required: _l('否'),
    type: 'list[string]',
    desc: _l('部门Id合集'),
  },
  {
    name: 'jobIds',
    required: _l('否'),
    type: 'list[string]',
    desc: _l('职位Id合集'),
  },
  {
    name: 'orgRoleIds',
    required: _l('否'),
    type: 'list[string]',
    desc: _l('组织角色Id合集'),
  },
];

export const appSuccessData = {
  data: {
    projectId: _l('网络id'),
    appId: _l('应用id'),
    name: _l('应用名称'),
    iconUrl: _l('图标地址'),
    color: _l('图标颜色'),
    desc: _l('应用描述'),
    sections: [
      {
        sectionId: _l('应用分组id'),
        name: _l('分组名称'),
        items: [
          {
            id: _l('分组下应用项id'),
            name: _l('应用项名称'),
            type: 0,
            iconUrl: _l('应用项图标地址'),
            alias: _l('工作表别名'),
            status: 1,
          },
        ],
      },
    ],
  },
  error_code: 1,
  success: true,
};

const appRoleSuccessData = {
  data: [
    {
      roleId: _l('角色Id'),
      name: _l('角色名称'),
      roleType: _l('角色类型'),
      desc: _l('角色描述'),
      users: [
        {
          accountId: _l('账号Id'),
          name: _l('用户名'),
          avatar: _l('用户头像链接'),
        },
      ],
      departments: [
        {
          departmentId: _l('部门Id'),
          departmentName: _l('部门名称'),
        },
      ],
      jobs: [
        {
          jobId: _l('职位Id'),
          jobName: _l('职位名称'),
        },
      ],
      projectOrganizes: ['组织角色ID'],
    },
  ],
  error_code: 1,
  success: true,
};

export const appRoleErrorData = {
  error_msg: _l('具体错误信息'),
  error_code: 10101,
  success: false,
};

const appRoleSuccessData2 = {
  data: true,
  error_code: 1,
  success: true,
};

/**
 * 应用角色
 */
export const MENU_LIST_APPROLE = [
  {
    id: 'GetRole',
    title: _l('获取应用角色列表 GET'),
    isGet: true,
    apiName: 'open/app/getRoles',
    data: appInfoParameters,
    successData: appRoleSuccessData,
    errorData: appRoleErrorData,
  },
  {
    id: 'CreateRole',
    title: _l('创建应用角色 POST'),
    apiName: 'open/app/createRole',
    data: appInfoParameters.concat([
      {
        name: 'name',
        required: _l('是'),
        type: 'string',
        desc: _l('角色名称'),
      },
      {
        name: 'desc',
        required: _l('是'),
        type: 'string',
        desc: _l('角色描述'),
      },
    ]),
    successData: appRoleSuccessData,
    errorData: appRoleErrorData,
  },
  {
    id: 'DeleteRole',
    title: _l('删除应用角色 POST'),
    apiName: 'open/app/deleteRole',
    data: appInfoParameters.concat([
      {
        name: 'roleId',
        required: _l('是'),
        type: 'string',
        desc: _l('角色Id'),
      },
      {
        name: 'operatorId',
        required: _l('是'),
        type: 'string',
        desc: _l('操作者的账号Id'),
      },
    ]),
    successData: appRoleSuccessData2,
    errorData: appRoleErrorData,
  },
  {
    id: 'AddRole',
    title: _l('添加应用角色成员 POST'),
    apiName: 'open/app/addRoleMember',
    data: appInfoParameters.concat(sameAppRoleParams),
    successData: appRoleSuccessData2,
    errorData: appRoleErrorData,
  },
  {
    id: 'RemoveRole',
    title: _l('移除应用角色成员 POST'),
    apiName: 'open/app/removeRoleMember',
    data: appInfoParameters.concat(sameAppRoleParams),
    successData: appRoleSuccessData2,
    errorData: appRoleErrorData,
  },
  {
    id: 'ExitApp',
    title: _l('退出应用 POST'),
    apiName: 'open/app/quit',
    data: appInfoParameters.concat([
      {
        name: 'operatorId',
        required: _l('是'),
        type: 'string',
        desc: _l('当前登录用户的账号Id'),
      },
    ]),
    successData: appRoleSuccessData2,
    errorData: appRoleErrorData,
  },
];

/**
 * 筛选
 */
export const MENU_LIST_APPENDIX = [
  {
    id: 'Filter',
    title: _l('筛选器'),
    data: [
      {
        name: 'controlId',
        required: _l('是'),
        type: 'string',
        desc: _l('字段ID'),
      },
      {
        name: 'dataType',
        required: _l('是'),
        type: 'number',
        desc: _l('控件类型编号，枚举值DataTypeEnum 请参考'),
        linkid: 'DataTypeEnum',
      },
      {
        name: 'spliceType',
        required: _l('是'),
        type: 'number',
        desc: _l('拼接方式，1:And 2:Or'),
      },
      {
        name: 'filterType',
        required: _l('是'),
        type: 'number',
        desc: _l('筛选类型，枚举值FilterTypeEnum 请参考'),
        linkid: 'FilterTypeEnum',
      },
      {
        name: 'values',
        required: _l('否'),
        type: 'list[string]',
        desc: _l('根据筛选类型，传多个值，传特殊AccountID请参考'),
        linkid: 'AccountID',
      },
      {
        name: 'value',
        required: _l('否'),
        type: 'string',
        desc: _l('根据筛选类型，传单个值，传特殊AccountID请参考'),
        linkid: 'AccountID',
      },
      {
        name: 'dateRange',
        required: _l('否'),
        type: 'number',
        desc: _l('日期范围，枚举值DateRangeEnum 请参考'),
        linkid: 'DateRangeEnum',
      },
      {
        name: 'dateRangeType',
        required: _l('否'),
        type: 'number',
        desc: _l('日期范围类型，1：天 2：周 3：月 4：季 5：年'),
      },
      {
        name: 'minValue',
        required: _l('否'),
        type: 'string',
        desc: _l('最小值'),
      },
      {
        name: 'maxValue',
        required: _l('否'),
        type: 'string',
        desc: _l('最大值'),
      },
      {
        name: 'isAsc',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否升序（false：降序）'),
      },
      {
        name: 'isGroup',
        required: _l('否'),
        type: 'boolean',
        desc: _l('当前筛选条件是否是筛选组，为true时需要传 groupFilters 参数，只支持一层筛选组'),
      },
      {
        name: 'groupFilters',
        required: _l('否'),
        type: 'list[object]',
        desc: _l('筛选组列表，对象为筛选器对象'),
      },
    ],
  },
  {
    id: 'DataTypeEnum',
    title: 'DataTypeEnum',
    data: [
      {
        name: 2,
        type: _l('文本'),
        desc: _l('单行、多行'),
      },
      {
        name: 3,
        type: _l('电话'),
        desc: _l('手机'),
      },
      {
        name: 4,
        type: _l('电话'),
        desc: _l('座机'),
      },
      {
        name: 5,
        type: _l('邮箱'),
        desc: '',
      },
      {
        name: 6,
        type: _l('数值'),
        desc: '',
      },
      {
        name: 7,
        type: _l('证件'),
        desc: '',
      },
      {
        name: 8,
        type: _l('金额'),
        desc: '',
      },
      {
        name: 9,
        type: _l('单选'),
        desc: _l('平铺'),
      },
      {
        name: 10,
        type: _l('多选'),
        desc: '',
      },
      {
        name: 11,
        type: _l('单选'),
        desc: _l('下拉'),
      },
      {
        name: 14,
        type: _l('附件'),
        desc: '',
      },
      {
        name: 15,
        type: _l('日期'),
        desc: _l('日期: 年-月-日'),
      },
      {
        name: 16,
        type: _l('日期'),
        desc: _l('日期: 年-月-日 时:分'),
      },
      {
        name: 19,
        type: _l('地区'),
        desc: _l('地区: 省'),
      },
      {
        name: 21,
        type: _l('自由连接'),
        desc: '',
      },
      {
        name: 22,
        type: _l('分割线'),
        desc: '',
      },
      {
        name: 23,
        type: _l('地区'),
        desc: _l('地区: 省/市'),
      },
      {
        name: 24,
        type: _l('地区'),
        desc: _l('地区: 省/市/县'),
      },
      {
        name: 25,
        type: _l('大写金额'),
        desc: '',
      },
      {
        name: 26,
        type: _l('成员'),
        desc: '',
      },
      {
        name: 27,
        type: _l('部门'),
        desc: '',
      },
      {
        name: 28,
        type: _l('等级'),
        desc: '',
      },
      {
        name: 29,
        type: _l('关联记录'),
        desc: '',
      },
      {
        name: 30,
        type: _l('他表字段'),
        desc: '',
      },
      {
        name: 31,
        type: _l('公式'),
        desc: _l('计算结果为数字'),
      },
      {
        name: 32,
        type: _l('文本组合'),
        desc: '',
      },
      {
        name: 33,
        type: _l('自动编号'),
        desc: '',
      },
      {
        name: 34,
        type: _l('子表'),
        desc: '',
      },
      {
        name: 35,
        type: _l('级联选择'),
        desc: '',
      },
      {
        name: 36,
        type: _l('检查框'),
        desc: '',
      },
      {
        name: 37,
        type: _l('汇总'),
        desc: '',
      },
      {
        name: 38,
        type: _l('公式'),
        desc: _l('计算结果为日期'),
      },
      {
        name: 40,
        type: _l('定位'),
        desc: '',
      },
      {
        name: 41,
        type: _l('富文本'),
        desc: '',
      },
      {
        name: 42,
        type: _l('签名'),
        desc: '',
      },
      {
        name: 45,
        type: _l('嵌入'),
        desc: '',
      },
      {
        name: 46,
        type: _l('时间'),
        desc: '',
      },
      {
        name: 47,
        type: _l('条码'),
        desc: '',
      },
      {
        name: 48,
        type: _l('组织角色'),
        desc: '',
      },
      {
        name: 49,
        type: _l('API查询'),
        desc: '',
      },
      {
        name: 50,
        type: _l('API查询'),
        desc: '',
      },
      {
        name: 51,
        type: _l('查询记录'),
        desc: '',
      },
      {
        name: 10010,
        type: _l('备注'),
        desc: '',
      },
    ],
  },
  {
    id: 'FilterTypeEnum',
    title: 'FilterTypeEnum',
    data: [
      {
        name: 0,
        type: 'Default',
        desc: '',
      },
      {
        name: 1,
        type: 'Like',
        desc: _l('包含'),
      },
      {
        name: 2,
        type: 'Eq',
        desc: _l('是（等于）'),
      },
      {
        name: 3,
        type: 'Start',
        desc: _l('开头为'),
      },
      {
        name: 4,
        type: 'End',
        desc: _l('结尾为'),
      },
      {
        name: 5,
        type: 'NContain',
        desc: _l('不包含'),
      },
      {
        name: 6,
        type: 'Ne',
        desc: _l('不是（不等于）'),
      },
      {
        name: 7,
        type: 'IsNull',
        desc: _l('为空'),
      },
      {
        name: 8,
        type: 'HasValue',
        desc: _l('不为空'),
      },
      {
        name: 11,
        type: 'Between',
        desc: _l('在范围内'),
      },
      {
        name: 12,
        type: 'NBetween',
        desc: _l('不在范围内'),
      },
      {
        name: 13,
        type: 'Gt',
        desc: '>',
      },
      {
        name: 14,
        type: 'Gte',
        desc: '>=',
      },
      {
        name: 15,
        type: 'Lt',
        desc: '<',
      },
      {
        name: 16,
        type: 'Lte',
        desc: '<=',
      },
      {
        name: 17,
        type: 'DateEnum',
        desc: _l('日期是'),
      },
      {
        name: 18,
        type: 'NDateEnum',
        desc: _l('日期不是'),
      },
      {
        name: 21,
        type: 'MySelf',
        desc: _l('我拥有的'),
      },
      {
        name: 22,
        type: 'UnRead',
        desc: _l('未读'),
      },
      {
        name: 23,
        type: 'Sub',
        desc: _l('下属'),
      },
      {
        name: 24,
        type: 'RCEq',
        desc: _l('关联控件是'),
      },
      {
        name: 25,
        type: 'RCNe',
        desc: _l('关联控件不是'),
      },
      {
        name: 26,
        type: 'ArrEq',
        desc: _l('数组等于'),
      },
      {
        name: 27,
        type: 'ArrNe',
        desc: _l('数组不等于'),
      },
      {
        name: 31,
        type: 'DateBetween',
        desc: _l('在范围内'),
      },
      {
        name: 32,
        type: 'DateNBetween',
        desc: _l('不在范围内'),
      },
      {
        name: 33,
        type: 'DateGt',
        desc: _l('>'),
      },
      {
        name: 34,
        type: 'DateGte',
        desc: _l('>='),
      },
      {
        name: 35,
        type: 'DateLt',
        desc: _l('<'),
      },
      {
        name: 36,
        type: 'DateLte',
        desc: _l('<='),
      },
      {
        name: 41,
        type: 'NormalUser',
        desc: _l('常规用户'),
      },
      {
        name: 42,
        type: 'PortalUser',
        desc: _l('外部门户用户'),
      },
    ],
  },
  {
    id: 'DateRangeEnum',
    title: 'DateRangeEnum',
    data: [
      {
        name: 0,
        type: 'Default',
        desc: '',
      },
      {
        name: 1,
        type: 'Today',
        desc: _l('今天'),
      },
      {
        name: 2,
        type: 'Yesterday',
        desc: _l('昨天'),
      },
      {
        name: 3,
        type: 'Tomorrow',
        desc: _l('明天'),
      },
      {
        name: 4,
        type: 'ThisWeek',
        desc: _l('本周'),
      },
      {
        name: 5,
        type: 'LastWeek',
        desc: _l('上周'),
      },
      {
        name: 6,
        type: 'NextWeek',
        desc: _l('下周'),
      },
      {
        name: 7,
        type: 'ThisMonth',
        desc: _l('本月'),
      },
      {
        name: 8,
        type: 'LastMonth',
        desc: _l('上月'),
      },
      {
        name: 9,
        type: 'NextMonth',
        desc: _l('下月'),
      },
      {
        name: 10,
        type: 'LastEnum',
        desc: _l('上..'),
      },
      {
        name: 11,
        type: 'NextEnum',
        desc: _l('下..'),
      },
      {
        name: 12,
        type: 'ThisQuarter',
        desc: _l('本季度'),
      },
      {
        name: 13,
        type: 'LastQuarter',
        desc: _l('上季度'),
      },
      {
        name: 14,
        type: 'NextQuarter',
        desc: _l('下季度'),
      },
      {
        name: 15,
        type: 'ThisYear',
        desc: _l('本年'),
      },
      {
        name: 16,
        type: 'LastYear',
        desc: _l('去年'),
      },
      {
        name: 17,
        type: 'NextYear',
        desc: _l('明年'),
      },
      {
        name: 18,
        type: 'Customize',
        desc: _l('自定义'),
      },
      {
        name: 21,
        type: 'Last7Day',
        desc: _l('过去7天'),
      },
      {
        name: 22,
        type: 'Last14Day',
        desc: _l('过去14天'),
      },
      {
        name: 23,
        type: 'Last30Day',
        desc: _l('过去30天'),
      },
      {
        name: 31,
        type: 'Next7Day',
        desc: _l('未来7天'),
      },
      {
        name: 32,
        type: 'Next14Day',
        desc: _l('未来14天'),
      },
      {
        name: 33,
        type: 'Next33Day',
        desc: _l('未来33天'),
      },
    ],
  },
  {
    id: 'AccountID',
    title: _l('特殊AccountID'),
    data: [
      {
        name: 'user-self',
        desc: _l('当前用户'),
      },
      {
        name: 'user-sub',
        desc: _l('下属'),
      },
      {
        name: 'user-workflow',
        desc: _l('工作流'),
      },
      {
        name: 'user-api',
        desc: 'API',
      },
    ],
  },
  {
    id: 'AreaInfo',
    title: _l('地区信息'),
    data: [],
    provinceData: {
      data: {
        provinces: [
          {
            id: 110000,
            name: _l('北京市'),
          },
          {
            id: 330000,
            name: _l('浙江省'),
          },
          {
            id: 910000,
            name: _l('海外'),
          },
        ],
      },
      state: 1,
    },
    cityData: {
      data: {
        citys: [
          {
            id: 130100,
            name: _l('石家庄市'),
          },
          {
            id: 130200,
            name: _l('唐山市'),
          },
          {
            id: 130700,
            name: _l('张家口市'),
          },
        ],
        values: {
          displayText: _l('河北省'),
          selectValue: 130000,
        },
      },
      state: 1,
    },
  },
  {
    id: 'ErrorCode',
    title: _l('错误码'),
    data: [
      {
        name: 0,
        desc: _l('失败'),
      },
      {
        name: 1,
        desc: _l('成功'),
      },
      {
        name: 10001,
        desc: _l('缺少参数'),
      },
      {
        name: 10002,
        desc: _l('参数值错误'),
      },
      {
        name: 10005,
        desc: _l('数据操作无权限'),
      },
      {
        name: 10007,
        desc: _l('数据不存在'),
      },
      {
        name: 10101,
        desc: _l('请求令牌不存在'),
      },
      {
        name: 10102,
        desc: _l('签名不合法'),
      },
      {
        name: 99999,
        desc: _l('数据操作异常'),
      },
    ],
  },
];

/**
 * 选项集
 */
export const OPTIONS_FUNCTION_LIST = [
  {
    id: 'add',
    title: _l('新增选项集 POST'),
    apiName: 'open/app/createOptionSet',
    data: [],
    requestData: {
      appKey: 'appKey',
      sign: 'sign',
      name: _l('选项集1'),
      options: [
        {
          value: _l('选项值，不允许重复'),
          index: _l('选项排序值: 必须为整数，越小越靠前'),
          isDeleted: _l('该选项是否已被删除'),
          color: _l(
            '颜色值: colorful为true时生效，参考值 #C0E6FC , #C3F2F2 , #00C345 , #FAD714 , #FF9300 , #F52222 , #EB2F96 , #7500EA , #2D46C4 , #484848 , #C9E6FC , #C3F2F2',
          ),
          score: _l('分值，enableScore为true时生效，允许小数和正负值'),
        },
        {
          value: 'value02',
          index: 1,
          isDeleted: false,
          color: 'red',
          score: 1.5,
        },
      ],
      colorful: false,
      enableScore: false,
    },
    successData: {
      code: 1,
      msg: 'string',
      data: true,
    },
    errorData: {
      error_msg: _l('具体错误信息'),
      error_code: 10001,
      success: false,
    },
  },
  {
    id: 'get',
    title: _l('获取选项集 POST'),
    apiName: 'open/app/getOptionSets',
    data: [],
    requestData: {
      appKey: 'appKey',
      sign: 'sign',
    },
    successData: {
      code: 1,
      msg: 'string',
      data: [
        {
          appId: 'appId',
          projectId: 'projectId',
          collectionId: _l('选项集ID'),
          name: _l('选项集名称'),
          accountId: 'accountId',
          worksheetIds: ['worksheetId'],
          options: [
            {
              key: _l('选项id'),
              value: _l('选项值，不允许重复'),
              index: _l('选项排序值: 必须为整数，越小越靠前'),
              isDeleted: _l('该选项是否已被删除'),
              color: _l('颜色值'),
              score: _l('选项分值'),
            },
            {
              key: 'key01',
              value: 'value01',
              index: 0,
              isDeleted: true,
              color: 'red',
              score: 0,
            },
          ],
          colorful: true,
          enableScore: true,
        },
      ],
    },
    errorData: {
      error_msg: _l('具体错误信息'),
      error_code: 10001,
      success: false,
    },
  },
  {
    id: 'edit',
    title: _l('编辑选项集 POST'),
    apiName: 'open/app/editOptionSet/{id}',
    data: [],
    requestData: {
      appKey: 'appKey',
      sign: 'sign',
      options: [
        {
          key: _l('需要编辑的选项id，如果为空则表示新增选项'),
          value: _l('选项值，不允许重复'),
          index: _l('选项排序值: 必须为整数，越小越靠前'),
          isDeleted: _l('该选项是否已被删除'),
          color: _l(
            '颜色值: colorful为true时生效，参考值 #C0E6FC , #C3F2F2 , #00C345 , #FAD714 , #FF9300 , #F52222 , #EB2F96 , #7500EA , #2D46C4 , #484848 , #C9E6FC , #C3F2F2',
          ),
          score: _l('分值，enableScore为true时生效，允许小数和正负值'),
        },
        {
          key: 'key02',
          value: 'value02',
          index: 1,
          isDeleted: false,
          color: 'red',
          score: 1.5,
        },
      ],
      name: _l('test选项集01'),
      colorful: true,
      enableScore: false,
    },
    successData: {
      code: 1,
      msg: 'string',
      data: true,
    },
    errorData: {
      error_msg: _l('具体错误信息'),
      error_code: 10001,
      success: false,
    },
  },
  {
    id: 'delete',
    title: _l('删除选项集 DELETE'),
    apiName: 'open/app/deleteOptionSet/{id}',
    data: [
      {
        name: 'appKey',
        required: _l('是'),
        type: 'string',
        desc: '应用key',
      },
      {
        name: 'sign',
        required: _l('是'),
        type: 'string',
        desc: _l('签名'),
      },
    ],
    requestData: {
      appKey: 'appKey',
      sign: 'sign',
    },
    successData: {
      data: true,
      code: 1,
    },
    errorData: {
      error_msg: _l('具体错误信息'),
      error_code: 10001,
      success: false,
    },
  },
];

export const SIDEBAR_LIST = [
  {
    key: 'summary',
    title: _l('概述'),
  },
  {
    key: 'requestFormat',
    title: _l('请求格式'),
  },
  {
    key: 'authorizationInstr',
    title: _l('授权管理'),
  },
  {
    key: 'whiteList',
    title: _l('IP 白名单'),
  },
  {
    key: 'appInfo',
    title: _l('获取应用信息'),
  },
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
];

export const ADD_WORKSHEET_SUCCESS = {
  data: _l('工作表ID'),
  success: true,
  error_code: 1,
};
