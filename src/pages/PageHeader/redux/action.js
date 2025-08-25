export const CHANGE_NAV_COLOR = 'CHANGE_NAV_COLOR';
export const CHANGE_APP_COLOR = 'CHANGE_APP_COLOR';
export const UPDATE_APP_GROUP = 'UPDATE_APP_GROUP';
export const SET_APP_STATUS = 'SET_APP_STATUS';
export const SYNC_APP_DETAIL = 'SYNC_APP_DETAIL';
export const CLEAR_APP_DETAIL = 'CLEAR_APP_DETAIL';

export const syncAppDetail = detail => ({
  type: SYNC_APP_DETAIL,
  detail,
});

export const changeAppColor = iconColor => ({
  type: CHANGE_APP_COLOR,
  iconColor,
});

export const changeNavColor = navColor => ({
  type: CHANGE_NAV_COLOR,
  navColor,
});

export const updateAppGroup = appGroups => ({
  type: UPDATE_APP_GROUP,
  appGroups,
});

export const setAppStatus = status => ({
  type: SET_APP_STATUS,
  status,
});

export const clearAppDetail = () => ({
  type: CLEAR_APP_DETAIL,
});
