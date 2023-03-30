import PropTypes from 'prop-types';

export const PERMISSION_WAYS = {
  CUSTOM: 0,
  OnlyViewAllRecord: 20,
  OnlyManageSelfRecord: 30,
  OnlyManageSelfAndSubRecord: 40,
  ViewAllAndManageSelfRecord: 50,
  ViewAllAndManageSelfAndSubRecord: 60,
  ManageAllRecord: 80,
};

export const TEXTS = {
  [PERMISSION_WAYS.CUSTOM]: _l('自定义权限'),
  [PERMISSION_WAYS.OnlyViewAllRecord]: _l('对所有记录只有查看权限'),
  [PERMISSION_WAYS.OnlyManageSelfRecord]: _l('可查看加入的，只能编辑、删除自己拥有的记录'),
  [PERMISSION_WAYS.OnlyManageSelfAndSubRecord]: _l('可查看加入的，只能编辑、删除自己拥有的记录'),
  [PERMISSION_WAYS.ViewAllAndManageSelfRecord]: _l('可查看所有记录，但只能编辑、删除自己拥有的记录'),
  [PERMISSION_WAYS.ViewAllAndManageSelfAndSubRecord]: _l('可查看所有记录，但只能编辑、删除自己拥有的记录'),
  [PERMISSION_WAYS.ManageAllRecord]: _l('可查看、编辑、删除所有记录'),
};

export const LOGIN_WAY = [
  { key: 'weChat', txt: _l('微信扫码') },
  { key: 'phone', txt: _l('验证码') },
  { key: 'password', txt: _l('密码') },
];
export const REJISTER_WAY = [
  { key: 'phone', txt: _l('手机') },
  { key: 'email', txt: _l('邮箱') },
];

export const ROLE_TYPES = {
  OWNER: 200,
  ADMIN: 100,
  MEMBER: 50,
  READONLY: 10,
};

/**
 * propTypes
 */
export const usePropType = PropTypes.shape({
  fullName: PropTypes.string,
  accountId: PropTypes.string,
});

export const rolePropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(usePropType),
});

export const roleDetailPropType = PropTypes.shape({
  appId: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string,
  permissionWay: PropTypes.number,
  projectId: PropTypes.string,
  roleType: PropTypes.number,
  userIds: PropTypes.arrayOf(PropTypes.string),
});

export const fieldPropType = PropTypes.shape({
  fieldId: PropTypes.string,
  fieldName: PropTypes.string,
  notAdd: PropTypes.boolean,
  notEdit: PropTypes.boolean,
  notRead: PropTypes.boolean,
});

export const ROLE_CONFIG = {
  REFUSE: '2',
  PERMISSION: '1',
};


export const actionList = [
  {
    key: 'generalAdd',
    txt: _l('新增'),
  },
  {
    key: 'gneralShare',
    txt: _l('分享'),
    tips: _l('包含记录分享、视图分享'),
  },
  {
    key: 'generalImport',
    txt: _l('导入'),
  },
  {
    key: 'generalExport',
    txt: _l('导出'),
  },
  {
    key: 'generalDiscussion',
    txt: _l('讨论'),
    tips: _l('包含工作表讨论、记录讨论'),
  },
  {
    key: 'generalSystemPrinting',
    txt: _l('系统打印'),
  },
  {
    key: 'generalAttachmentDownload',
    txt: _l('附件下载'),
  },
  {
    key: 'generalLogging',
    txt: _l('日志'),
    tips: _l('包含工作表日志、记录日志'),
  },
];

export const sheetActionList = [
  // {
  //   key: 'worksheetAddRecord',
  //   txt: _l('新增记录'),
  // },
  {
    key: 'worksheetShareView',
    txt: _l('分享'),
  },
  {
    key: 'worksheetImport',
    txt: _l('导入'),
  },
  {
    key: 'worksheetExport',
    txt: _l('导出'),
  },
  {
    key: 'worksheetDiscuss',
    txt: _l('讨论'),
  },
  {
    key: 'worksheetLogging',
    txt: _l('日志'),
  },
  {
    key: 'worksheetBatchOperation',
    txt: _l('批量操作'),
    tips: _l('批量操作是指工作表的批量勾选记录功能，开启后用户可以批量执行拥有权限的操作。')
  },

];

export const recordActionList = [
  {
    key: 'recordShare',
    txt: _l('分享'),
  },
  {
    key: 'recordDiscussion',
    txt: _l('讨论'),
  },
  {
    key: 'recordSystemPrinting',
    txt: _l('系统打印'),
  },
  {
    key: 'recordAttachmentDownload',
    txt: _l('附件下载'),
  },
  {
    key: 'recordLogging',
    txt: _l('日志'),
  },
];

export const USER_EXTEND_INFO_FEATURE_ID = 27;
