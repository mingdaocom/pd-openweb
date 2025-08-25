import ajaxRequest from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';

// 申请状况
const getAppApplyInfo = appId => (dispatch, getState) => {
  const { memberData } = getState().mobile;
  ajaxRequest.getAppApplyInfo({ appId }).then(res => {
    dispatch({
      type: 'UPDATE_MEMBER_DATA',
      data: {
        ...memberData,
        applyList: res,
      },
    });
    dispatch({ type: 'MOBILE_FETCH_MEMBER_SUCCESS' });
  });
};

export const getMembers = appId => dispatch => {
  dispatch({ type: 'MOBILE_FETCH_MEMBER_START' });
  Promise.all([
    homeAppAjax.getApp({ appId }).then(),
    // 根据应用获取角色
    ajaxRequest.getRolesWithUsers({ appId }).then(),
    // 获取成员是否可角色见列表状态
    window.isPublicApp ? undefined : ajaxRequest.getAppRoleSetting({ appId }).then(),
  ]).then(result => {
    const [detail, list, rolesVisibleConfig = {}] = result;
    const isAdmin =
      detail.permissionType === APP_ROLE_TYPE.POSSESS_ROLE || detail.permissionType === APP_ROLE_TYPE.ADMIN_ROLE;
    const listData = list.map(
      ({
        roleType,
        roleId,
        name,
        users,
        description,
        permissionWay,
        departmentTreesInfos = [],
        jobInfos = [],
        projectOrganizeInfos = [],
      }) => {
        return {
          users,
          roleId,
          roleType,
          label: name,
          description,
          permissionWay,
          count: users.length + departmentTreesInfos.length + jobInfos.length + projectOrganizeInfos.length,
        };
      },
    );

    dispatch({
      type: 'UPDATE_MEMBER_DATA',
      data: {
        detail,
        listData,
        rolesVisibleConfig: rolesVisibleConfig.appSettingsEnum,
      },
    });
    if (isAdmin) {
      dispatch(getAppApplyInfo(appId));
      return;
    }
    dispatch({ type: 'MOBILE_FETCH_MEMBER_SUCCESS' });
  });
};

// 删除应用
export const deleteApp =
  ({ projectId, appId }, cb) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_ACTION_ING',
    });
    homeAppAjax
      .deleteApp({
        appId,
        projectId,
        isHomePage: true,
      })
      .then(res => {
        cb && cb(res);
      });
  };

// 退出应用
export const quitApp =
  ({ appId, projectId }, cb) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_ACTION_ING',
    });
    ajaxRequest
      .quitRole({
        appId,
        projectId,
      })
      .then(res => {
        cb && cb(res);
      });
  };
