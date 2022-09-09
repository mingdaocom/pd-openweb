
export const filtersGroup = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATE_ALL_FILTERS_GROUP':
      return { ...state, [action.id]: action.filters }
    default:
      return state;
  }
};
