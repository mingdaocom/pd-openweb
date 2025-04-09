import { combineReducers } from 'redux';
import * as utils from '../utils/';

/**
 * 会话列表
 * @param {*} state
 * @param {*} action
 */
const sessionList = (state = [], action) => {
  switch (action.type) {
    case 'SET_SESSION_LIST':
      return utils.filterSessionList(Object.assign([], action.result));
    case 'ADD_SESSION_LIST':
      return utils.filterSessionList(Object.assign([], state.concat(action.result)));
    case 'UPDATE_SESSION_LIST':
      return utils.filterSessionList(Object.assign([], action.result));
    case 'REMOVE_SESSION':
      return utils.filterSessionList(state.filter(item => item.value !== action.id));
    case 'ADD_SESSION':
      return utils.sortSession(utils.filterSessionList(Object.assign([], action.result.concat(state))));
    default:
      return state;
  }
};

/**
 * 控制 chat 的展开和收起，默认收起
 * @param {*} state
 * @param {*} action
 */
const visible = (state = utils.setVisible(), action) => {
  switch (action.type) {
    case 'SET_VISIBLE':
      return action.visible;
    default:
      return state;
  }
};

/**
 * 当前的会话信息
 * @param {*} state
 * @param {*} action
 */
const currentSession = (state = {}, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SESSION':
      return Object.assign({}, action.result);
    default:
      return state;
  }
};

/**
 * 当前聊过天的会话信息
 * @param {*} state
 * @param {*} action
 */
const currentSessionList = (state = [], action) => {
  switch (action.type) {
    case 'ADD_CURRENT_SESSION':
      return Object.assign([], state.concat(action.result));
    case 'REMOVE_CURRENT_SESSION':
      return state.filter(item => item.id !== action.id);
    case 'UPDATE_CURRENT_SESSION':
      return Object.assign([], action.result);
    default:
      return state;
  }
};


/**
 * 当前 inbox 的会话信息
 * @param {*} state
 * @param {*} action
 */
const currentInboxList = (state = [], action) => {
  switch (action.type) {
    case 'ADD_INBOX_SESSION':
      return Object.assign([], state.concat(action.result));
    case 'REMOVE_INBOX_SESSION':
      return state.filter(item => item.id !== action.id);
    case 'REMOVE_ALL_INBOX_SESSION':
      return [];
    case 'UPDATE_INBOX_SESSION':
      return state.map(item => {
        if (item.value === action.id) {
          return {
            ...item,
            ...action.data
          }
        }
        return item;
      })
    default:
      return state;
  }
};

/**
 * 消息记录
 * @param {*} state
 * @param {*} action
 */
const messages = (state = {}, action) => {
  switch (action.type) {
    case 'SET_MESSAGE':
      return Object.assign({}, state, { [action.id]: action.result });
    case 'ADD_MESSAGE':
      return Object.assign({}, state, { [action.id]: state[action.id].concat([action.result]) });
    case 'ADD_PAGE_MESSAGE':
      return Object.assign({}, state, { [action.id]: action.result.concat(state[action.id]) });
    case 'PUSH_PAGE_MESSAGE':
      return Object.assign({}, state, { [action.id]: state[action.id].concat(action.result) });
    case 'REMOVE_MESSAGE':
      const targetState = state[action.id];
      return targetState ? Object.assign({}, state, { [action.id]: targetState.filter(item => item && item.waitingId !== action.messageId) }) : state;
    case 'REMOVE_MESSAGES':
      delete state[action.id];
      return Object.assign({}, state);
    case 'UPDATE_MESSAGE':
      return Object.assign({}, action.result);
    default:
      return state;
  }
};

/**
 * 引用消息
 * @param {*} state
 * @param {*} action
 */
const referMessage = (state = {}, action) => {
  switch (action.type) {
    case 'SET_REFER_MESSAGE':
      return Object.assign({}, state, { [action.id]: action.message });
    case 'REMOVE_REFER_MESSAGE':
      delete state[action.id];
      return Object.assign({}, state);
    default:
      return state;
  }
};

/**
 * 定位到某条消息
 * @param {*} state
 * @param {*} action
 */
const gotoMessage = (state = {}, action) => {
  switch (action.type) {
    case 'SET_GOTO_MESSAGE':
      return Object.assign({}, state, { [action.id]: action.messageId });
    case 'REMOVE_GOTO_MESSAGE':
      delete state[action.id];
      return Object.assign({}, state);
    default:
      return state;
  }
};

/**
 * 底部未读的消息
 * @param {*} state
 * @param {*} action
 */
const bottomUnreadMessage = (state = {}, action) => {
  switch (action.type) {
    case 'SET_BOTTOM_UNREAD_MESSAGE':
      return Object.assign({}, state, { [action.id]: [action.message] });
    case 'ADD_BOTTOM_UNREAD_MESSAGE':
      return Object.assign({}, state, { [action.id]: state[action.id].concat([action.message]) });
    case 'REMOVE_BOTTOM_UNREAD_MESSAGE':
      delete state[action.id];
      return Object.assign({}, state);
    case 'UPDATE_BOTTOM_UNREAD_MESSAGE':
      return Object.assign({}, state, { [action.id]: action.message });
    default:
      return state;
  }
}

/**
 * 是否在新标签页聊天
 * @param {*} state
 * @param {*} action
 */
const isWindow = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_IS_WINDOW':
      return action.result;
    default:
      return state;
  }
};

/**
 * 是否显示通讯录
 * @param {*} state
 * @param {*} action
 */
const showAddressBook = (state = false, action) => {
  switch (action.type) {
    case 'UPDATE_SHOW_ADD_RESSBOOK':
      return action.result;
    default:
      return state;
  }
}

/**
 * socket 状态
 * @param {*} state (0：正常、1：正在重连、2：重连失败)
 * @param {*} action
 */
const socketState = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_SOCKET_STATE':
      return action.result;
    default:
      return state;
  }
}

export default combineReducers({
  sessionList,
  visible,
  currentSession,
  currentSessionList,
  currentInboxList,
  messages,
  referMessage,
  gotoMessage,
  isWindow,
  showAddressBook,
  bottomUnreadMessage,
  socketState
});
