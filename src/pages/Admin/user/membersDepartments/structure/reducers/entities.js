import * as ENTITIES_ACTIONS from '../actions/entities';
import { SEARCH_SUCCESS } from '../actions/search';
import { merge } from 'lodash';
import { parse, Schemas } from '../middleware/api';
import { getParentsId, filterDeleteTreeData, updateTreeData } from '../modules/util';

const ACTIONS = {
  ...ENTITIES_ACTIONS,
  SEARCH_SUCCESS,
};

const initialState = {
  departments: {},
  users: {},
  getDepartmentIds: [],
  newDepartments: [], //
  expandedKeys: [], //默认展开的ID
  searchUsers: [],
  isShowExport: false,
  importExportType: '',
  importExportResult: {},
};

const mergeDepartmentUsers = (department, payload) => {
  const { departmentId } = department;
  if (departmentId === '') {
    const {
      listUser: { list },
      totalMembers,
    } = payload;
    return {
      ...department,
      userCount: totalMembers,
      users: list,
    };
  } else {
    const { list } = payload;
    const chargeUsers = _.filter(list, user => user.isDepartmentChargeUser);
    return _.assign({}, department, {
      chargeUsers: chargeUsers,
      users: list,
    });
  }
};

const mergeDepartments = (state, action) => {
  const { departmentId, response, type } = action;
  const { departments, getDepartmentIds } = state;
  const department = departments[departmentId];
  let originData = response;
  if (
    typeof department !== 'undefined' ||
    type === ACTIONS.APPROVAL_USER_SUCCESS ||
    type === ACTIONS.INACTIVE_USER_SUCCESS ||
    type === ACTIONS.ALL_USER_SUCCESS
  ) {
    switch (type) {
      case ACTIONS.DEPARTMENT_REQUEST:
        originData = [
          {
            ...department,
            isLoading: true,
          },
        ];
        break;
      case ACTIONS.DEPARTMENT_SUCCESS:
        var arr = _.isArray(response) ? response : [response];
        if (arr.length) {
          originData = _.map(arr, dept => {
            return {
              ...dept,
              parentDepartment: {
                ...department,
                isExpired: false,
                isLoading: false,
              },
            };
          });
        } else {
          originData = [
            {
              ...department,
              isExpired: false,
              isLoading: false,
            },
          ];
        }
        break;
      case ACTIONS.DEPARTMENT_FAILURE:
        originData = [
          {
            ...department,
            isLoading: false,
          },
        ];
        break;
      case ACTIONS.DEPARTMENT_TOGGLE:
        originData = [
          {
            ...department,
            collapsed: !department.collapsed,
          },
        ];
        break;
      case ACTIONS.USER_SUCCESS:
        originData = [mergeDepartmentUsers(department, response)];
        break;
      case ACTIONS.APPROVAL_USER_SUCCESS:
        originData = [
          {
            userCount: _.filter(response.users.list || [], v => v.status === 3).length,
            users: response.users.list || [],
          },
        ];
        break;
      case ACTIONS.INACTIVE_USER_SUCCESS:
      case ACTIONS.ALL_USER_SUCCESS:
        originData = [
          {
            userCount: response.allCount || 0,
            users: response.list || [],
          },
        ];
        break;
      default:
        break;
    }
  }
  const { entities } = parse(originData, Schemas.DEPARTMENT_ARRAY);
  switch (type) {
    case ACTIONS.USER_SUCCESS:
    case ACTIONS.APPROVAL_USER_SUCCESS:
    case ACTIONS.ALL_USER_SUCCESS:
    case ACTIONS.INACTIVE_USER_SUCCESS:
      return {
        ...state,
        ...entities,
        users: (_.isArray(originData) && !_.isEmpty(originData) && originData[0].users) || [],
        departments: { ...state.departments, ...entities.departments },
      };
    default:
      return { ...state, ...entities };
  }
};

const setDataFn = (data, departmentId = '') => {
  let list = data;
  const loop = (list, key, callback) => {
    list.forEach((item, index, arr) => {
      if (item.departmentId === key) {
        return callback(item, index, arr);
      }
      if (item.subDepartments) {
        return loop(item.subDepartments, key, callback);
      }
    });
  };

  let dragObj; //当前item
  let ar; //删除之外的list
  loop(list, departmentId, (item, index, arr) => {
    ar = arr.splice(index, 1);
    dragObj = item;
  });
  return {
    dragObj,
    ar,
    list,
  };
};

const deleteDepartment = (state, action) => {
  const { parentId, departmentId, expandedKeys } = action;
  const { departments, newDepartments } = state;
  const filteredDepartments = {
    ...departments,
    [parentId || '']: {
      ...departments[parentId || ''],
      isExpired: true,
    },
  };
  delete filteredDepartments[departmentId];
  return {
    ...state,
    departments: filteredDepartments,
    newDepartments: filterDeleteTreeData(newDepartments, departmentId),
    expandedKeys,
  };
};

const editDepartment = (state, action) => {
  const { newDepartments, expandedKeys = [] } = action;
  return { ...state, newDepartments, expandedKeys };
};

const mergeSearchUser = (state, action) => {
  const {
    response: { users },
  } = action;
  if (!users) return state;
  return merge({}, state, parse(users, Schemas.USER_ARRAY).entities);
};

const mergeSearchDepartments = (state, action) => {
  const { curDepartmentId, departmentId, response, collapseAll } = action;
  const root = state.departments[departmentId];
  if (!response) return state;
  const resultArray = [];
  {
    const runner = (originData, department = root) => {
      if (!_.isArray(originData)) return;
      _.map(originData, dept => {
        dept.parentDepartment = department;
        resultArray.push(dept);
        if (dept.subDepartments) {
          runner(dept.subDepartments, dept);
        }
      });
    };
    runner(response);
  }
  const { entities } = parse(resultArray, Schemas.DEPARTMENT_ARRAY);
  if (collapseAll) {
    // handle collapsed state
    let departments = _.forEach(entities.departments, dept => {
      return {
        ...dept,
        collapsed: true,
      };
    });
    const runner = id => {
      if (!id || !departments[id]) return;
      if (departments[id].parentDepartment !== undefined) {
        departments[id].collapsed = false;
        const parentId = departments[id].parentDepartment;
        runner(parentId);
      }
    };
    runner(curDepartmentId);
    return merge({}, state, {
      departments,
    });
  } else {
    // handle collapsed state
    let departments = entities.departments;
    const runner = id => {
      if (!id || !departments[id]) return;
      if (departments[id].parentDepartment !== undefined) {
        const parentId = departments[id].parentDepartment;
        departments[parentId].collapsed = false;
        runner(parentId);
      }
    };
    runner(curDepartmentId);
    return merge({}, state, {
      departments,
    });
  }
};

const entities = (state = initialState, action) => {
  const {
    type,
    response,
    departmentId,
    department,
    id,
    curDepartmentId,
    isGetAll,
    isShowExport,
    importExportType,
    importExportResult = {},
    fullDepartmentInfo = {},
  } = action;
  let { getDepartmentIds, newDepartments, departments } = state;
  if (type === 'UPDATE_IMPORT_EXPORT_RESULT') {
    return {
      ...state,
      importExportResult,
    };
  }
  if (type === 'UPDATE_SHOW_EXPORT') {
    return {
      ...state,
      isShowExport,
    };
  }
  if (type === 'UPDATE_IMPORT_EXPORT_TYPE') {
    return {
      ...state,
      importExportType,
    };
  }
  if (type === 'UPDATE_FULL_DEPARTMENT_INFO') {
    return {
      ...state,
      fullDepartmentInfo,
    };
  }
  if (type === 'PROJECT_ID_CHANGED') return initialState;
  if (typeof ACTIONS[type] === 'undefined') return state;
  if (type === ACTIONS.DELETE_DEPARTMENT) {
    return deleteDepartment(state, action);
  }
  if (type === ACTIONS.EDIT_DEPARTMENT) {
    return editDepartment(state, action);
  }
  if (type === ACTIONS.SEARCH_SUCCESS) {
    // return mergeSearchUser(state, action);
    const {
      response: { users },
    } = action;
    return {
      ...state,
      searchUsers: users,
    };
  }
  // if (type === ACTIONS.FULL_TREE_SUCCESS) {
  //   return mergeSearchDepartments(state, action);
  // }
  if (type === ACTIONS.DEPARTMENT_UPDATE) {
    if (department) {
      let { entities } = parse(department, Schemas.DEPARTMENT_ARRAY);
      return {
        ...merge({}, state, entities),
        newDepartments: action.newDepartments,
      };
    }
    return {
      ...state,
      newDepartments: action.newDepartments,
    };
  }
  if (type === ACTIONS.EXPANDED_KEYS_UPDATE) {
    return {
      ...state,
      expandedKeys: action.expandedKeys,
      // expandedKeys: _.keys(state.departments),
    };
  }
  if (type === ACTIONS.FULL_TREE_SUCCESS) {
    let data = mergeSearchDepartments(state, action);
    let departments = response;
    // if (isGetAll) {
    //   let data = newDepartments.map(o => {
    //     if (o.departmentId === response[0].departmentId) {
    //       return response[0];
    //     } else {
    //       return o;
    //     }
    //   });
    //   departments = data;
    // }
    // console.log(departments);
    return {
      ...data,
      newDepartments: departments,
      expandedKeys: getParentsId(response, curDepartmentId),
    };
  }
  if (type === ACTIONS.DEPARTMENT_SUCCESS) {
    let isAdd = !getDepartmentIds.includes(departmentId) || !departmentId;
    if (isAdd) {
      getDepartmentIds.push(departmentId);
    }
    let onLoadData = () => {
      let da = newDepartments.filter(it => it.departmentId !== departmentId);
      let daf = newDepartments.filter(it => it.departmentId === departmentId);
      daf = {
        ...daf,
        subDepartments: response,
      };
      return da.concat(daf);
    };
    return {
      ...mergeDepartments(state, action),
      getDepartmentIds,
      newDepartments: !isAdd || !departmentId ? response : onLoadData(),
    };
  }
  return mergeDepartments(state, action);
};

export default entities;
