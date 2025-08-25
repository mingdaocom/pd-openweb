// ajax controllers
import _ from 'lodash';
import departmentController from 'src/api/department';
import importUserController from 'src/api/importUser';
import projectController from 'src/api/project';
import userController from 'src/api/user';
import Config from '../../../../config';
import { ACTIONS } from '../constant';

let promise = null;
let prePromiseType = null;
const promiseList = [
  ACTIONS.ALL_USER_REQUEST,
  ACTIONS.INACTIVE_USER_REQUEST,
  ACTIONS.APPROVAL_USER_REQUEST,
  ACTIONS.USER_REQUEST,
];
const getApiByRequestType = (type, { departmentId, isGetAll }) => {
  if (type === ACTIONS.USER_REQUEST) {
    return departmentId ? departmentController.getProjectDepartmentUsers : departmentController.getNoDepartmentUsers;
  }
  if (type === ACTIONS.FULL_TREE_REQUEST) {
    return isGetAll
      ? departmentController.getProjectDepartmentFullTreeByDepartmentId
      : departmentController.getOneDepartmentFullTree;
  }
  const dict = {
    [ACTIONS.ALL_USER_REQUEST]: userController.pagedNormalUserList, //全公司
    [ACTIONS.DEPARTMENT_REQUEST]: departmentController.pagedSubDepartments, //根据部门父Id获取子部门,departmentId为null表示父部门是网络
    [ACTIONS.INACTIVE_USER_REQUEST]: importUserController.getImportUserDetails, //未激活成员
    [ACTIONS.APPROVAL_USER_REQUEST]: userController.getApprovalUser, //待管理员审核
    [ACTIONS.INACTIVE_LOAD]: importUserController.getUnusedInfosByProjectIdCount, //整个网络的导入用户，未被使用的总数
    [ACTIONS.APPROVAL_LOAD]: projectController.getProjectUnauditedUserCount, //获取网络内待审批用户数量
    [ACTIONS.SEARCH_REQUEST]: departmentController.searchDeptAndUsers,
    // [ACTIONS.FULL_TREE_REQUEST]: departmentController.getOneDepartmentFullTree,
  };
  if (dict[type] === undefined) throw new Error('ajaxController method not found.');
  return dict[type];
};

// special symbol for interpreted by this redux middleware
export const CALL_API = Symbol('CALL_API');

// define and export middleware
export default () => next => action => {
  const callAPI = action[CALL_API];

  if (typeof callAPI === 'undefined') {
    // common sync actions, hand action directly
    return next(action);
  }

  const { types } = callAPI;
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.');
  }

  const actionWith = payload => {
    const finalAction = { ...action, ...payload };
    // remove special symbol and hand action to common sync reducer
    delete finalAction[CALL_API];
    return finalAction;
  };

  const [requestType, successType, failureType] = types;
  // handle pending state
  next(
    actionWith({
      type: requestType,
    }),
  );
  const { params, afterRequest } = callAPI;
  const requestFunc = getApiByRequestType(requestType, params);
  if (promise && promiseList.includes(requestType) && promiseList.includes(prePromiseType)) {
    promise.abort();
  }
  promise = requestFunc(Object.assign({}, params, { projectId: Config.projectId }));
  prePromiseType = requestType;
  promise.then(
    response => {
      if (promise && promise.state && promise.state() === 'abort') {
        return false;
      }
      next(
        actionWith({
          response: response,
          type: successType,
        }),
      );

      if (successType === 'INACTIVE_USER_SUCCESS' && !_.isUndefined(response.allCount)) {
        next(
          actionWith({
            response: response.allCount,
            type: 'INACTIVE_SUCCESS',
          }),
        );
      }
      if (successType === 'APPROVAL_USER_SUCCESS' && !_.isUndefined(response.users.allCount)) {
        next(
          actionWith({
            response: response.users.allCount,
            type: 'APPROVAL_SUCCESS',
          }),
        );
      }
      if (_.isFunction(afterRequest)) {
        // callback
        afterRequest.call(null);
      }
    },
    error =>
      next(
        actionWith({
          error,
          type: failureType,
        }),
      ),
  );

  return promise;
};
