import _ from 'lodash';
import * as ENTITIES_ACTIONS from '../actions/entities';
import { getFlatDepartments } from '../modules/util';

const ACTIONS = {
  ...ENTITIES_ACTIONS,
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
  showDisabledDepartment: localStorage.getItem('showDisabledDepartment') === 'false' ? false : true,
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
    return _.assign({}, department, {
      users: list,
    });
  }
};

const mergeDepartments = (state, action) => {
  const { departmentId, response, type } = action;
  const { departments } = state;
  const department = departments[departmentId];
  let originData = response;
  if (
    typeof department !== 'undefined' ||
    type === ACTIONS.APPROVAL_USER_SUCCESS ||
    type === ACTIONS.INACTIVE_USER_SUCCESS ||
    type === ACTIONS.ALL_USER_SUCCESS
  ) {
    switch (type) {
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

  switch (type) {
    case ACTIONS.USER_SUCCESS:
    case ACTIONS.APPROVAL_USER_SUCCESS:
    case ACTIONS.ALL_USER_SUCCESS:
    case ACTIONS.INACTIVE_USER_SUCCESS:
      return {
        ...state,
        users: _.get(originData, '[0].users') || _.get(originData, 'listUser.list') || [],
        departments: { ...state.departments },
      };
    default:
      return state;
  }
};

const editDepartment = (state, action) => {
  const { newDepartments, expandedKeys = [] } = action;
  return { ...state, newDepartments, expandedKeys };
};

const entities = (state = initialState, action) => {
  const {
    type,
    department,
    isShowExport,
    importExportType,
    importExportResult = {},
    newDepartments = [],
    showDisabledDepartment,
    searchUsers,
  } = action;
  if (type === 'UPDATE_SHOW_DISABLED_DEPARTMENT') {
    return { ...state, showDisabledDepartment };
  }
  if (type === 'UPDATE_NEW_DEPARTMENT') {
    return { ...state, newDepartments, departments: getFlatDepartments(newDepartments) };
  }
  if (type === 'UPDATE_SEARCH_USERS') {
    return { ...state, searchUsers };
  }
  if (type === 'UPDATE_IMPORT_EXPORT_RESULT') {
    return { ...state, importExportResult };
  }
  if (type === 'UPDATE_SHOW_EXPORT') {
    return { ...state, isShowExport };
  }
  if (type === 'UPDATE_IMPORT_EXPORT_TYPE') {
    return { ...state, importExportType };
  }
  if (type === 'PROJECT_ID_CHANGED') return initialState;
  if (typeof ACTIONS[type] === 'undefined') return state;

  if (type === ACTIONS.EDIT_DEPARTMENT) {
    return editDepartment(state, action);
  }

  if (type === ACTIONS.DEPARTMENT_UPDATE) {
    if (department) {
      return {
        ...state,
        departments: getFlatDepartments(action.newDepartments),
        newDepartments: action.newDepartments,
      };
    }
    return {
      ...state,
      newDepartments: action.newDepartments,
      departments: getFlatDepartments(action.newDepartments),
    };
  }
  if (type === ACTIONS.EXPANDED_KEYS_UPDATE) {
    return {
      ...state,
      expandedKeys: action.expandedKeys,
      // expandedKeys: _.keys(state.departments),
    };
  }

  return mergeDepartments(
    { ...state, showDisabledDepartment: localStorage.getItem('showDisabledDepartment') === 'false' ? false : true },
    action,
  );
};

export default entities;
