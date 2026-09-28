export const initialState = {
  renderData: [],
  errorItems: [],
  uniqueErrorItems: [],
  rules: undefined,
  rulesLoading: false,
  searchConfig: undefined,
  loadingItems: {},
  verifyCode: '', // 验证码
  activeTabControlId: '',
  // 锁 控制监听配置（rules、searchConfig）是否改变
  configLock: false,
};

const isPlainObject = value => Object.prototype.toString.call(value) === '[object Object]';

const isShallowEqual = (prev, next) => {
  if (Object.is(prev, next)) return true;
  if (!isPlainObject(prev) || !isPlainObject(next)) return false;

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  return prevKeys.length === nextKeys.length && prevKeys.every(key => Object.is(prev[key], next[key]));
};

const isArrayShallowEqual = (prev = [], next = []) => {
  if (!Array.isArray(prev) || !Array.isArray(next) || prev.length !== next.length) return false;
  if (Object.is(prev, next)) return false;

  return prev.every((item, index) => isShallowEqual(item, next[index]));
};

const mergeLoadingItems = (prev = {}, next = {}) => {
  const merged = { ...prev, ...next };
  return isShallowEqual(prev, merged) ? prev : merged;
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_RENDER_DATA':
      return state.renderData === action.payload ? state : { ...state, renderData: action.payload };
    case 'SET_ERROR_ITEMS':
      return isArrayShallowEqual(state.errorItems, action.payload) ? state : { ...state, errorItems: action.payload };
    case 'SET_UNIQUE_ERROR_ITEMS':
      return isArrayShallowEqual(state.uniqueErrorItems, action.payload)
        ? state
        : { ...state, uniqueErrorItems: action.payload };
    case 'SET_RULES':
      return state.rules === action.payload ? state : { ...state, rules: action.payload };
    case 'SET_RULES_LOADING':
      return state.rulesLoading === action.payload ? state : { ...state, rulesLoading: action.payload };
    case 'SET_SEARCH_CONFIG':
      return state.searchConfig === action.payload ? state : { ...state, searchConfig: action.payload };
    case 'SET_LOADING_ITEMS': {
      const loadingItems = mergeLoadingItems(state.loadingItems, action.payload);
      return loadingItems === state.loadingItems ? state : { ...state, loadingItems };
    }

    case 'SET_VERIFY_CODE':
      return state.verifyCode === action.payload ? state : { ...state, verifyCode: action.payload };
    case 'SET_ACTIVE_TAB_CONTROL_ID':
      return state.activeTabControlId === action.payload ? state : { ...state, activeTabControlId: action.payload };
    case 'SET_CONFIG_LOCK':
      return state.configLock === action.payload ? state : { ...state, configLock: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
