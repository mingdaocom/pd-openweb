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
  [PERMISSION_WAYS.OnlyManageSelfRecord]: _l('只能查看加入的和管理自己拥有的记录'),
  [PERMISSION_WAYS.OnlyManageSelfAndSubRecord]: _l('只能查看加入的和管理自己拥有的记录'),
  [PERMISSION_WAYS.ViewAllAndManageSelfRecord]: _l('可查看所有记录，但只能管理自己拥有的记录'),
  [PERMISSION_WAYS.ViewAllAndManageSelfAndSubRecord]: _l('可查看所有记录，但只能管理自己拥有的记录'),
  [PERMISSION_WAYS.ManageAllRecord]: _l('可查看、管理所有记录'),
};

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
