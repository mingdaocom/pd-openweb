export const sameParameters = [
  {
    name: 'appKey',
    required: _l('是'),
    type: 'string',
    desc: _l('AppKey'),
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
    desc: _l('AppKey'),
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
        desc: _l('控件ID'),
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
];

export const appSuccessData = {
  data: {
    projectId: '网络id',
    appId: '应用id',
    name: '应用名称',
    iconUrl: '图标地址',
    color: '图标颜色',
    desc: '应用描述',
    sections: [
      {
        sectionId: '应用分组id',
        name: '分组名称',
        items: [
          {
            id: '分组下应用项id',
            name: '应用项名称',
            type: 0,
            iconUrl: '应用项图标地址',
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
      roleId: '角色Id',
      name: '角色名称',
      roleType: '角色类型',
      desc: '角色描述',
      users: [
        {
          accountId: '账号Id',
          name: '用户名',
          avatar: '用户头像链接',
        },
      ],
      departments: [
        {
          departmentId: '部门Id',
          departmentName: '部门名称',
        },
      ],
      jobs: [
        {
          jobId: '职位Id',
          jobName: '职位名称',
        },
      ],
    },
  ],
  error_code: 1,
  success: true,
};

export const appRoleErrorData = {
  error_msg: '具体错误信息',
  error_code: 10101,
  success: false,
};

const appRoleSuccessData2 = {
  data: true,
  error_code: 1,
  success: true,
};

export const MENU_LIST_APPROLE = [
  {
    id: 'GetRole',
    title: _l('获取应用角色列表 GET'),
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

export const MENU_LIST_APPENDIX = [
  {
    id: 'Filter',
    title: _l('筛选器'),
    data: [
      {
        name: 'controlId',
        required: _l('是'),
        type: 'string',
        desc: _l('控件ID'),
      },
      {
        name: 'dataType',
        required: _l('是'),
        type: 'number',
        desc: _l('控件类型编号'),
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
        type: 'bool',
        desc: _l('是否升序（false：降序）'),
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
];

export const SIDEBAR_LIST = [
  {
    key: 'summary',
    title: _l('概述'),
  },
  {
    key: 'authorizationInstr',
    title: _l('授权管理'),
  },
  {
    key: 'appInfo',
    title: _l('获取应用信息'),
  },
];
