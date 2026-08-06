import ajaxRequest from 'src/api/appManagement';
import { getTranslateInfo } from 'src/utils/app';

export const getMembersList = appId => dispatch => {
  dispatch({
    type: 'MOBILE_ROLE_LIST_FETCH_START',
  });
  ajaxRequest.getAppRoleSummary({ appId }).then(res => {
    const { roleInfos = [] } = res;
    dispatch({
      type: 'UPDATE_ROLE_LIST',
      data: {
        list: roleInfos.map(item => {
          const translateInfo = getTranslateInfo(appId, null, item.roleId);
          return {
            ...item,
            name: translateInfo.name || item.name,
            description: translateInfo.description || item.description,
          };
        }),
      },
    });
    dispatch({
      type: 'MOBILE_ROLE_LIST_FETCH_SUCCESS',
    });
  });
};

export const removeUserToRole =
  ({
    projectId,
    appId,
    sourceAppRoleId,
    resultAppRoleIds,
    userIds,
    departmentIds,
    projectOrganizeIds,
    jobIds,
    departmentTreeIds,
  }) =>
  dispatch => {
    // dispatch({
    //   type: 'MOBILE_ROLE_MOVE_FETCH_START',
    // });
    ajaxRequest
      .removeUserToRole({
        projectId,
        appId,
        sourceAppRoleId,
        resultAppRoleIds,
        userIds,
        departmentIds,
        projectOrganizeIds,
        jobIds,
        departmentTreeIds,
      })
      .then(res => {
        if (res) {
          dispatch({
            type: 'MOBILE_ROLE_MOVE_FETCH_SUCCESS',
          });
        } else {
          dispatch({
            type: 'MOBILE_ROLE_MOVE_FETCH_FAIL',
          });
        }
      });
  };
