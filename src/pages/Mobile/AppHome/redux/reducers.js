export const getAppHomeList = (state = [], actions) => {
  switch (actions.type) {
    case 'UPDATE_APPHOMELIST':
      return actions.data;
    default:
      return state;
  }
};

export const myAppData = (state = {}, actions) => {
  switch (actions.type) {
    case 'UPDATE_MYAPPLIST':
      return actions.data;
    default:
      return state;
  }
};

export const isHomeLoading = (state = true, action) => {
  switch (action.type) {
    case 'MOBILE_FETCHHOMELIST_START':
      return true;
    case 'MOBILE_FETCHHOMELIST_SUCCESS':
      return false;
    default:
      return state;
  }
};
