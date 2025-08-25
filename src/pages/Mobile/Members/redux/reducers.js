export const memberData = (
  state = {
    data: [],
  },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_MEMBER_DATA':
      return action.data;
    default:
      return state;
  }
};

export const isMemberLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_FETCH_MEMBER_START':
      return true;
    case 'MOBILE_FETCH_MEMBER_SUCCESS':
      return false;
    default:
      return state;
  }
};
