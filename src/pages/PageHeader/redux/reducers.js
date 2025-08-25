import {
  CHANGE_APP_COLOR,
  CHANGE_NAV_COLOR,
  CLEAR_APP_DETAIL,
  SET_APP_STATUS,
  SYNC_APP_DETAIL,
  UPDATE_APP_GROUP,
} from './action';

const defaultState = { iconColor: '#1677ff', projectId: '', appGroups: [], appStatus: 0, name: _l('应用') };

export default function appDetailState(state = defaultState, action) {
  const { type, iconColor, navColor, detail, appGroups = [], status = 0 } = action;
  switch (type) {
    case SYNC_APP_DETAIL:
      return { ...state, ...detail };
    case CHANGE_APP_COLOR:
      return { ...state, iconColor };
    case CHANGE_NAV_COLOR:
      return { ...state, navColor };
    case UPDATE_APP_GROUP:
      return { ...state, appGroups };
    case SET_APP_STATUS:
      return { ...state, appStatus: status };
    case CLEAR_APP_DETAIL:
      return { ...defaultState };
    default:
      return state;
  }
}
