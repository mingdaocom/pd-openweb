export const applyData = (
  state = {
    data: [],
  },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_APPLY_LIST':
      return action.data;
    default:
      return state;
  }
};

export const isApplyLoading = (state = true, action) => {
  switch (action.type) {
    case 'APPLY_LIST_START':
      return true;
    case 'APPLY_LIST_OVER':
      return false;
    default:
      return state;
  }
};
