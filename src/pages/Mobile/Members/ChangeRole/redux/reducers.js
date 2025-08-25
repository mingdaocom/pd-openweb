export const roleList = (
  state = {
    data: [],
  },
  action,
) => {
  switch (action.type) {
    case 'UPDATE_ROLE_LIST':
      return action.data;
    default:
      return state;
  }
};

export const isRoleListLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_ROLE_LIST_FETCH_START':
      return true;
    case 'MOBILE_ROLE_LIST_FETCH_SUCCESS':
      return false;
    default:
      return state;
  }
};

export const moveRoleFetch = (state = false, action) => {
  switch (action.type) {
    case 'MOBILE_ROLE_MOVE_FETCH_START':
      return false;
    case 'MOBILE_ROLE_MOVE_FETCH_SUCCESS':
      return true;
    case 'MOBILE_ROLE_MOVE_FETCH_FAIL':
      return false;
    default:
      return state;
  }
};
