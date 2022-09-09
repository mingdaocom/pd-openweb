import ajaxRequest from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';

export const getMembersList = (appId, roleId) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_ROLE_LIST_FETCH_START',
  });
  Promise.all([
    // homeAppAjax.getAppDetail({
    //   appId,
    // }).then(),
    ajaxRequest.getRolesWithUsers({ appId }).then(),
  ]).then(res => {
    const [
      // detail,
      list,
    ] = res;
    dispatch({
      type: 'UPDATE_ROLE_LIST',
      data: {
        // detail,
        list,
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
    resultAppRoleId,
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
        resultAppRoleId,
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
