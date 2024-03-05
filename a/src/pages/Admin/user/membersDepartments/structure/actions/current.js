import importUserAjax from 'src/api/importUser';
import userAjax from 'src/api/user';

export const UPDATE_CURSOR = 'UPDATE_CURSOR';
export const REMOVE_CURSOR = 'REMOVE_CURSOR';
import { CALL_API } from '../middleware/api';

export const ADD_TO_USERSET = 'ADD_TO_USERSET';
export const REMOVE_FROM_USERSET = 'REMOVE_FROM_USERSET';
export const EMPTY_USERSET = 'EMPTY_USERSET';

export const APPROVAL_LOAD = 'APPROVAL_LOAD';
export const APPROVAL_SUCCESS = 'APPROVAL_SUCCESS';
export const APPROVAL_FAILED = 'APPROVAL_FAILED';

export const INACTIVE_LOAD = 'INACTIVE_LOAD';
export const INACTIVE_SUCCESS = 'INACTIVE_SUCCESS';
export const INACTIVE_FAILED = 'INACTIVE_FAILED';

export const UPDATE_ACTIVE_OPLIST = 'UPDATE_ACTIVE_OPLIST';
export const UPDATE_PROJECT_ID = 'UPDATE_PROJECT_ID';
export const UPDATE_TYPE = 'UPDATE_TYPE';
export const UPDATE_TYPE_CURSOR = 'UPDATE_TYPE_CURSOR';

export const UPDATE_SELECT_ALL = 'UPDATE_SELECT_ALL';
/**
 * action: 设置当前网络id
 * @param projectId
 */
export const updateProjectId = projectId => ({
  type: UPDATE_PROJECT_ID,
  projectId,
});
/**
 * action: 设置当前部门/职位tab
 * @param type
 */
export const updateType = typeNum => ({
  type: UPDATE_TYPE,
  typeNum,
});

/**
 * action: 全公司0/未分配1/未审核2/待激活3
 * @param type
 */
export const updateTypeCursor = typeCursor => ({
  type: UPDATE_TYPE_CURSOR,
  typeCursor,
});

/**
 * action: 设置当前选中部门
 * @param departmentId
 */
export const updateCursor = departmentId => ({
  type: UPDATE_CURSOR,
  departmentId,
});

/**
 * action: 清除当前选中部门，选中公司节点
 */
export const removeCursor = () => ({
  type: REMOVE_CURSOR,
});

/**
 * action: 打开对应accountId用户的设置列表
 * @param accountId
 */
export const updateUserOpList = accountId => ({
  type: UPDATE_ACTIVE_OPLIST,
  accountId,
});

/**
 * action: 添加accountIds到选中用户set
 * @param accountIds
 */
export const addUserToSet = accountIds => ({
  type: ADD_TO_USERSET,
  accountIds,
});

/**
 * action: 从用户set中移除accountIds
 * @param accountIds
 */
export const removeUserFromSet = accountIds => ({
  type: REMOVE_FROM_USERSET,
  accountIds,
});

/**
 * action: 清空选中用户set
 */
export const emptyUserSet = () => ({
  type: EMPTY_USERSET,
});

/**
 * action: 选中all用户set
 */
export const updateSelectAll = isSelectAll => ({
  type: UPDATE_SELECT_ALL,
  isSelectAll,
});

/**
 * action: 获取网络下未激活的用户数
 * @param projectId
 */
export const fetchApproval = projectId => dispatch => {
  return dispatch({
    [CALL_API]: {
      types: [APPROVAL_LOAD, APPROVAL_SUCCESS, APPROVAL_FAILED],
      params: { projectId },
    },
  });
};

export const fetchInActive = projectId => dispatch => {
  return dispatch({
    [CALL_API]: {
      types: [INACTIVE_LOAD, INACTIVE_SUCCESS, INACTIVE_FAILED],
      params: { projectId },
    },
  });
};

export const updateSelectedAccountIds = selectedAccountIds => ({
  type: 'UPDATE_SELECTED_ACCOUNTIDS',
  selectedAccountIds,
});

export const updateUserStatus = userStatus => ({
  type: 'UPDATE_USER_TATUS',
  userStatus,
});

export const updateNoDepartmentUsers = noDepartmentUsers => ({
  type: 'UPDATE_NO_DEPARTMENT_USERS',
  noDepartmentUsers,
});

// 重新邀请
export const fetchReInvite = (accountIds, callback) => (dispatch, getState) => {
  const { projectId } = getState().current;

  importUserAjax
    .reInviteImportUser({
      accounts: accountIds,
      projectId,
    })
    .then(res => {
      if (_.isFunction(callback)) {
        callback();
      }
      if (res) {
        alert(_l('重新邀请成功'));
      } else {
        alert(_l('重新邀请失败'), 2);
      }
    });
};

// 取消邀请并移除
export const fetchCancelImportUser = (accountIds, callback) => (dispatch, getState) => {
  const { projectId } = getState().current;

  importUserAjax
    .cancelImportUser({
      accounts: accountIds,
      projectId,
    })
    .then(res => {
      if (res) {
        if (_.isFunction(callback)) {
          callback();
        }
      } else {
        alert(_l('取消失败'), 2);
      }
    });
};