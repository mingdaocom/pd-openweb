export const updateFiltersGroup =
  (id, filters = {}) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_UPDATE_ALL_FILTERS_GROUP',
      id,
      filters,
    });
  };

export const updateLinkageFiltersGroup =
  (id, filters = {}) =>
  dispatch => {
    dispatch({
      type: 'MOBILE_UPDATE_LINKAGE_FILTERS_GROUP',
      id,
      filters,
    });
  };

export const deleteLinkageFiltersGroup = id => dispatch => {
  dispatch({
    type: 'MOBILE_DELETE_LINKAGE_FILTERS_GROUP',
    id,
  });
};

export const deleteAllLinkageFiltersGroup = id => dispatch => {
  dispatch({
    type: 'MOBILE_DELETE_ALL_LINKAGE_FILTERS_GROUP',
    id,
  });
};

export const updateFilterComponents = value => dispatch => {
  dispatch({
    type: 'MOBILE_UPDATE_FILTER_COMPONENTS',
    value,
  });
};

export const updateLoadFilterComponentCount = value => dispatch => {
  dispatch({
    type: 'MOBILE_UPDATE_LOAD_FILTER_COMPONENT_COUNT',
    value,
  });
};
