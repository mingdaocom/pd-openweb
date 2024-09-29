import * as ACTIONS from '../actions/search';

const initialState = {
  keywords: '',
  isSearching: false,
  result: {},
  searchValue: '',
};

export default (state = initialState, action) => {
  const { type, keywords } = action;
  switch (type) {
    case 'PROJECT_ID_CHANGED':
      return initialState;
    case ACTIONS.SEARCH_REQUEST:
      return {
        ...state,
        keywords,
        isSearching: true,
      };
    case ACTIONS.SEARCH_SUCCESS:
    case ACTIONS.SEARCH_FAILURE:
      const { response } = action;
      return {
        ...state,
        result: response,
        isSearching: false,
      };
      break;
    case ACTIONS.CLEAR_KEYWORDS:
      return {
        ...state,
        keywords: '',
        result: {},
        isSearching: false,
      };
    case 'UPDATE_SEARCH_VALUYE':
      return {
        ...state,
        searchValue: action.data,
      };
    default:
      return state;
  }
};
