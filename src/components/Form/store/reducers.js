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
  // 表单字体大小
  emSizeNum: 16,
};

export const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_RENDER_DATA':
      return { ...state, renderData: action.payload };
    case 'SET_ERROR_ITEMS':
      return { ...state, errorItems: action.payload };
    case 'SET_UNIQUE_ERROR_ITEMS':
      return { ...state, uniqueErrorItems: action.payload };
    case 'SET_RULES':
      return { ...state, rules: action.payload };
    case 'SET_RULES_LOADING':
      return { ...state, rulesLoading: action.payload };
    case 'SET_SEARCH_CONFIG':
      return { ...state, searchConfig: action.payload };
    case 'SET_LOADING_ITEMS':
      return { ...state, loadingItems: { ...state.loadingItems, ...action.payload } };
    case 'SET_VERIFY_CODE':
      return { ...state, verifyCode: action.payload };
    case 'SET_ACTIVE_TAB_CONTROL_ID':
      return { ...state, activeTabControlId: action.payload };
    case 'SET_CONFIG_LOCK':
      return { ...state, configLock: action.payload };
    case 'SET_EM_SIZE_NUM':
      return { ...state, emSizeNum: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
