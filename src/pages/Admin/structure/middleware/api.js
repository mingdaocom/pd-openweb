import { Schema, arrayOf, normalize } from 'normalizr';
// ajax controllers
import * as departmentController from 'src/api/department';
import * as importUserController from 'src/api/importUser';
import * as userController from 'src/api/user';
import * as projectController from 'src/api/project';
import * as jobController from 'src/api/job';
import * as REQUEST_ACTIONS from '../actions/entities';
import * as CURRENT_ACTIONS from '../actions/current';
import * as SEARCH_ACTIONS from '../actions/search';
import { projectId } from '../../config';
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

// define user schema
// fields: [accountId, avatar, contactPhone, createTime, email, isPrivateEmail, mobilePhone, isPrivateMobile, job, roleType]
const userSchema = new Schema('users', {
  idAttribute: 'accountId',
});

// define departments schema
// fields: [departmentId, departmentName, userCount, haveSubDepartment]
const departmentSchema = new Schema('departments', {
  idAttribute: 'departmentId',
  defaults: {
    haveSubDepartment: false, // 是否有子部门

    collapsed: true, // 折叠状态
    isLoading: false, // 加载状态
    isExpired: false, // 过期状态
  },
  assignEntity(output, key, value, input) {
    delete output.users;
  },
});

departmentSchema.define({
  parentDepartment: departmentSchema,
  users: arrayOf(userSchema),
  chargeUsers: arrayOf(userSchema),
});

export const Schemas = {
  DEPARTMENT: departmentSchema,
  DEPARTMENT_ARRAY: arrayOf(departmentSchema),
  USER: userSchema,
  USER_ARRAY: arrayOf(userSchema),
};

// special symbol for interpreted by this redux middleware
export const CALL_API = Symbol('CALL_API');

export const parse = (response, schema) => {
  if (response && schema) {
    return normalize(response, schema);
  }
  return {};
};

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
  promise = requestFunc(Object.assign({}, params, { projectId }));
  prePromiseType = requestType;
  promise.then(
    response => {
      if (promise && promise.state() === 'abort') {
        return false;
      }
      next(
        actionWith({
          response: response,
          type: successType,
        }),
      );
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
