import * as ACTIONS from '../actions/current';
import { params, projectId } from '../../config';
import { COMPANY_DEPARMENTID } from '../constant';

const initialState = () => {
  let typeCursor = 0
  if(location.href.indexOf('admin/approve') > -1) {
    typeCursor = 3
  }
  if(params && params[3] === 'uncursor') {
    typeCursor = 2
  }
  return {
    projectId,
    root: COMPANY_DEPARMENTID,
    departmentId: COMPANY_DEPARMENTID,
    selectedAccountIds: [], // 批量选中的用户
    activeAccountId: null, // 当前活动用户设置列表的accountId
    approveNumber: 0, // 网络未激活人数
    isSearch: false, // 搜索结果呈现
    autoShow: params && params[3] === 'create', // 默认呈现创建部门层
    autoImport: params && params[3] === 'importusers', //默认呈现批量导入层
    typeNum: 0, // 0部门/1职位,
    typeCursor,
    isSelectAll: false, // 是否全选
  };
};

const updateUserSet = (state, action) => {
  const { selectedAccountIds } = state;
  const { type, accountIds } = action;
  switch (type) {
    case ACTIONS.ADD_TO_USERSET:
      return _.union(selectedAccountIds, accountIds);
    case ACTIONS.REMOVE_FROM_USERSET:
      const args = accountIds.slice();
      args.unshift(selectedAccountIds);
      return _.pull.apply(null, args);
    case ACTIONS.EMPTY_USERSET:
    default:
      return [];
  }
};

export default (state = initialState(), action) => {
  const { departmentId, type, accountId, typeNum, typeCursor, isSelectAll } = action;
  switch (type) {
    case 'PROJECT_ID_CHANGED':
      return initialState();
    case ACTIONS.UPDATE_PROJECT_ID:
      return {
        ...state,
        projectId,
      };
    case ACTIONS.UPDATE_TYPE:
      return {
        ...state,
        typeNum,
        typeCursor: 0,
      };
    case ACTIONS.UPDATE_TYPE_CURSOR:
      return {
        ...state,
        typeCursor,
      };
    case ACTIONS.UPDATE_CURSOR:
      return {
        ...state,
        departmentId,
        typeCursor: 0,
        selectedAccountIds: [],
        isSelectAll: false,
      };
    case ACTIONS.REMOVE_CURSOR:
      return {
        ...state,
        departmentId: COMPANY_DEPARMENTID,
      };
    case ACTIONS.UPDATE_ACTIVE_OPLIST:
      return {
        ...state,
        activeAccountId: accountId,
      };
    case ACTIONS.ADD_TO_USERSET:
    case ACTIONS.REMOVE_FROM_USERSET:
    case ACTIONS.EMPTY_USERSET:
      return {
        ...state,
        selectedAccountIds: updateUserSet(state, action),
        isSelectAll: false,
      };
    case ACTIONS.UPDATE_SELECT_ALL:
      return {
        ...state,
        selectedAccountIds: [],
        isSelectAll,
      };
    case ACTIONS.APPROVAL_SUCCESS:
      return {
        ...state,
        // approveNumber: action.response.users.allCount,
        approveNumber: action.response,
      };
      break;
    case ACTIONS.INACTIVE_SUCCESS:
      return {
        ...state,
        // inActiveNumber: action.response.allCount,
        inActiveNumber: action.response,
      };
      break;
    case 'UPDATE_AUTO_SHOW':
      return {
        ...state,
        autoShow: false,
      };
    default:
      return state;
  }
};
