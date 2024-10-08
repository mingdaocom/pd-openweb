﻿// ajax controllers
import departmentController from 'src/api/department';
import importUserController from 'src/api/importUser';
import userController from 'src/api/user';
import projectController from 'src/api/project';
import * as REQUEST_ACTIONS from '../actions/entities';
import * as CURRENT_ACTIONS from '../actions/current';
import * as SEARCH_ACTIONS from '../actions/search';
import Config from '../../../../config';
import _ from 'lodash';
let promise = null;
let prePromiseType = null;
const promiseList = [
  REQUEST_ACTIONS.ALL_USER_REQUEST,
  REQUEST_ACTIONS.INACTIVE_USER_REQUEST,
  REQUEST_ACTIONS.APPROVAL_USER_REQUEST,
  REQUEST_ACTIONS.USER_REQUEST,
];
const getApiByRequestType = (type, { departmentId, isGetAll }) => {
  if (type === REQUEST_ACTIONS.USER_REQUEST) {
    return departmentId ? departmentController.getProjectDepartmentUsers : departmentController.getNoDepartmentUsers;
  }
  if (type === REQUEST_ACTIONS.FULL_TREE_REQUEST) {
    return isGetAll
      ? departmentController.getProjectDepartmentFullTreeByDepartmentId
      : departmentController.getOneDepartmentFullTree;
  }
  const dict = {
    [REQUEST_ACTIONS.ALL_USER_REQUEST]: userController.pagedNormalUserList, //全公司
    [REQUEST_ACTIONS.DEPARTMENT_REQUEST]: departmentController.pagedSubDepartments, //根据部门父Id获取子部门,departmentId为null表示父部门是网络
    [REQUEST_ACTIONS.INACTIVE_USER_REQUEST]: importUserController.getImportUserDetails, //未激活成员
    [REQUEST_ACTIONS.APPROVAL_USER_REQUEST]: userController.getApprovalUser, //待管理员审核
    [CURRENT_ACTIONS.INACTIVE_LOAD]: importUserController.getUnusedInfosByProjectIdCount, //整个网络的导入用户，未被使用的总数
    [CURRENT_ACTIONS.APPROVAL_LOAD]: projectController.getProjectUnauditedUserCount, //获取网络内待审批用户数量
    [SEARCH_ACTIONS.SEARCH_REQUEST]: departmentController.searchDeptAndUsers,
    // [REQUEST_ACTIONS.FULL_TREE_REQUEST]: departmentController.getOneDepartmentFullTree,
  };
  if (dict[type] === undefined) throw new Error('ajaxController method not found.');
  return dict[type];
};

// special symbol for interpreted by this redux middleware
export const CALL_API = Symbol('CALL_API');

// define and export middleware
export default store => next => action => {
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
