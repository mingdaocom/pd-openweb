import { combineReducers } from 'redux';
import { List, Map, Set } from 'immutable';
import { NODE_SORT_BY, NODE_SORT_TYPE, PICK_TYPE } from '../constant/enum';

function kcListElement(state = null, action) {
  switch (action.type) {
    case 'KC_UPDATE_LIST_ELEMENT':
      return action.value;
    default:
      return state;
  }
}

function loading(state = true, action) {
  switch (action.type) {
    default:
      return state;
  }
}

function listLoading(state = true, action) {
  switch (action.type) {
    case 'KC_FETCH_NODES_START':
      return true;
    case 'KC_FETCH_NODES_SUCCESS':
    case 'KC_FETCH_NODES_ERROR':
      return false;
    default:
      return state;
  }
}

function path(state = '', action) {
  switch (action.type) {
    case 'KC_UPDATE_PATH':
      return action.value;
    default:
      return state;
  }
}

const defaultParams = Map({
  keywords: '',
  skip: 0,
  limit: 20,
  sortBy: NODE_SORT_BY.UPDATE_TIME,
  sortType: NODE_SORT_TYPE.DESC,
});
function params(state = defaultParams, action) {
  switch (action.type) {
    case 'KC_CLEAR_KC':
      return defaultParams;
    case 'KC_UPDATE_PARAMS':
      return state.merge(action.value);
    default:
      return state;
  }
}

function currentFolder(state = {}, action) {
  switch (action.type) {
    case 'KC_UPDATE_FOLDER':
      return action.value;
    default:
      return state;
  }
}

function currentRoot(state = PICK_TYPE.MY, action) {
  switch (action.type) {
    case 'KC_UPDATE_ROOT':
      return action.value;
    default:
      return state;
  }
}

function list(state = List(), action) {
  switch (action.type) {
    case 'KC_CLEAR_LIST':
    case 'KC_CLEAR_KC':
      return List();
    case 'KC_REPLACE_NODES':
      return action.value;
    case 'KC_FETCH_NODES_SUCCESS':
      return state.concat(action.value);
    case 'KC_ADD_NEWFOLDER_SUCCESS':
      return state.unshift(action.value);
    default:
      return state;
  }
}

function totalCount(state = 0, action) {
  switch (action.type) {
    case 'KC_UPDATE_TOTALCOUNT':
      return action.value;
    case 'KC_ADD_NEWFOLDER_SUCCESS':
      return state + 1;
    default:
      return state;
  }
}

function kcUsage(state = {}, action) {
  switch (action.type) {
    case 'KC_FETCH_USAGE_SUCCESS':
      return action.value;
    default:
      return state;
  }
}

function isRecycle(state = false, action) {
  switch (action.type) {
    case 'KC_UPDATE_LIST_STATE':
      return action.value.isRecycle || false;
    default:
      return state;
  }
}

function isReadOnly(state = true, action) {
  switch (action.type) {
    case 'KC_UPDATE_LIST_STATE':
      return action.value.isReadOnly || false;
    default:
      return state;
  }
}

function isGlobalSearch(state = false, action) {
  switch (action.type) {
    case 'KC_CLEAR_KC':
      return false;
    case 'KC_UPDATE_IS_GLOBAL_SEARCH':
      return action.value;
    default:
      return state;
  }
}

// 选择
export function selectAll(state = false, action) {
  switch (action.type) {
    case 'KC_CHANGE_SELECT_ALL':
    case 'KC_SELECT_ALL_ITEMS':
      return action.value;
    default:
      return state;
  }
}

export function selectedItems(state = Set(), action) {
  switch (action.type) {
    case 'KC_UPDATE_SELECTED_ITEMS':
      return action.value;
    case 'KC_SELECT_ALL_ITEMS':
      return action.selectedItems;
    default:
      return state;
  }
}

export function rightMenuOption(state = false, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function baseUrl(state = '/apps/kc', action) {
  switch (action.type) {
    case 'KC_UPDATE_KC_BASE_URL':
      return action.value;
    default:
      return state;
  }
}

export function temp(state = false, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default combineReducers({
  kcListElement,
  loading,
  baseUrl,
  listLoading,
  isGlobalSearch,
  isRecycle,
  isReadOnly,
  path,
  currentRoot,
  currentFolder,
  params,
  list,
  totalCount,
  kcUsage,
  selectAll,
  selectedItems,
  rightMenuOption,
  temp,
});
