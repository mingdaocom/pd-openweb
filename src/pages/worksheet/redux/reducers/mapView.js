const INIT_STATE = {
  mapViewData: [],
  mapViewLoading: false,
  refreshMap: false,
  mapViewState: {
    searchData: {},
    navGroupFilters: [],
  },
};

export default function boardView(state = INIT_STATE, action) {
  const { type, data } = action;

  switch (type) {
    case 'CHANGE_MAP_VIEW_DATA':
      return { ...state, mapViewData: data };
    case 'CHANGE_MAP_VIEW_LOADING':
      return { ...state, mapViewLoading: action.loading };
    case 'REFRESH_MAP':
      return { ...state, refreshMap: action.refreshMap };
    case 'CHANGE_MAP_VIEW_SEARCH_DATA':
      return { ...state, mapViewState: { ...state.mapViewState, searchData: data } };
    case 'NAV_GROUP_FILTERS':
      return { ...state, mapViewState: { ...state.mapViewState, navGroupFilters: action.navGroupFilters } };
    default:
      return state;
  }
}
