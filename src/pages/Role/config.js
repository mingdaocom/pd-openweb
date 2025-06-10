import React from 'react';
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
    txt: _l('公开分享'),
    tips: _l('包含记录公开分享、视图公开分享'),
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
    tips: _l('记录日志'),
  },
];

export const sheetActionList = [
  // {
  //   key: 'worksheetAddRecord',
  //   txt: _l('新增记录'),
  // },
  {
    key: 'worksheetShareView',
    txt: _l('公开分享'),
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
  // {
  //   key: 'worksheetLogging',
  //   txt: _l('日志'),
  // },
  {
    key: 'worksheetBatchOperation',
    txt: _l('批量操作'),
    tips: _l('批量操作是指工作表的批量勾选记录功能，开启后用户可以批量执行拥有权限的操作。'),
  },
];

export const recordActionList = [
  {
    key: 'recordShare',
    txt: _l('公开分享'),
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

export const sysRoleType = [100, 1, 2];
export const adminType = [100];

export const sysRoleList = [
  {
    roleType: 100,
    name: _l('管理员'),
    des: _l('管理员可以配置应用，管理应用下所有数据和人员'),
    info: () => {
      return <div>{_l('拥有所有权限')}</div>;
    },
  },
  {
    roleType: 2,
    name: _l('运营者'),
    des: _l('管理所有数据和普通角色下的成员，不可配置应用'),
    info: () => {
      return (
        <div>
          <div>{_l('运营者能管理普通角色下的成员，主要包含：')}</div>
          <div>1、{_l('管理普通角色下的角色负责人')}</div>
          <div>2、{_l('管理所有普通角色下的成员')}</div>
          <div>3、{_l('可查看、编辑、删除所有记录')}</div>
          <div>{_l('注：运营者不可复制、删除、导出应用')}</div>
        </div>
      );
    },
  },
  {
    roleType: 1,
    name: _l('开发者'),
    des: _l('开发者只能配置应用'),
    info: () => {
      return (
        <div>
          <div>{_l('开发者能配置应用，主要包含：')}</div>
          <div>
            1、
            {_l(
              '可配置应用导航/分组、工作流、工作表、自定义页面、用户角色新增/编辑/删除（包含外部门户角色）、外部门户设置（ 包含外部门户域名配置）',
            )}
          </div>
          <div>2、{_l('工作表跨应用关联，被关联的工作表所属应用必须是应用“开发者”或“管理员”')}</div>
          <div>3、{_l('可查看加入的，只能编辑、删除自己拥有的记录 注：开发者不可复制、删除、导出应用')}</div>
        </div>
      );
    },
  },
];

export const ICON_ROLE_TYPE = {
  100: 'manage_accounts', // 管理员
  2: 'account_box', // 运营者
  1: 'construction', // 开发者
};
