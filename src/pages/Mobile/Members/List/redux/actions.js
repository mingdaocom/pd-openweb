import ajaxRequest from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';
import { Modal } from 'antd-mobile';
import _ from 'lodash';

export const getMembersList = (appId, roleId) => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_LIST_FETCH_START' });
  Promise.all([
    homeAppAjax.getAppDetail({ appId }).then(),
    // ajaxRequest.getRoleDetail({ appId, roleId }).then(),
    ajaxRequest.getRolesWithUsers({ appId }).then(),
  ]).then(res => {
    const [detail, list] = res;
    dispatch({
      type: 'UPDATE_MEMBER_LIST',
      data: {
        detail,
        list: _.cloneDeep(list),
      },
    });
    dispatch({ type: 'MOBILE_LIST_FETCH_SUCCESS' });
  });
};

/**
 * 删除成员
 */
export const removeUserFromRole =
  ({ projectId, appId, roleId, userIds, departmentIds, departmentTreeIds, projectOrganizeIds, jobIds }) =>
  dispatch => {
    dispatch({ type: 'MOBILE_UPDATELIST_FETCH_START' });
    ajaxRequest
      .removeRoleMembers({
        projectId,
        appId,
        roleId,
        userIds,
        departmentIds,
        departmentTreeIds,
        projectOrganizeIds,
        jobIds,
      })
      .then(data => {
        dispatch({ type: 'MOBILE_UPDATELIST_FETCH_OVER' });
        if (data.result) {
          dispatch(getMembersList(appId));
        } else {
          Modal.alert(_l('移除失败'), '', [
            {
              text: _l('确定'),
              onPress: () => {},
            },
          ]);
        }
      });
  };

/**
 * 退出角色
 */
export const exitRole =
  ({ roleId, appId, callback }) =>
  dispatch => {
    dispatch({ type: 'MOBILE_UPDATELIST_FETCH_START' });
    ajaxRequest
      .quitAppForRole({
        appId,
        roleId,
      })
      .then(res => {
        dispatch({ type: 'MOBILE_UPDATELIST_FETCH_OVER' });
        if (res.isRoleForUser) {
          if (res.isRoleDepartment) {
            callback();
          } else {
            Modal.alert(_l('无法退出通过部门加入的角色'), _l('您所在的部门被加入了此角色，只能由应用管理员进行操作'), [
              {
                text: _l('确定'),
                onPress: () => {},
              },
            ]);
          }
        } else {
          Modal.alert(_l('退出失败'), '', [
            {
              text: _l('确定'),
              onPress: () => {},
            },
          ]);
        }
      });
  };

/**
 * 添加成员提交
 */
export const addRoleMembers =
  ({
    projectId,
    appId,
    roleId,
    users,
    departmentIds = [],
    departmentTreeIds = [],
    jobIds = [],
    projectOrganizeIds = [],
  }) =>
  dispatch => {
    dispatch({ type: 'MOBILE_UPDATELIST_FETCH_START' });
    ajaxRequest
      .addRoleMembers({
        projectId,
        appId,
        roleId,
        userIds: _.map(users, ({ accountId }) => accountId),
        departmentIds,
        departmentTreeIds,
        jobIds,
        projectOrganizeIds,
      })
      .then(res => {
        dispatch({ type: 'MOBILE_UPDATELIST_FETCH_OVER' });
        if (res) {
          dispatch(getMembersList(appId));
        } else {
          Modal.alert(_l('添加失败'), '', [
            {
              text: _l('确定'),
              onPress: () => {},
            },
          ]);
        }
      });
  };

/**
 * 转交他人
 */
export const transferApp =
  ({ appId, memberId }) =>
  dispatch => {
    dispatch({ type: 'MOBILE_UPDATELIST_FETCH_START' });
    ajaxRequest
      .updateAppOwner({
        appId,
        memberId,
      })
      .then(res => {
        dispatch({ type: 'MOBILE_UPDATELIST_FETCH_OVER' });
        if (res) {
          dispatch(getMembersList(appId));
        } else {
          Modal.alert(_l('托付失败'), '', [
            {
              text: _l('确定'),
              onPress: () => {},
            },
          ]);
        }
      });
  };
