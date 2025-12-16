import _ from 'lodash';
import departmentController from 'src/api/department';
import Config from '../../../../config';
import { PAGE_SIZE } from '../constant';
import { CALL_API } from '../middleware/api';
import { getParentNode, getParentsId, updateTreeData } from '../modules/util';

/**
 * 根据部门父Id获取子部门,departmentId为null表示父部门是网络
 * @param {*} departmentId 部门id
 * @param {*} pageIndex 页码
 * @param {*} afterRequest 回调函数
 * @returns
 */

export const loadDepartments = (departmentId, pageIndex, afterRequest) => (dispatch, getState) => {
  const { showDisabledDepartment } = getState().entities;
  const params = {
    projectId: Config.projectId,
    departmentId,
    returnCount: true,
    pageIndex,
    pageSize: 100,
    includeDisabled: showDisabledDepartment,
  };
  departmentController.pagedSubDepartments(params).then(res => {
    if (res) {
      dispatch(updateNewDepartments(res));
      _.isFunction(afterRequest) && afterRequest();
    }
  });
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
  return dispatch(fetchUser(departmentId, pageIndex || 1));
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

/**
 * 更新newDepartments
 * @param {*} newDepartments
 * @returns
 */
export const updateNewDepartments = newDepartments => dispatch => {
  dispatch({
    type: 'UPDATE_NEW_DEPARTMENT',
    newDepartments,
  });
};

/**
 * 删除部门
 * @param departmentId
 * @param parentId
 */
export const deleteDepartment = departmentId => (dispatch, getState) => {
  const { newDepartments } = getState().entities;
  const parentNode = getParentNode(newDepartments, departmentId);
  departmentController
    .deleteDepartments({
      projectId: Config.projectId,
      departmentId,
    })
    .then(res => {
      if (res === 1) {
        const updatedDepartments = updateTreeData({ type: 'delete', departments: newDepartments, departmentId });
        dispatch(updateNewDepartments(updatedDepartments));
        if (parentNode) {
          dispatch({ type: 'UPDATE_CURSOR', departmentId: parentNode.departmentId });
          dispatch(loadUsers(parentNode.departmentId, 1));
        } else {
          dispatch({ type: 'UPDATE_CURSOR', departmentId: '' });
          dispatch(loadAllUsers(Config.projectId, 1));
        }
        alert(_l('删除成功'));
      } else if (res === 3) {
        alert(_l('部门存在成员，无法删除'), 3);
      } else if (res === 2) {
        alert(_l('部门存在子部门，无法删除'), 3);
      } else {
        alert(_l('删除失败'), 2);
      }
    });
};

/**
 * 部门拖拽
 * @param {*} movingDepartmentId
 * @param {*} sortedDepartmentIds
 * @param {*} moveToParentId
 */
export const sortDepartmentsFn =
  (data, movingDepartmentId, sortedDepartmentIds, moveToParentId, callback = () => {}) =>
  dispatch => {
    departmentController
      .moveDepartment({
        projectId: Config.projectId, //网络id
        sortedDepartmentIds: sortedDepartmentIds, // 排好序的 部门Ids
        moveToParentId: moveToParentId, //拖入的 上级部门Id
        movingDepartmentId: movingDepartmentId, //被拖拽的 部门Id
      })
      .then(res => {
        if (res) {
          const updatedDepartments = updateTreeData({
            type: 'edit',
            departments: data,
            departmentId: movingDepartmentId,
            parentId: moveToParentId,
          });
          dispatch(updateNewDepartments(updatedDepartments));
          callback(updatedDepartments);
          alert(_l('调整成功'));
        } else {
          alert(_l('调整失败'), 2);
        }
      });
  };

/**
 * 部门停用/启用
 */
export const disabledAndEnabledDepartments = (departmentId, disabled, parentId) => (dispatch, getState) => {
  const { newDepartments } = getState().entities;
  const request = disabled ? departmentController.enabledDepartment : departmentController.disabledDepartments;

  request({
    projectId: Config.projectId,
    departmentId,
  }).then(res => {
    if (res) {
      const updatedDepartments = updateTreeData({
        type: 'updateDisabled',
        departments: newDepartments,
        departmentId,
        parentId,
        updateDataInfo: { disabled: !disabled },
      });

      dispatch(updateNewDepartments(updatedDepartments));
      alert(disabled ? _l('恢复成功') : _l('停用成功'));
    } else {
      alert(disabled ? _l('恢复失败', 2) : _l('停用失败', 2));
    }
  });
};

export const EDIT_DEPARTMENT = 'EDIT_DEPARTMENT';
/**
 * eidt department
 * @param departmentId
 * @param departmentName
 */
export const editDepartment = ({ newDepartments, expandedKeys }) => ({
  type: EDIT_DEPARTMENT,
  newDepartments,
  expandedKeys,
});

/**
 * 获取root到该部门的树状结构
 * @param departmentId
 * @param collapseAll
 * @param afterRequest
 */
export const getFullTree =
  ({ departmentId, isGetAll, parentId, searchValue }) =>
  dispatch => {
    const request = isGetAll
      ? departmentController.getProjectDepartmentFullTreeByDepartmentId
      : departmentController.getOneDepartmentFullTree;

    request({
      projectId: Config.projectId,
      departmentId,
      isGetAll,
    }).then(res => {
      const updatedDepartments = updateTreeData({ type: 'create', departments: res, departmentId, parentId });
      if (searchValue) {
        dispatch({ type: 'UPDATE_SEARCH_VALUYE', data: searchValue });
        dispatch({ type: 'UPDATE_TYPE_CURSOR', typeCursor: 0 }); //设置选中的部门
        dispatch({ type: 'UPDATE_TYPE', typeNum: 0 });
      }
      dispatch(updateNewDepartments(updatedDepartments));
      dispatch({ type: 'UPDATE_CURSOR', departmentId });
      dispatch({ type: 'EXPANDED_KEYS_UPDATE', expandedKeys: getParentsId(updatedDepartments, departmentId) });
      dispatch(loadUsers(departmentId));
    });
  };

export const APPROVAL_USER_REQUEST = 'APPROVAL_USER_REQUEST';
export const APPROVAL_USER_SUCCESS = 'APPROVAL_USER_SUCCESS';
export const APPROVAL_USER_FAILURE = 'APPROVAL_USER_FAILURE';

/** fetch approval_user
 * relies on middleware `api`
 */
const fetchApprovalUser = (projectId, pageIndex, userStatus) => {
  const params = {
    pageIndex,
    projectId,
    userStatus,
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
export const loadApprovalUsers = (projectId, pageIndex) => (dispatch, getState) => {
  const { userStatus } = getState().current;
  return dispatch(fetchApprovalUser(projectId, pageIndex || 1, userStatus));
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
  return dispatch(fetchAllUser(projectId, pageIndex || 1));
};

export const updateShowExport = isShowExport => ({
  type: 'UPDATE_SHOW_EXPORT',
  isShowExport,
});
export const updateImportType = importExportType => ({
  type: 'UPDATE_IMPORT_EXPORT_TYPE',
  importExportType,
});
export const updateImportExportResult = importExportResult => ({
  type: 'UPDATE_IMPORT_EXPORT_RESULT',
  importExportResult,
});

// 显示停用部门
export const handleShowDisabledDepartment = flag => dispatch => {
  localStorage.setItem('showDisabledDepartment', flag);
  dispatch({ type: 'UPDATE_SHOW_DISABLED_DEPARTMENT', showDisabledDepartment: flag });
  dispatch(expandedKeysUpdate([]));
  dispatch(loadDepartments('', 1));
};
