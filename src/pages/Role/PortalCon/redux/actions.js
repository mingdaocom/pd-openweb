import externalPortalAjax from 'src/api/externalPortal';
import { pageSizeForPortal } from 'src/pages/Role/PortalCon/tabCon/config';

export const getControls = (appId, projectId) => {
  return dispatch => {
    dispatch(
      setBaseInfo({
        appId,
        projectId,
      }),
    );
    externalPortalAjax.getUserTemple({ appId }).then((data = []) => {
      dispatch(setControls(data));
    });
  };
};

export const getCount = appId => {
  return dispatch => {
    externalPortalAjax.getExAccountCategoryCount({ appId }).then(res => {
      const { commonCount = 0, unApproveCount = 0, roleMemberStatistics } = res;
      dispatch({
        type: 'UPDATE_COMMONCOUNT',
        data: commonCount,
      });
      dispatch({
        type: 'UPDATE_UNAPPROVECOUNT',
        data: unApproveCount,
      });
      dispatch({
        type: 'UPDATE_PORTAL_USER_COUNT',
        data: roleMemberStatistics,
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
  return dispatch => {
    dispatch({ type: 'UPDATE_CONTROLS', data });
  };
};
//设置
export const setControlsSetting = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_CONTROLS_SETTING', data });
  };
};

//成员
export const setList = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_LIST', data });
  };
};

//成员count
export const setCount = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_LIST_COUNT', data });
  };
};

//更新用户数据 角色
export const updateListByRoleid = ({ roleId = '', rowIds = [] }, cb) => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { baseInfo = {}, list } = portal;
    const { appId = '' } = baseInfo;
    externalPortalAjax
      .editExAccountsRole({
        appId,
        newRoleId: roleId,
        rowIds,
      })
      .then(res => {
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

//激活用户
export const activateExAccounts = ({ rowIds, cb }) => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { baseInfo = {}, list = [] } = portal;
    const { appId = '' } = baseInfo;
    externalPortalAjax
      .activatExAccounts({
        appId,
        rowIds,
      })
      .then(res => {
        if (res) {
          alert(_l('激活成功'));
          dispatch(
            setList(
              list.map(o => {
                if (rowIds.includes(o.rowid)) {
                  return { ...o, portal_status: JSON.stringify([`1`]) };
                } else {
                  return o;
                }
              }),
            ),
          );
          cb && cb();
        } else {
          alert(_l('激活失败'), 2);
        }
      });
  };
};

//更新用户数据 状态
export const updateListByStatus = ({ newState, rowIds, cb }) => {
  return (dispatch, getState) => {
    const { portal = {} } = getState();
    const { baseInfo = {}, list = [] } = portal;
    const { appId = '' } = baseInfo;
    externalPortalAjax
      .editExAccountState({
        appId,
        newState,
        rowIds,
      })
      .then(res => {
        if (!res) {
          alert(_l('修改失败请稍后再试'), 2);
        } else {
          dispatch(
            setList(
              list.map(o => {
                if (rowIds.includes(o.rowid)) {
                  return { ...o, portal_status: JSON.stringify([`${newState}`]) };
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

export const changePageIndex = index => {
  return dispatch => {
    dispatch({ type: 'UPDATE_INDEX', data: index });
    if (index === 1) {
      dispatch(setList([]));
      dispatch(setCount(0));
    }
  };
};

export const getPortalRoleList = appId => {
  return dispatch => {
    dispatch({ type: 'UPDATE_LOADING', data: true });
    externalPortalAjax
      .getExRoles({
        appId,
      })
      .then(res => {
        dispatch({ type: 'UPDATE_ROLELIST', data: res });
        dispatch({ type: 'UPDATE_LOADING', data: false });
      });
  };
};

export const setPortalRoleList = res => {
  return dispatch => {
    dispatch({ type: 'UPDATE_ROLELIST', data: res });
  };
};

export const setDefaultRole = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_DEFAULTROLE', data: data });
  };
};

export const setHideIds = list => {
  return dispatch => {
    dispatch({ type: 'UPDATE_HIDEIDS', data: list });
  };
};

export const setFilter = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_FILTERS', data });
  };
};
//快速筛选
export const setFastFilters = data => {
  return dispatch => {
    dispatch(setFastFiltersData(data));
    dispatch(changePageIndex(1));
    dispatch(getList());
  };
};
//快速筛选参数
export const setFastFiltersData = data => {
  return (dispatch, getState) => {
    if (!data) {
      dispatch({
        type: 'UPDATE_FASTFILTERS',
        data: [],
      });
    } else {
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
    }
  };
};
export const setDefaultFastFilters = () => {
  return dispatch => {
    dispatch({
      type: 'UPDATE_FASTFILTERS',
      data: [],
    });
  };
};
export const setSortControls = (data, cb) => {
  return dispatch => {
    dispatch({ type: 'UPDATE_SORTCONTROLS', data });
    cb && cb();
  };
};
export const setKeyWords = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_KEYWORDS', data });
  };
};
export const setTelFilters = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_TELFILTERS', data });
  };
};
//排序
export const handleChangeSort = (sorter, PotralStatus = 0) => {
  return dispatch => {
    const { field, column, order } = sorter;
    if (!order) {
      dispatch(
        setSortControls([], () => {
          dispatch(getList(PotralStatus));
        }),
      );
    } else {
      dispatch(
        setSortControls(
          [
            {
              controlId: field,
              datatype: column.type,
              isAsc: order === 'ascend',
            },
          ],
          () => {
            dispatch(getList(PotralStatus));
          },
        ),
      );
    }
  };
};

const getFilterTels = telFilters => {
  if (!telFilters) {
    return '';
  }
  let code = telFilters.split(/[(\r\n)\r\n]+/); // 根据换行或者回车进行识别
  code.forEach((item, index) => {
    // 删除空项
    if (!item) {
      code.splice(index, 1);
    }
  });
  return Array.from(new Set(code));
};
let ajaxFn = null;
export const getList = (PotralStatus = 0, cb) => {
  return (dispatch, getState) => {
    dispatch({ type: 'UPDATE_LOADING', data: true });
    const { portal = {} } = getState();
    const {
      filters = [],
      keyWords,
      pageIndex,
      fastFilters = [],
      baseInfo = {},
      sortControls = [],
      telFilters = ``,
      list = [],
    } = portal;
    const { appId = '' } = baseInfo;
    ajaxFn = externalPortalAjax.getFilterRows({
      pageSize: pageSizeForPortal,
      pageIndex,
      keyWords,
      filterControls: filters,
      fastFilters:
        PotralStatus === 3
          ? []
          : telFilters
            ? fastFilters.concat({
                controlId: 'portal_mobile',
                dataType: 3,
                dynamicSource: [],
                filterType: 1,
                spliceType: 1,
                values: getFilterTels(telFilters),
              })
            : fastFilters,
      appId,
      PotralStatus, //3待审核
      sortControls,
    });
    ajaxFn.then(res => {
      dispatch(
        setBaseInfo({
          ...baseInfo,
          ...res.worksheet,
        }),
      );
      if (!(location.href.indexOf('/role/external/pending') >= 0 && PotralStatus !== 3)) {
        dispatch(setList(pageIndex > 1 ? list.concat(res.data) : res.data));
      }
      dispatch(setCount(res.count));
      dispatch({ type: 'UPDATE_LOADING', data: false });
      cb && cb();
    });
  };
};

export const setQuickTag = (data = {}) => {
  return dispatch => {
    dispatch({ type: 'UPDATE_QUICKTAG', data });
    dispatch(setRoleId(data.roleId || 'all'));
  };
};

export const setRoleId = data => {
  return dispatch => {
    dispatch({ type: 'UPDATE_DEFAULT_ROLEID', data });
  };
};
