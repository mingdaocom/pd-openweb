
export const filtersGroup = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_ALL_FILTERS_GROUP':
      return { ...state, [action.id]: action.filters }
    default:
      return state;
  }
};

export const linkageFiltersGroup = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_LINKAGE_FILTERS_GROUP':
      return { ...state, [action.id]: action.filters };
    case 'MOBILE_DELETE_LINKAGE_FILTERS_GROUP':
      delete state[action.id];
      return { ...state };
    case 'MOBILE_DELETE_ALL_LINKAGE_FILTERS_GROUP':
      return {};
    default:
      return state;
  }
};


export const filterComponents = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_FILTER_COMPONENTS':
      return action.value;
    default:
      return state;
  }
};


export const loadFilterComponentCount = (state = 0, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_LOAD_FILTER_COMPONENT_COUNT':
      return action.value;
    default:
      return state;
  }
};

