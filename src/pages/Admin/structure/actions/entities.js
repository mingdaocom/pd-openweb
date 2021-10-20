import { CALL_API } from '../middleware/api';
import { PAGE_SIZE, COMPANY_DEPARMENTID } from '../constant';
import { getProjectInfo } from '../../config';

// async actions and action creator
export const DEPARTMENT_REQUEST = 'DEPARTMENT_REQUEST';
export const DEPARTMENT_SUCCESS = 'DEPARTMENT_SUCCESS';
export const DEPARTMENT_FAILURE = 'DEPARTMENT_FAILURE';

/**
 * fetch departments
 * relies on middleware `api`
 */
const fetchDepartments = (departmentId, pageIndex, afterRequest) => {
  const params = { departmentId, returnCount: true, pageIndex, pageSize: 100 };
  return {
    departmentId,
    [CALL_API]: {
      types: [DEPARTMENT_REQUEST, DEPARTMENT_SUCCESS, DEPARTMENT_FAILURE],
      params,
      afterRequest,
    },
  };
};

/**
 * fetch departments beforehand
 * relies on redux-thunk
 */

export const loadDepartments = (departmentId, pageIndex, afterRequest) => dispatch => {
  // TODO: check fields if necessary
  return dispatch(fetchDepartments(departmentId, pageIndex, afterRequest));
};

export const DEPARTMENT_UPDATE = 'DEPARTMENT_UPDATE';
export const departmentUpdate = (newDepartments, department, id) => ({
  type: DEPARTMENT_UPDATE,
  newDepartments,
  department,
  id,
});

export const EXPANDED_KEYS_UPDATE = 'EXPANDED_KEYS_UPDATE';
export const expandedKeysUpdate = expandedKeys => ({
  type: EXPANDED_KEYS_UPDATE,
  expandedKeys,
});

export const USER_REQUEST = 'USER_REQUEST';
export const USER_SUCCESS = 'USER_SUCCESS';
export const USER_FAILURE = 'USER_FAILURE';

/** fetch users
 * relies on middleware `api`
 */
const fetchUser = (departmentId, pageIndex) => {
  const params = {
    departmentId,
    pageIndex,
    pageSize: PAGE_SIZE,
  };
  return {
    departmentId,
    pageIndex,
    [CALL_API]: {
      types: [USER_REQUEST, USER_SUCCESS, USER_FAILURE],
      params,
    },
  };
};

/** fetch users before hand
 * relies on redux-thunk
 */
export const loadUsers = (departmentId, pageIndex) => dispatch => {
  // TODO: check fields if necessary
  return dispatch(fetchUser(departmentId, pageIndex || 1));
};

// sync actions and action creator

export const INIT_ROOT = 'INIT_ROOT';
/**
 * initRoot Creator
 * @param departmentId
 * @returns {{type: string, response: *[]}}
 */
export const initRoot = departmentId => {
  // 获取网络信息
  const departmentName = getProjectInfo().companyName;
  return {
    type: INIT_ROOT,
    response: [
      {
        departmentName,
        departmentId,
        isExpired: true,
        collapsed: false, // 默认展开
        haveSubDepartment: true, // 默认有子部门
      },
    ],
  };
};

export const DEPARTMENT_TOGGLE = 'DEPARTMENT_TOGGLE';
/**
 * toggle department collapsed state
 * @description 部门节点打开关闭
 * @param departmentId
 */
export const toggle = departmentId => ({
  type: DEPARTMENT_TOGGLE,
  departmentId,
});

export const DELETE_DEPARTMENT = 'DELETE_DEPARTMENT';
/**
 * delete department
 * @param departmentId
 * @param parentId
 */
export const deleteDepartment = ({ departmentId, parentId }) => ({
  type: DELETE_DEPARTMENT,
  departmentId,
  parentId,
});

export const FULL_TREE_REQUEST = 'FULL_TREE_REQUEST';
export const FULL_TREE_SUCCESS = 'FULL_TREE_SUCCESS';
export const FULL_TREE_FAILURE = 'FULL_TREE_FAILURE';

/**
 * 获取root到该部门的树状结构
 * @param departmentId
 * @param collapseAll
 * @param afterRequest
 */
export const getFullTree =
  ({ departmentId, collapseAll = false, expandedKeys = [], afterRequest }) =>
  dispatch => {
    return dispatch({
      departmentId: COMPANY_DEPARMENTID,
      curDepartmentId: departmentId,
      collapseAll,
      expandedKeys,
      [CALL_API]: {
        types: [FULL_TREE_REQUEST, FULL_TREE_SUCCESS, FULL_TREE_FAILURE],
        params: {
          departmentId,
        },
        afterRequest,
      },
    });
  };

export const APPROVAL_USER_REQUEST = 'APPROVAL_USER_REQUEST';
export const APPROVAL_USER_SUCCESS = 'APPROVAL_USER_SUCCESS';
export const APPROVAL_USER_FAILURE = 'APPROVAL_USER_FAILURE';

/** fetch approval_user
 * relies on middleware `api`
 */
const fetchApprovalUser = (
  // sortField,
  // sortType,
  // keywords,
  projectId,
  pageIndex,
) => {
  const params = {
    pageIndex,
    // sortField,
    // sortType,
    // keywords,
    projectId,
    pageSize: PAGE_SIZE,
  };
  return {
    projectId,
    pageIndex,
    [CALL_API]: {
      types: [APPROVAL_USER_REQUEST, APPROVAL_USER_SUCCESS, APPROVAL_USER_FAILURE],
      params,
    },
  };
};

/** fetch approvalUser before hand
 * relies on redux-thunk
 */
export const loadApprovalUsers = (projectId, pageIndex) => dispatch => {
  // TODO: check fields if necessary
  return dispatch(fetchApprovalUser(projectId, pageIndex || 1));
};

export const INACTIVE_USER_REQUEST = 'INACTIVE_USER_REQUEST';
export const INACTIVE_USER_SUCCESS = 'INACTIVE_USER_SUCCESS';
export const INACTIVE_USER_FAILURE = 'INACTIVE_USER_FAILURE';

/** fetch Inactive_user
 * relies on middleware `api`
 */
const fetchInactiveUser = (
  // sortField,
  // sortType,
  // keywords,
  projectId,
  pageIndex,
) => {
  const params = {
    pageIndex,
    // sortField,
    // sortType,
    // keywords,
    projectId,
    pageSize: PAGE_SIZE,
  };
  return {
    projectId,
    pageIndex,
    [CALL_API]: {
      types: [INACTIVE_USER_REQUEST, INACTIVE_USER_SUCCESS, INACTIVE_USER_FAILURE],
      params,
    },
  };
};

/** fetch InactiveUser before hand
 * relies on redux-thunk
 */
export const loadInactiveUsers = (projectId, pageIndex) => dispatch => {
  // TODO: check fields if necessary
  return dispatch(fetchInactiveUser(projectId, pageIndex || 1));
};

export const ALL_USER_REQUEST = 'ALL_USER_REQUEST';
export const ALL_USER_SUCCESS = 'ALL_USER_SUCCESS';
export const ALL_USER_FAILURE = 'ALL_USER_FAILURE';

/** fetch all_user
 * relies on middleware `api`
 */
const USER_STATUS = {
  DEFAULT: 0, // 辅助
  NORMAL: 1, // 正常
  LOGOFF: 2, // 注销
  INACTIVE: 3, // 未激活
  REMOVED: 4, // 已删除
};
const fetchAllUser = (projectId, pageIndex) => {
  const params = {
    pageIndex,
    projectId,
    pageSize: PAGE_SIZE,
    userStatus: USER_STATUS.NORMAL,
  };
  return {
    projectId,
    pageIndex,
    [CALL_API]: {
      types: [ALL_USER_REQUEST, ALL_USER_SUCCESS, ALL_USER_FAILURE],
      params,
    },
  };
};

/** fetch InactiveUser before hand
 * relies on redux-thunk
 */
export const loadAllUsers = (projectId, pageIndex) => dispatch => {
  // TODO: check fields if necessary
  return dispatch(fetchAllUser(projectId, pageIndex || 1));
};
