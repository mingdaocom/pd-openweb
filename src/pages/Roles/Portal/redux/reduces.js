import { combineReducers } from 'redux';
export const loading = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_LOADING':
      return action.data;
    default:
      return state;
  }
};
//配置的controls
export const controls = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_CONTROLS':
      return action.data;
    default:
      return state;
  }
};

export const sortControls = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_SORTCONTROLS':
      return action.data;
    default:
      return state;
  }
};
//批量搜索手机号
export const telFilters = (state = ``, action) => {
  switch (action.type) {
    case 'UPDATE_TELFILTERS':
      return action.data;
    default:
      return state;
  }
};
export const baseInfo = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_BASE':
      return action.data;
    default:
      return state;
  }
};

//设置 排序，显示字段等
export const controlsSetting = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_CONTROLS_SETTING':
      return action.data;
    default:
      return state;
  }
};
//成员列表数据
export const list = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_LIST':
      return action.data;
    default:
      return state;
  }
};

export const count = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_LIST_COUNT':
      return action.data;
    default:
      return state;
  }
};

//（待审核）用户数
export const unApproveCount = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_UNAPPROVECOUNT':
      return action.data;
    default:
      return state;
  }
};

//（未激活、正常、停用）用户数
export const commonCount = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_COMMONCOUNT':
      return action.data;
    default:
      return state;
  }
};

//隐藏的控件id
export const showPortalControlIds = (state = ['openId'], action) => {
  switch (action.type) {
    case 'UPDATE_HIDEIDS':
      return action.data;
    default:
      return state;
  }
};

// sortIds 排序
export const sortIds = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_SORTIDS':
      return action.data;
    default:
      return state;
  }
};
//角色数据
export const roleList = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_ROLELIST':
      return action.data;
    default:
      return state;
  }
};

//角色数据
export const defaultRole = (state = '1', action) => {
  switch (action.type) {
    case 'UPDATE_DEFAULTROLE':
      return action.data;
    default:
      return state;
  }
};
export const pageIndex = (state = 1, action) => {
  switch (action.type) {
    case 'UPDATE_INDEX':
      return action.data;
    default:
      return state;
  }
};

export const filters = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_FILTERS':
      return action.data;
    default:
      return state;
  }
};
export const fastFilters = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_FASTFILTERS':
      return action.data;
    default:
      return state;
  }
};
export const keyWords = (state = '', action) => {
  switch (action.type) {
    case 'UPDATE_KEYWORDS':
      return action.data;
    default:
      return state;
  }
};
export default combineReducers({
  controls,
  roleList,
  list,
  pageIndex,
  showPortalControlIds,
  defaultRole,
  controlsSetting,
  count,
  baseInfo,
  filters,
  keyWords,
  fastFilters,
  loading,
  commonCount,
  unApproveCount,
  sortControls,
  telFilters,
});
