
export const updateFiltersGroup = (id, filters = {}) => (dispatch, getState) => {
  dispatch({
    type: 'MOBILE_UPDATE_ALL_FILTERS_GROUP',
    id,
    filters,
  });
};
