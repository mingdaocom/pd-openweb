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

export const appRoleSuccessData2 = {
  data: true,
  error_code: 1,
  success: true,
};

// 获取列表成功返回
export const LIST_SUCCESS = {
  data: {
    rows: [
      {
        rowid: _l('记录id'),
        ctime: _l('创建时间'),
        caid: {
          accountId: _l('创建人账号Id'),
          fullname: _l('创建者名称'),
          avatar: _l('头像地址'),
          status: 1,
        },
        uaid: {
          accountId: _l('编辑者账号id'),
          fullname: _l('编辑者名称'),
          avatar: _l('头像地址'),
          status: 1,
        },
        ownerid: {
          accountId: _l('拥有者账号Id'),
          fullname: _l('拥有者名称'),
          avatar: _l('头像地址'),
          status: 1,
        },
        utime: _l('编辑时间'),
        [_l('控件id/别名')]: _l('控件值'),
      },
    ],
    total: _l('总条数'),
  },
  success: true,
  error_code: 1,
};

export const NUMBER_SUCCESS_DATA = {
  data: _l('总数量'),
  success: true,
  error_code: 1,
};

export const ADD_ROW_SUCCESS = {
  data: _l('rowId'),
  success: true,
  error_code: 1,
};

// 获取关联记录成功返回实例
export const DATA_RELATIONS_SUCCESS_DATA = {
  data: {
    rows: [
      {
        rowid: _l('关联记录id'),
        ctime: _l('创建时间'),
        utime: _l('更新时间'),
        [_l('关联记录控件id/别名')]: _l('控件值'),
      },
    ],
    total: _l('总条数'),
  },
  success: true,
  error_code: 1,
};

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
      { key: 'controlId', text: _l('字段ID'), className: 'w22' },
      { key: 'controlName', text: _l('字段名称'), className: 'w18 mLeft30' },
      { key: 'type', text: _l('类型'), className: 'w14 mLeft30' },
      { key: 'numberType', text: _l('控件类型编号'), className: 'w14 mLeft30' },
      { key: 'desc', text: _l('说明'), className: 'w32 mLeft30' },
    ],
  },
  {
    id: 'ViewTable',
    title: _l('视图对照表'),
    btnText: _l('设置视图别名'),
    type: 'view',
    fields: [
      { key: 'viewId', text: _l('视图ID'), className: 'w46' },
      { key: 'name', text: _l('视图名称'), className: 'w32 mLeft30' },
      { key: 'viewType', text: _l('类型'), className: 'w22 mLeft30' },
    ],
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
        name: 'listType',
        required: _l('否'),
        type: 'string',
        desc: _l(
          '返回数据类型，0：按指定视图的数据格式返回（若非表格视图则获取数据的数量会有所限制）1：按表格视图的数据格式返回（可以获取所有数据）。不传默认为0，推荐填入1',
        ),
      },
      {
        name: 'pageSize',
        required: _l('是'),
        type: 'number',
        desc: _l('行数，最大为1000'),
      },
      {
        name: 'pageIndex',
        required: _l('是'),
        type: 'number',
        desc: _l('页码'),
      },
      {
        name: 'keyWords',
        required: _l('否'),
        type: 'string',
        desc: _l('关键字模糊搜索'),
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
      {
        name: 'controls',
        required: _l('否'),
        type: 'list[string]',
        desc: _l('指定控件（ID或别名）'),
      },
    ]),
    requestData: {
      viewId: _l('视图ID,可为空'),
      pageSize: 50,
      pageIndex: 1,
      keyWords: '',
      listType: 0,
      controls: [],
    },
    successData: LIST_SUCCESS,
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
    requestData: {
      triggerWorkflow: true,
    },
    successData: ADD_ROW_SUCCESS,
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
      {
        name: 'returnRowIds',
        required: _l('否'),
        type: 'boolean',
        desc: _l('true：返回批量增加的rowIds，false返回时成功的条数'),
      },
    ]),
    requestData: {
      triggerWorkflow: true,
      returnRowIds: false,
    },
    successData: NUMBER_SUCCESS_DATA,
  },
  {
    id: 'GetDetail',
    title: _l('获取行记录详情 GET'),
    apiName: 'worksheet/getRowById',
    isGet: true,
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
    successData: LIST_SUCCESS,
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
    successData: LIST_SUCCESS,
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
    requestData: {
      triggerWorkflow: true,
    },
    successData: appRoleSuccessData2,
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
        desc: _l('控件数据（旧字段），用于单个字段更新'),
      },
      {
        name: 'triggerWorkflow',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否触发工作流(默认: true)'),
      },
      {
        name: 'controls',
        required: _l('否'),
        type: 'list[object]',
        desc: _l('多个控件数据（新字段），可用于多个字段更新'),
      },
    ]),
    requestData: {
      rowIds: [_l('行记录ID'), _l('行记录ID')],
      triggerWorkflow: true,
    },
    successData: appRoleSuccessData2,
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
      {
        name: 'thoroughDelete',
        required: _l('否'),
        type: 'boolean',
        desc: _l(
          '是否物理删除(true：物理删除，false：逻辑删除，默认为false)，物理删除后数据不进入回收站，且不可恢复，请谨慎操作！',
        ),
      },
    ]),
    requestData: {
      rowId: _l('行记录ID，多个用逗号(,)隔开'),
      triggerWorkflow: true,
      thoroughDelete: false,
    },
    successData: appRoleSuccessData2,
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
        desc: _l('行数，最大为1000'),
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
    requestData: {
      pageSize: _l('行数，最大为1000'),
      pageIndex: _l('页码'),
    },
    successData: DATA_RELATIONS_SUCCESS_DATA,
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
        type: 'string',
        desc: _l('格式:YYYY-MM-DD HH:mm:ss,为空表示永久有效'),
      },
      {
        name: 'password',
        required: _l('否'),
        type: 'string',
        desc: _l('为空表示不需要密码'),
      },
    ]),
    requestData: {
      rowId: _l('行记录ID'),
      visibleFields: [_l('可见字段ID')],
      validTime: _l('YYYY-MM-DD HH:mm:ss'),
      password: _l('密码'),
    },
    successData: {
      data: _l('链接地址'),
      success: true,
      error_code: 1,
    },
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
    requestData: {
      viewId: _l('视图ID'),
      keywords: _l('关键词'),
      filters: [
        {
          controlId: 'string',
          dataType: 1,
          spliceType: 0,
          filterType: 0,
          dateRange: 0,
          dateRangeType: 0,
          value: 'string',
          values: ['string'],
          minValue: 'string',
          maxValue: 'string',
          isAsc: true,
          dynamicSource: [
            {
              rcid: 'string',
              cid: 'string',
              staticValue: 'string',
              isAsync: true,
            },
          ],
          advancedSetting: {
            additionalProp1: 'string',
            additionalProp2: 'string',
            additionalProp3: 'string',
          },
        },
      ],
    },
    successData: NUMBER_SUCCESS_DATA,
  },
  {
    id: 'getWorksheetDiscussions',
    title: _l('获取行记录讨论 POST'),
    apiName: 'worksheet/getWorksheetDiscussions',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'pageSize',
        required: _l('是'),
        type: 'number',
        desc: _l('行数，最大为1000'),
      },
      {
        name: 'pageIndex',
        required: _l('是'),
        type: 'number',
        desc: _l('页码'),
      },
      {
        name: 'keywords',
        required: _l('否'),
        type: 'string',
        desc: _l('关键字模糊搜索'),
      },
      {
        name: 'containAttachment',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否只返回包含附件的讨论'),
      },
    ]),
    requestData: {
      pageSize: '20',
      pageIndex: 1,
    },
    successData: {
      code: 1,
      data: [
        {
          discussionId: _l('讨论 id'),
          message: _l('讨论内容'),
          createTime: _l('创建时间'),
          createAccount: {
            accountId: _l('创建者信息'),
            fullname: _l('名称'),
            avatar: _l('头像地址'),
            isPortal: false,
            status: 1,
          },
          replyAccount: {
            accountId: _l('回复者信息'),
            fullname: _l('名称'),
            avatar: _l('头像地址'),
            isPortal: false,
            status: 1,
          },
          replyId: _l('回复的讨论 id'),
          projectId: _l('组织 id'),
          accountsInMessage: [
            {
              accountId: _l('@的人信息'),
              fullname: _l('名称'),
              avatar: _l('头像地址'),
              isPortal: false,
              status: 1,
            },
          ],
          attachments: [
            {
              originalFilename: _l('文件名称'),
              ext: _l('文件类型'),
              filesize: _l('文件大小'),
              downloadUrl: _l('下载地址'),
            },
          ],
        },
      ],
    },
  },
  {
    id: 'getWorksheetOperationLogs',
    title: _l('获取行记录日志 POST'),
    apiName: 'worksheet/getWorksheetOperationLogs',
    data: sameParameters.concat([
      {
        name: 'rowId',
        required: _l('是'),
        type: 'string',
        desc: _l('行记录ID'),
      },
      {
        name: 'opeartorId',
        required: _l('否'),
        type: 'string',
        desc: _l('按操作者ID筛选'),
      },
      {
        name: 'controlId',
        required: _l('否'),
        type: 'string',
        desc: _l('按控件ID筛选'),
      },
      {
        name: 'pageSize',
        required: _l('否'),
        type: 'number',
        desc: _l('行数'),
      },
      {
        name: 'lastMark',
        required: _l('否'),
        type: 'string',
        desc: _l('上一次更新的时间'),
      },
    ]),
    requestData: {
      opeartorId: _l('操作者ID'),
      controlId: _l('控件ID'),
      pageSize: '20',
    },
    successData: {
      logs: [
        {
          opeartorInfo: {
            accountId: _l('操作者ID'),
            fullname: _l('名称'),
            avatar: _l('头像地址'),
            isPortal: false,
            status: 1,
          },
          operatContent: {
            worksheetId: _l('工作表ID'),
            objectId: _l('操作对象ID'),
            uniqueId: _l('操作唯一标识'),
            objectType: _l('日志对象类型 1:工作表 2:行记录 3:视图 4:按钮 5:业务规则 99:其他'),
            type: 2,
            requestType: _l('日志操作类型 1:手动 2:工作流 3:按钮'),
            createTime: _l('操作创建的时间戳'),
            logData: [
              {
                id: _l('操作项ID'),
                name: _l('操作项名称'),
                editType: 1,
                type: 26,
                oldValue: _l('操作前的值'),
                oldText: _l('操作后的描述'),
                newValue: _l('操作后的值'),
                newText: _l('操作后的描述'),
                isDeleted: false,
              },
            ],
            extendParams: ['string'],
          },
        },
      ],
      lastMark: _l('最后一次更新的时间'),
      flag: false,
    },
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
    name: 'departmentTreeIds',
    required: _l('否'),
    type: 'list[string]',
    desc: _l('部门树Id合集'),
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
            type: _l('应用项类型 0:工作表、1:自定义页面、2：子分组'),
            iconUrl: _l('应用项图标地址'),
            alias: _l('工作表别名'),
            status: 1,
            notes: _l('开发者备注'),
          },
        ],
        childSections: [
          {
            sectionId: _l('子分组id'),
            name: _l('子分组名称'),
            items: [
              {
                id: _l('分组下应用项id'),
                name: _l('应用项名称'),
                type: _l('应用项类型 0:工作表、1:自定义页面、2：子分组'),
                iconUrl: _l('应用项图标地址'),
                status: 1,
                alias: _l('工作表别名'),
                notes: _l('开发者备注'),
              },
            ],
            childSections: [],
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

const roleDetailSuccess = {
  data: {
    roleId: _l('角色Id'),
    name: _l('角色名称'),
    roleType: _l('角色类型'),
    description: _l('角色描述'),
    hideAppForMembers: _l('是否对成员隐藏应用,true：隐藏，false：不隐藏'),
    permissionWay: _l(
      '分发所有应用项, 80：可查看、编辑、删除所有记录; 60：可查看所有记录，但只能编辑、删除自己拥有的记录; 30：可查看加入的，只能编辑、删除自己拥有的记录; 20：对所有记录只有查看权限; 0：分发有权限应用项',
    ),
    sheets: [
      {
        sheetId: _l('工作表ID'),
        sheetName: _l('工作表名称'),
        canAdd: _l('是否可以添加记录'),
        readLevel: _l('读取权限级别'),
        editLevel: _l('编辑权限级别'),
        removeLevel: _l('删除权限级别'),
      },
    ],
    extendAttrs: [_l('扩展属性')],
    optionalControls: [_l('可选控件')],
    pages: [_l('自定义页面权限')],
    generalAdd: _l('添加权限'),
    gneralShare: _l('分享权限'),
    generalImport: _l('导入权限'),
    generalExport: _l('导出权限'),
    generalDiscussion: _l('讨论权限'),
    generalSystemPrinting: _l('系统打印权限'),
    generalAttachmentDownload: _l('附件下载权限'),
    generalLogging: _l('日志权限'),
  },
  success: true,
  error_code: 1,
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
        name: 'description',
        required: _l('否'),
        type: 'string',
        desc: _l('角色描述'),
      },
      {
        name: 'hideAppForMembers',
        required: _l('否'),
        type: 'boolean',
        desc: _l('是否对成员隐藏应用 隐藏：true,不隐藏：false'),
        example: true,
      },
      {
        name: 'roleType',
        required: _l('否'),
        type: 'integer',
        desc: _l('角色类型 0：自定义角色'),
        example: 0,
      },
      {
        name: 'permissionWay',
        required: _l('否'),
        type: 'integer',
        desc: _l(
          '权限方式：分发所有应用项，80：可查看、编辑、删除所有记录，60：可查看所有记录，但只能编辑、删除自己拥有的记录，30：可查看加入的，只能编辑、删除自己拥有的记录，20：对所有记录只有查看权限，0：分发有权限应用项',
        ),
        example: 80,
      },
      {
        name: 'sheets',
        required: _l('否'),
        type: 'array',
        desc: `[
            {
              "sheetId": "",//工作表 id
              "sheetName": "",//工作表名称
              "canAdd": false,//新增权限
              "readLevel": 20,//20：用户加入的，30：包含下属，100：全部
              "editLevel": 20,//20：用户加入的，30：包含下属，100：全部
              "removeLevel": 20,//20：用户加入的，30：包含下属，100：全部
              "views": [
                {
                  "viewId": "67cff5821131169abf7ef615",
                  "viewName": "全部",
                  "canRead": true,
                  "canEdit": true,
                  "canRemove": false,
                  "type": 0
                }
              ],
              "fields": [//字段权限控制
                {
                  "fieldId": "ownerid",//字段id
                  "type": 26,//字段类型
                  "fieldName": "拥有者",//字段名称
                  "notRead": false,//查看权限，false：有权限，true：
                  "notEdit": false,//编辑权限
                  "notAdd": false,//新增权限
                  "isDecrypt": false,
                  "isReadField": false,
                  "hideWhenAdded": true,
                  "isHide": false
                }
              ],
              "worksheetAddRecord": {
                "enable": true //工作表添加记录
              },
              "worksheetShareView": {
                "enable": true//工作表分享
              },
              "worksheetImport": {
                "enable": true//工作表导入
              },
              "worksheetExport": {
                "enable": true//工作表导出
              },
              "worksheetDiscuss": {
                "enable": true//工作表讨论
              },
              "worksheetLogging": {
                "enable": true//工作表日志
              },
              "worksheetBatchOperation": {
                "enable": true//工作表批量操作
              },
              "recordShare": {
                "enable": true//记录分享
              },
              "recordDiscussion": {
                "enable": true//记录讨论
              },
              "recordSystemPrinting": {
                "enable": true//系统打印
              },
              "recordAttachmentDownload": {
                "enable": true//附件下载
              },
              "recordLogging": {
                "enable": true//日志
              },
              "payment": {
                "enable": true//支付
              }
            }
          ]`,
        example: [
          {
            sheetId: '',
            sheetName: '',
            canAdd: false,
            readLevel: 20,
            editLevel: 20,
            removeLevel: 20,
            views: [
              {
                viewId: '',
                viewName: _l('全部'),
                canRead: true,
                canEdit: true,
                canRemove: false,
                type: 0,
              },
            ],
            fields: [
              {
                fieldId: 'ownerid',
                type: 26,
                fieldName: _l('拥有者'),
                notRead: false,
                notEdit: false,
                notAdd: false,
                isDecrypt: false,
                isReadField: false,
                hideWhenAdded: true,
                isHide: false,
              },
            ],
            worksheetAddRecord: {
              enable: true,
            },
            worksheetShareView: {
              enable: true,
            },
            worksheetImport: {
              enable: true,
            },
            worksheetExport: {
              enable: true,
            },
            worksheetDiscuss: {
              enable: true,
            },
            worksheetLogging: {
              enable: true,
            },
            worksheetBatchOperation: {
              enable: true,
            },
            recordShare: {
              enable: true,
            },
            recordDiscussion: {
              enable: true,
            },
            recordSystemPrinting: {
              enable: true,
            },
            recordAttachmentDownload: {
              enable: true,
            },
            recordLogging: {
              enable: true,
            },
            payment: {
              enable: true,
            },
          },
        ],
      },
      {
        name: 'pages',
        required: _l('否'),
        type: 'array',
        desc: _l('页面列表'),
        example: [
          {
            pageId: '自定义页面 id',
            name: '页面名称',
            checked: false, //查看权限
            navigateHide: false, //是否隐藏导航
            sortIndex: 1, //排序
            iconUrl: '',
          },
        ],
      },
      {
        name: 'generalAdd',
        required: _l('否'),
        type: 'object',
        desc: _l('添加权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'gneralShare',
        required: _l('否'),
        type: 'object',
        desc: _l('分享权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalImport',
        required: _l('否'),
        type: 'object',
        desc: _l('导入权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalExport',
        required: _l('否'),
        type: 'object',
        desc: _l('导出权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalDiscussion',
        required: _l('否'),
        type: 'object',
        desc: _l('讨论权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalSystemPrinting',
        required: _l('否'),
        type: 'object',
        desc: _l('系统打印权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalAttachmentDownload',
        required: _l('否'),
        type: 'object',
        desc: _l('附件下载权限 true：开启，false：不开启'),
        example: { enable: true },
      },
      {
        name: 'generalLogging',
        required: _l('否'),
        type: 'object',
        desc: _l('日志权限 true：开启，false：不开启'),
        example: { enable: true },
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
  {
    id: 'GetRoleDetail',
    title: _l('获取角色详情 GET'),
    isGet: true,
    apiName: 'open/app/getRoleDetail',
    data: appInfoParameters.concat([
      {
        name: 'roleId',
        required: _l('是'),
        type: 'string',
        desc: _l('角色 Id'),
      },
    ]),
    successData: roleDetailSuccess,
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
        name: 21,
        type: _l('自由连接'),
        desc: '',
      },
      {
        name: 22,
        type: _l('分段'),
        desc: '',
      },
      {
        name: 24,
        type: _l('地区'),
        desc: '',
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
        desc: '>',
      },
      {
        name: 34,
        type: 'DateGte',
        desc: '>=',
      },
      {
        name: 35,
        type: 'DateLt',
        desc: '<',
      },
      {
        name: 36,
        type: 'DateLte',
        desc: '<=',
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
    cityData: {
      data: {
        citys: [
          {
            id: 130100,
            name: _l('石家庄市'),
            path: _l('河北省/石家庄市'),
            last: false,
          },
          {
            id: 130200,
            name: _l('唐山市'),
            path: _l('河北省/唐山市'),
            last: false,
          },
          {
            id: 130700,
            name: _l('张家口市'),
            path: _l('河北省/张家口市'),
            last: false,
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
      appKey: 'YOUR_APP_KEY',
      sign: 'YOUR_SIGN',
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
      appKey: 'YOUR_APP_KEY',
      sign: 'YOUR_SIGN',
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
      appKey: 'YOUR_APP_KEY',
      sign: 'YOUR_SIGN',
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
      appKey: 'YOUR_APP_KEY',
      sign: 'YOUR_SIGN',
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
  {
    key: 'workflowInfo',
    title: _l('封装业务流程'),
    render: 'renderPBCSide',
    args: { type: 'workflowInfo', listKey: 'pbcList', title: _l('封装业务流程') },
  },
  {
    key: 'webhook',
    title: _l('Webhook'),
    render: 'renderPBCSide',
    args: { type: 'webhook', listKey: 'webhookList', title: _l('Webhook') },
  },
  {
    key: 'role',
    title: _l('应用角色'),
    render: 'renderOtherSide',
    args: 0,
  },
  {
    key: 'filter',
    title: _l('筛选'),
    render: 'renderOtherSide',
    args: 1,
  },
  {
    key: 'options',
    title: _l('选项集'),
    render: 'renderOtherSide',
    args: 2,
  },
  {
    key: 'ErrorCode',
    title: _l('错误码'),
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

//
export const BATCH_ADD_WORKSHEET_SUCCESS = {
  data: [_l('工作表ID')],
  success: true,
  error_code: 1,
};

export const ERROR_CODE = [
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
        name: 51,
        desc: _l('请求限流'),
      },
      {
        name: 10000,
        desc: _l('拒绝访问ip 受限'),
      },
      {
        name: 10001,
        desc: _l('参数错误'),
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
        name: 10006,
        desc: _l('数据已存在'),
      },
      {
        name: 10007,
        desc: _l('数据不存在或已经删除'),
      },
      {
        name: 10101,
        desc: _l('令牌不存在'),
      },
      {
        name: 10102,
        desc: _l('签名不合法'),
      },
      {
        name: 10105,
        desc: _l('用户访问令牌失效'),
      },
      {
        name: 10106,
        desc: _l('用户访问组织令牌受限'),
      },
      {
        name: 100005,
        desc: _l('字段值重复'),
      },
      {
        name: 100006,
        desc: _l('选项数量已达上限'),
      },
      {
        name: 100007,
        desc: _l('附件数量已达上限'),
      },
      {
        name: 430013,
        desc: _l('应用未找到工作表'),
      },
      {
        name: 430014,
        desc: _l('工作表字段权限不足'),
      },
      {
        name: 430017,
        desc: _l('应用附件上传量不足'),
      },
      {
        name: 430018,
        desc: _l('草稿箱记录数量已达上限'),
      },
      {
        name: 430019,
        desc: _l('必填字段值为空'),
      },
      {
        name: 430020,
        desc: _l('子表数据错误'),
      },
      {
        name: 430021,
        desc: _l('数据不满足业务规则'),
      },
      {
        name: 430022,
        desc: _l('工作表不存在'),
      },
      {
        name: 90000,
        desc: _l('请求次数超出限制'),
      },
      {
        name: 99999,
        desc: _l('数据操作异常'),
      },
    ],
  },
];
