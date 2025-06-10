export const WFSTATUS_OPTIONS = [
  {
    key: 'pass',
    color: '#4caf50',
    index: 1,
    enumDefault2: 1,
    value: _l('同意'),
  },
  {
    key: 'refuse',
    color: '#f44336',
    index: 2,
    enumDefault2: 1,
    value: _l('否决'),
  },
  {
    key: 'abort',
    color: '#e8e8e8',
    index: 3,
    enumDefault2: 1,
    value: _l('中止'),
  },
  {
    key: 'other',
    color: 'rgba(33, 150, 243, 0.13)',
    index: 4,
    enumDefault2: 1,
    value: _l('其他'),
  },
];

export const TEXT_FIELD_SHOWTEXT_TYPE = {
  26: 'accountId',
  48: 'organizeId',
  27: 'departmentId',
  42: 'key',
  30: 'SHEET_FIELD',
};

export const GET_SYSTEM_USER = () => {
  return {
    'user-workflow': {
      accountId: 'user-workflow',
      avatar:
        md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
        '/UserAvatar/workflow.png?imageView2/1/w/48/h/48/q/90',
      fullname: '工作流',
    },
    'user-publicform': {
      accountId: 'user-publicform',
      avatar:
        md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
        '/UserAvatar/publicform.png?imageView2/1/w/100/h/100/q/90',
      fullname: '公开表单',
    },
    'user-api': {
      accountId: 'user-api',
      avatar:
        md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
        '/UserAvatar/worksheetapi.png?imageView2/1/w/100/h/100/q/90',
      fullname: 'API',
    },
  };
};

export const FILTER_FIELD_BY_ATTR = {
  27: ['departmentId', 'departmentName'],
  26: ['accountId', 'fullname'],
  48: ['organizeId', 'organizeName'],
};

export const CIRCLE_TAGS_CONTROL_TYPE = [26, 36, 27, 10, 48, 11, 9];
export const RECT_TAGS_CONTROL_TYPE = [
  6, 8, 5, 15, 16, 38, 46, 3, 4, 24, 31, 28, 7, 40, 35, 37, 29, 27, 19, 23, 50, 21, 33, 53, 32,
];
export const RETURN_OBJECT_CONTROL_TYPE = [26, 27, 48];

export const UPDATA_ITEM_CLASSNAME_BY_TYPE = {
  remove: 'oldBackground',
  add: 'newBackground',
  update: 'defaultBackground',
};

export const WF_STATUS = {
  通过: _l('通过'),
  否决: _l('否决'),
  中止: _l('中止'),
};

export const LOG_SOURCE = {
  2: _l('工作流'),
  3: _l('自定义动作'),
};

export const SOURCE_INFO = {
  1: _l('提交按钮'),
  2: _l('工作流'),
  3: _l('自定义动作'),
  4: 'API',
  5: _l('外部门户'),
  6: _l('公开表单'),
  11: _l('数据集成'),
};

export const EDIT_TYPE_TEXT = {
  12: _l('编辑了附件'),
  13: _l('下载了附件'),
  22: _l('下载了'),
  23: _l('编辑了'),
};

export const SUBLIST_FILE_EDIT_TYPE = [22, 23];
