import _ from 'lodash';
import ACTION_TYPES from '../constant/actionTypes';

const json = {
  attachments: [],
  previewUrl: '',
  currentIndex: 0,
  thumbnailFlod: false,
  slideFold: false,
  inited: false,
  isLoading: true,
  showAttInfo: true,
  attInfoFolded: true,
  loadMoreFinished: false,
  fullscreen: false,
  extra: {},
  performUpdateItem: (node) => {
    console.log(node);
  },
};

function attachmentsPreviewApp(state = json, action) {
  let newState = _.assign({}, state);
  newState.error = false;
  newState.previewUrl = '';
  switch (action.type) {
    case ACTION_TYPES.INIT: {
      newState = _.assign({}, json);
      newState.extra = action.extra;
      newState = _.assign({}, newState, action.options);
      newState.attachments = action.attachments.slice(0);
      newState.originAttachments = action.attachments.slice(0);
      newState.currentIndex = action.currentIndex;
      newState.attachmentsNum = action.attachments.length;
      newState.callFrom = action.callFrom || undefined;
      newState.loadMoreFinished = false;
      newState.inited = true;
      return newState;
    }
    case ACTION_TYPES.CHANGE_INDEX: {
      newState.currentIndex = action.index;
      newState.isLoading = true;
      return newState;
    }
    case ACTION_TYPES.CLEAR_URL: {
      newState.previewUrl = '';
      newState.isLoading = true;
      return newState;
    }
    case ACTION_TYPES.HANDLE_ATTACHMENT: {
      const attachment = action.attachment;
      newState.isLoading = false;
      newState.attachments[action.index] = attachment;
      if (action.error) {
        newState.error = action.error;
      }
      newState.force = Math.random();
      return newState;
    }
    case ACTION_TYPES.ERROR: {
      newState.error = action.error.msg ? action.error.msg : true;
      return newState;
    }
    case ACTION_TYPES.DISABLE_INITED: {
      newState.inited = false;
      return newState;
    }
    case ACTION_TYPES.UPDATE_FILENAME: {
      const keyName = action.nodeType === 'kc' ? 'name' : 'originalFilename';
      newState.attachments[action.index][keyName] = action.newName;
      newState.force = Math.random();
      return newState;
    }
    case ACTION_TYPES.UPDATE_ALLOWDOWNLOAD: {
      newState.attachments[action.index].allowDown = action.allowDown;
      newState.force = Math.random();
      return newState;
    }
    case ACTION_TYPES.DELETE_ATTACHMENT: {
      // newState.isLoading = false;
      // newState.attachments[action.newIndex] = action.newAttachment;
      let index = action.index;
      newState.attachments.splice(index, 1);
      if (index === newState.attachments.length) {
        index = index - 1;
      }
      newState.currentIndex = index;
      // newState.force = Math.random();
      return newState;
    }
    case ACTION_TYPES.LOAD_MORE_ATTACHMENTS: {
      newState.attachments = newState.attachments.concat(action.attachments);
      return newState;
    }
    case ACTION_TYPES.LOAD_MORE_FINISHED: {
      newState.loadMoreFinished = true;
      return newState;
    }
    case ACTION_TYPES.TOGGLE_FULLSCREEN: {
      newState.fullscreen = !newState.fullscreen;
      return newState;
    }
    // case ACTION_TYPES: {
    //   newState.attachments.splice(action.index, 1);
    //   return newState;
    // }
    default:
      return state;
  }
}

import { createStore, applyMiddleware, compose } from 'redux';
const thunk = require('redux-thunk').default;

const store = createStore(attachmentsPreviewApp, compose(applyMiddleware(thunk), window.devToolsExtension ? window.devToolsExtension() : f => f));
module.exports = store;
