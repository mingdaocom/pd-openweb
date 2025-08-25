import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement.js';

export const setLoading = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_ROLE_LOADING', data });
  };
};
//角色列表
export const setRoleId = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_ROLEID', data });
  };
};

export const setQuickTag = (data = {}) => {
  return dispatch => {
    dispatch({ type: 'UPDATE_QUICKTAG', data });
    dispatch(setRoleId(data.roleId || 'all'));
  };
};
//选择列表数据
export const setSelectedIds = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_SELECTLIST', data });
  };
};
//成员对象
export const setUser = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_APPUSER', data });
  };
};
//成员列表
export const setUserList = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_APPUSER_LIST', data });
  };
};
//申请数据
export const setApplyList = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_APPLYINFO', data });
  };
};
//外协数据
export const setOutsourcingList = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_OUTSOURCING', data });
  };
};
//角色列表数据
export const setAppRoleSummary = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_APPROLESUMMARY', data });
  };
};

export const SetAppRolePagingModel = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_APPROLEPAGINGMODEL', data });
  };
};

let ajaxOut = null;
export const getOutList = (props, isOut) => {
  return (dispatch, getState) => {
    const { appId } = props;
    const { appRolePagingModel = {} } = getState().appRole;
    isOut && dispatch({ type: 'UPDATE_ROLE_LOADING', data: true });
    if (ajaxOut) {
      ajaxOut.abort();
    }
    ajaxOut = appManagementAjax.getOutsourcingMembers({
      appId,
      ..._.pick(appRolePagingModel, ['pageIndex', 'pageSize']),
    });
    ajaxOut.then(res => {
      dispatch(setOutsourcingList(res));
      isOut && dispatch({ type: 'UPDATE_ROLE_LOADING', data: false });
    });
  };
};

let ajaxAppRoleSummary = null;
export const getRoleSummary = (appId, cb, loading) => {
  return dispatch => {
    if (ajaxAppRoleSummary) {
      ajaxAppRoleSummary.abort();
    }
    loading && dispatch({ type: 'ROLE_UPDATE_PAGE_LOADING', data: true });
    ajaxAppRoleSummary = appManagementAjax.getAppRoleSummary({
      appId,
    });
    ajaxAppRoleSummary.then(res => {
      if (!res.roleInfos) {
        location.reload();
        return;
      }
      dispatch(setAppRoleSummary(res.roleInfos || []));
      dispatch({ type: 'UPDATE_APPROLESUMMARY_ROLELIMITINFO', data: _.omit(res, ['roleInfos']) });
      dispatch({ type: 'ROLE_UPDATE_PAGE_LOADING', data: false });
      cb && cb(res.roleInfos || []);
    });
  };
};

let ajaxApply = null;
export const getApplyList = (props, isApply) => {
  return dispatch => {
    const { appId } = props;
    isApply && dispatch({ type: 'UPDATE_ROLE_LOADING', data: true });
    if (ajaxApply) {
      ajaxApply.abort();
    }
    ajaxApply = appManagementAjax.getAppApplyInfo({
      appId,
    });
    ajaxApply.then(res => {
      dispatch(setApplyList(res));
      isApply && dispatch({ type: 'UPDATE_ROLE_LOADING', data: false });
    });
  };
};

let ajax = null;
export const getUserList = (props, isUserList) => {
  // isAllCount 用于左侧nav的计数 全部
  return (dispatch, getState) => {
    const { appRolePagingModel = {}, roleId = 'all', userList = [] } = getState().appRole;
    const { pageIndex = 1 } = appRolePagingModel;
    const { appId } = props;
    isUserList && dispatch({ type: 'UPDATE_ROLE_LOADING', data: true });
    if (ajax) {
      ajax.abort();
    }
    ajax = ['all', 'apply', 'outsourcing'].includes(roleId)
      ? appManagementAjax.getTotalMember({
          appId,
          ...appRolePagingModel,
        })
      : appManagementAjax.getMembersByRole({
          appId,
          roleId,
          ...appRolePagingModel,
        });
    ajax.then(res => {
      ['all', 'apply', 'outsourcing'].includes(roleId) &&
        dispatch({ type: 'UPDATE_APPUSER_LIST_ALL_TOTAL', data: res.totalCount });
      dispatch(setUser(res));
      dispatch(setUserList(pageIndex > 1 ? userList.concat(res.memberModels || []) : res.memberModels || []));
      isUserList && dispatch({ type: 'UPDATE_ROLE_LOADING', data: false });
    });
  };
};

let CountAllAjax = null;
export const getUserAllCount = props => {
  // isAllCount 用于左侧nav的计数 全部
  return dispatch => {
    const { appId } = props;
    if (CountAllAjax) {
      CountAllAjax.abort();
    }
    CountAllAjax = appManagementAjax.getTotalMember({
      appId,
    });
    CountAllAjax.then(res => {
      dispatch({ type: 'UPDATE_APPUSER_LIST_ALL_TOTAL', data: res.totalCount });
    });
  };
};
// const list = [
//   {
//     name: '全部',
//     roleId: 'all',
//   },
//   {
//     name: '申请加入',
//     roleId: 'apply',
//   },
//   {
//     name: '外协用户',
//     roleId: 'outsourcing',
//   },
// ];

//获取nav
export const fetchAllNavCount = props => {
  return (dispatch, getState) => {
    const { canEditUser } = props;
    if (canEditUser) {
      const { roleId = 'all' } = getState().appRole;
      dispatch(getRoleSummary(props.appId));
      dispatch(getApplyList(props, ['apply'].includes(roleId)));
      dispatch(getOutList(props, ['outsourcing'].includes(roleId)));
      // dispatch(getUserList(props, false));//为了获取计数
    } else {
      dispatch(
        getRoleSummary(props.appId, list => {
          dispatch(setRoleId((list[0] || {}).roleId));
        }),
      );
    }
  };
};
