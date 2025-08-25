export const memberList = (
  state = {
    data: [],
  },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_MEMBER_LIST':
      return action.data;
    default:
      return state;
  }
};

export const isListLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_LIST_FETCH_START':
      return true;
    case 'MOBILE_LIST_FETCH_SUCCESS':
      return false;
    default:
      return state;
  }
};

export const isUpdateListLoading = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_UPDATELIST_FETCH_START':
      return true;
    case 'MOBILE_UPDATELIST_FETCH_OVER':
      return false;
    default:
      return state;
  }
};
