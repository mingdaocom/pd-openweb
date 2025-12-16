import * as ACTIONS from '../actions/search';

const initialState = {
  keywords: '',
  isSearching: false,
  result: {},
  searchValue: '',
};

export default (state = initialState, action) => {
  const { type, isSearching, result } = action;
  switch (type) {
    case 'PROJECT_ID_CHANGED':
      return initialState;
    case 'UPDATE_IS_SEARCHING':
      return { ...state, isSearching };
    case 'SEARCH_SUCCESS':
      return { ...state, result };
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
