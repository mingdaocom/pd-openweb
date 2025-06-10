export const rowInfo = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_RELATION_ROW_INFO':
      return action.data;
    default:
      return state;
  }
};

export const loadParams = (state = { pageIndex: 1, isMore: true, loading: true, keywords: '' }, action) => {
  switch (action.type) {
    case 'MOBILE_RELATION_LOAD_PARAMS':
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const relationRows = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_RELATION_ROWS':
      return action.data;
    default:
      return state;
  }
};

export const relationRow = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_RELATION_ROW':
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const permissionInfo = (state = {}, action) => {
  switch (action.type) {
    case 'MOBILE_PERMISSION_INFO':
      return action.data;
    default:
      return state;
  }
};

export const actionParams = (
  state = {
    showControls: [],
    coverCid: '',
    isEdit: false,
    selectedRecordIds: [],
  },
  action,
) => {
  switch (action.type) {
    case 'MOBILE_RELATION_ACTION_PARAMS':
      return { ...state, ...action.data };
    default:
      return state;
  }
};
