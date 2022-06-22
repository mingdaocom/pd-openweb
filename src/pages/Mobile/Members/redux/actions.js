import homeAppAjax from 'src/api/homeApp';
import ajaxRequest from 'src/api/appManagement';

export const getMembers = (
  appId,
) => (dispatch, getState) => {
  dispatch({ type: 'MOBILE_FETCH_MEMBER_START' });
  Promise.all([
    homeAppAjax.getAppDetail({ appId }).then(),
    // 根据应用获取角色
    ajaxRequest.getRolesWithUsers({ appId }).then(),
    // 申请状况
    ajaxRequest.getAppApplyInfo({ appId }).then(),
    // 获取成员是否可角色见列表状态
    window.isPublicApp ? undefined : ajaxRequest.getMemberStatus({ appId }).then(),
  ]).then(
    result => {
      const [detail, list, applyList, rolesVisibleConfig] = result;
      const listData = list.map(({
        roleType,
        roleId,
        name,
        users,
        description,
        permissionWay,
        departmentsInfos,
      }) => {
        return {
          departmentsInfos,
          users,
          roleId,
          roleType,
          label: name,
          description,
          permissionWay,
          count: users.length + departmentsInfos.length,
        };
      });
      dispatch({
        type: 'UPDATE_MEMBER_DATA',
        data: {
          detail,
          listData,
          applyList,
          rolesVisibleConfig,
        },
      });
      dispatch({ type: 'MOBILE_FETCH_MEMBER_SUCCESS' });
    }
  );
};

// 删除应用
export const deleteApp = ({
  projectId,
  appId,
}, cb) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_ACTION_ING',
  });
  homeAppAjax.deleteApp({
    appId,
    projectId,
    isHomePage: true,
  }).then(res => {
    cb && cb(res);
  });
};

// 退出应用
export const quitApp = ({
  appId,
  projectId,
}, cb) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_ACTION_ING',
  });
  ajaxRequest.quitRole({
    appId,
    projectId,
  }).then(res => {
    cb && cb(res);
  });
};
