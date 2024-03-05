import { ALL_USER_REQUEST, ALL_USER_SUCCESS, ALL_USER_FAILURE, USER_REQUEST, USER_SUCCESS, USER_FAILURE, APPROVAL_USER_REQUEST, APPROVAL_USER_SUCCESS, APPROVAL_USER_FAILURE, INACTIVE_USER_REQUEST, INACTIVE_USER_SUCCESS, INACTIVE_USER_FAILURE } from '../actions/entities';
import { CUSTOM_LIST } from '../actions/search';

import { parse, Schemas } from '../middleware/api';
import { PAGE_SIZE } from '../constant';

const mergeUserList = (action, type) => {
  const { response, departmentId, pageIndex } = action;
  let userList = [];
  let allCountNum = 0;
  if (type === APPROVAL_USER_SUCCESS) {
    let {
      users: { list = [], allCount = 0 },
    } = response;
    userList = list;
    allCountNum = allCount;
  } else if (type === INACTIVE_USER_SUCCESS || type === ALL_USER_SUCCESS) {
    const { list, allCount } = response;
    userList = list;
    allCountNum = allCount;
  } else {
    let listUser = departmentId ? response : response.listUser;
    const { list, allCount } = listUser;
    userList = list;
    allCountNum = allCount;
  }
  const ids = parse(userList, Schemas.USER_ARRAY).result;
  return {
    ids,
    pageIndex,
    allCount: allCountNum,
  };
};

const updatePagination = (
  state = {
    isLoading: false,
    pageIndex: 1,
    pageSize: PAGE_SIZE,
    ids: [],
    allCount: undefined,
    searchId: []
  },
  action
) => {
  const { type } = action;
  const [requestType, successType, failureType] = [USER_REQUEST, USER_SUCCESS, USER_FAILURE];
  switch (type) {
    case requestType:
    case APPROVAL_USER_REQUEST:
    case INACTIVE_USER_REQUEST:
    case ALL_USER_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case successType:
    case APPROVAL_USER_SUCCESS:
    case ALL_USER_SUCCESS:
    case INACTIVE_USER_SUCCESS:
      return {
        ...state,
        ...mergeUserList(action, type),
        isLoading: false,
      };
    case failureType:
    case APPROVAL_USER_FAILURE:
    case INACTIVE_USER_FAILURE:
    case ALL_USER_FAILURE:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default (state = {}, action) => {
  switch (action.type) {
    case 'PROJECT_ID_CHANGED':
      return {};
    case USER_REQUEST:
    case USER_SUCCESS:
    case USER_FAILURE:
    case APPROVAL_USER_REQUEST:
    case APPROVAL_USER_SUCCESS:
    case APPROVAL_USER_FAILURE:
    case INACTIVE_USER_REQUEST:
    case INACTIVE_USER_SUCCESS:
    case INACTIVE_USER_FAILURE:
    case ALL_USER_REQUEST:
    case ALL_USER_SUCCESS:
    case ALL_USER_FAILURE:
      const { userList } = state;
      return {
        ...state,
        userList: {
          ...updatePagination(userList, action),
          isSearchResult: false,
        },
      };
    case CUSTOM_LIST:
      const { accountIds } = action;
      return {
        ...state,
        userList: {
          isSearchResult: true,
          isLoading: false,
          pageIndex: 1,
          pageSize: PAGE_SIZE,
          searchId: accountIds,
          allCount: accountIds.length,
        },
      };
    default:
      return state;
  }
};
