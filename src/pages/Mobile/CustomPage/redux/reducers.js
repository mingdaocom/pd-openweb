
export const filtersGroup = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_ALL_FILTERS_GROUP':
      return { ...state, [action.id]: action.filters }
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

