export const appDetail = (state = {
  appName: '',
  detail: [],
  appSection: [],
  status: null, // 0: 加载中 1:正常 2:关闭 3:删除 4:不是应用成员 5:是应用成员但未分配视图
}, action) => {
  switch (action.type) {
    case 'UPDATE_APP_DETAIL':
      return action.data;
    default:
      return state;
  }
};

export const isAppLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_FETCH_START':
      return true;
    case 'MOBILE_FETCH_SUCCESS':
      return false;
    default:
      return state;
  }
};

export const isQuitSuccess = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_QUIT_FAILED_CLOSE':
      return true;
    case 'MOBILE_QUIT_FAILED':
      return false;
    default:
      return state;
  }
};

export const debugRoles = (state = [], action) => {
  switch (action.type) {
    case 'DEBUG_ROLE_LIST':
      return action.data;
    default:
      return state;
  }
};
