
export const updateFiltersGroup = (id, filters = {}) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_ALL_FILTERS_GROUP',
    id,
    filters,
  });
};

export const updateFilterComponents = value => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_FILTER_COMPONENTS',
    value,
  });
}

export const updateLoadFilterComponentCount = value => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_LOAD_FILTER_COMPONENT_COUNT',
    value,
  });
}