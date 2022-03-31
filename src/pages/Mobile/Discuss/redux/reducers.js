

export const sheetDiscussions = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_SET_SHEET_DISCUSSION':
      return action.data;
    case 'MOBILE_ADD_SHEET_DISCUSSION':
      return Object.assign([], state.concat(action.data));
    default:
      return state;
  }
}

export const sheetLogs = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_SET_SHEET_LOG':
      return action.data;
    case 'MOBILE_ADD_SHEET_LOG':
      return Object.assign([], state.concat(action.data));
    default:
      return state;
  }
}

export const sheetAttachments = (state = [], action) => {
  switch (action.type) {
    case 'MOBILE_SET_SHEET_ATTACHMENTS':
      return action.data;
    default:
      return state;
  }
}
