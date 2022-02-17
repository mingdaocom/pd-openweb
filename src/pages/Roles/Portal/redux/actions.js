import sheetAjax from 'src/api/worksheet';
import {
  getExRoles,
  getUserTemple,
  getUserControls,
  getFilterRows,
  editExAccountsRole,
  editExAccountState,
  getExAccountCategoryCount,
} from 'src/api/externalPortal';
import { formatValues } from 'worksheet/common/WorkSheetFilter/util';
import { pageSize } from '../list/util';

export const getControls = appId => {
  return (dispatch, getState) => {
    dispatch(
      setBaseInfo({
        appId,
      }),
    );
    getUserTemple({ appId }).then((data = []) => {
      dispatch(setControls(data));
      dispatch({
        type: 'UPDATE_CONTROLS_SYS',
        data: data.filter(o =>
          ['portal_name', 'portal_mobile', 'portal_avatar', 'portal_role', 'portal_status', 'portal_regtime'].includes(
            o.controlId,
          ),
        ),
      });
    });
  };
};

export const getCount = appId => {
  return (dispatch, getState) => {
    getExAccountCategoryCount({ appId }).then(res => {
      const { commonCount = 0, unApproveCount = 0 } = res;
      dispatch({
        type: 'UPDATE_COMMONCOUNT',
        data: commonCount,
      });
      dispatch({
        type: 'UPDATE_UNAPPROVECOUNT',
        data: unApproveCount,
      });
    });
  };
};
//控件
export const setBaseInfo = data => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { baseInfo = {} } = portal;
    dispatch({
      type: 'UPDATE_BASE',
      data: {
        ...baseInfo,
        ...data,
      },
    });
  };
};
//控件
export const setControls = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_CONTROLS', data });
  };
};
//设置
export const setControlsSetting = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_CONTROLS_SETTING', data });
  };
};

//成员
export const setList = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_LIST', data });
  };
};

//成员count
export const setCount = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_LIST_COUNT', data });
  };
};

//更新用户数据 角色
export const updateListByRoleid = ({ roleId = '', rowIds = [] }, cb) => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { filters = [], keyWords, pageIndex, fastFilters = [], baseInfo = {}, list } = portal;
    const { appId = '' } = baseInfo;
    editExAccountsRole({
      appId,
      newRoleId: roleId,
      rowIds,
    }).then(res => {
      if (!res) {
        alert(_l('修改失败请稍后再试'), 2);
      } else {
        //更新数据
        dispatch(
          setList(
            list.map(o => {
              if (rowIds.includes(o.rowid)) {
                return { ...o, portal_role: JSON.stringify([roleId]) };
              } else {
                return o;
              }
            }),
          ),
        );
        cb && cb();
      }
    });
  };
};

//更新用户数据 状态
export const updateListByStatus = ({ newState, rowId }) => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { filters = [], keyWords, pageIndex, fastFilters = [], baseInfo = {}, list } = portal;
    const { appId = '' } = baseInfo;
    editExAccountState({
      appId,
      newState,
      rowId,
    }).then(res => {
      if (!res) {
        alert(_l('修改失败请稍后再试'), 2);
      } else {
        dispatch(
          setList(
            list.map(o => {
              if (rowId === o.rowid) {
                return { ...o, portal_status: newState };
              } else {
                return o;
              }
            }),
          ),
        );
      }
    });
  };
};

export const changePageIndex = index => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_INDEX', data: index });
    dispatch(setList([]));
    dispatch(setCount(0));
  };
};

export const getPortalRoleList = appId => {
  return (dispatch, getState) => {
    getExRoles({
      appId,
    }).then(res => {
      dispatch({ type: 'UPDATE_ROLELIST', data: res });
    });
  };
};

export const setPortalRoleList = res => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_ROLELIST', data: res });
  };
};

export const setDefaultRole = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_DEFAULTROLE', data: data });
  };
};

export const setHideIds = list => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_HIDEIDS', data: list });
  };
};

export const setFilter = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_FILTERS', data });
  };
};
//快速筛选
export const setFastFilters = data => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { fastFilters = [] } = portal;
    let newData = fastFilters.slice();
    let value = data.value || (data.values || [])[0];
    if (!value) {
      newData = newData.filter(o => o.controlId !== data.controlId);
    } else {
      if (fastFilters.find(o => o.controlId === data.controlId)) {
        newData = fastFilters.map(o => {
          if (o.controlId !== data.controlId) {
            return o;
          } else {
            return { ...data, controlId: data.controlId };
          }
        });
      } else {
        newData.push({ ...data, controlId: data.controlId });
      }
    }
    dispatch({
      type: 'UPDATE_FASTFILTERS',
      data: newData,
    });
    dispatch(changePageIndex(1));
    dispatch(getList());
  };
};

export const setKeyWords = data => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_KEYWORDS', data });
  };
};
let ajaxFn = null;
export const getList = (PotralStatus = 0, cb) => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_LOADING', data: true });
    const { portal = {} } = getState();
    const { filters = [], keyWords, pageIndex, fastFilters = [], baseInfo = {} } = portal;
    const { appId = '' } = baseInfo;
    ajaxFn && ajaxFn.abort();
    ajaxFn = getFilterRows({
      pageSize,
      pageIndex,
      keyWords,
      filterControls: filters,
      fastFilters: PotralStatus === 3 ? [] : fastFilters,
      appId,
      PotralStatus, //3待审核
    });
    _.debounce(() => {
      ajaxFn.then(res => {
        dispatch(
          setBaseInfo({
            ...baseInfo,
            ...res.worksheet,
          }),
        );
        dispatch(setList(res.data));
        dispatch(setCount(res.count));
        dispatch({ type: 'UPDATE_LOADING', data: false });
        cb && cb();
      });
    }, 500)();
  };
};
