import { combineReducers } from 'redux';
import _ from 'lodash';
import ACTION_TYPES from '../constant/actionTypes';

function attachments(state = [], action) {
  let newAttachments = state.slice(0);
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      newAttachments = action.attachments;
      return newAttachments;
    case 'FILE_PREVIEW_LOAD_FILE_SUCESS':
    case 'FILE_PREVIEW_UPDATE_FILE':
      newAttachments[action.index] = action.attachment;
      return newAttachments;
    case 'FILE_PREVIEW_DELETE_FILE':
      newAttachments.splice(action.index, 1);
      return newAttachments;
    case 'FILE_PREVIEW_LOAD_MORE_SUCESS':
      newAttachments = action.isPre
        ? action.attachments.concat(newAttachments)
        : newAttachments.concat(action.attachments);
      return newAttachments;
    default:
      return state;
  }
}

function originAttachments(state = [], action) {
  let newAttachments = state.slice(0);
  switch (action.type) {
    case 'FILE_PREVIEW_SAVE_ORIGIN_ATTACHMENTS':
      newAttachments = action.attachments;
      return newAttachments;
    default:
      return state;
  }
}

function index(state = 0, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
    case 'FILE_PREVIEW_CHANGE_INDEX':
      return action.index;
    case 'FILE_PREVIEW_DELETE_FILE':
      return action.newIndex;
    case 'FILE_PREVIEW_LOAD_MORE_SUCESS':
      if (action.isPre) {
        return state + action.attachments.length;
      }
      return state;
    default:
      return state;
  }
}

function extra(state = {}, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return action.extra;
    default:
      return state;
  }
}

function loading(state = true, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_LOAD_FILE_SUCESS':
      return false;
    case 'FILE_PREVIEW_LOAD_FILE_START':
    case 'FILE_PREVIEW_CLOSE':
      return true;
    default:
      return state;
  }
}

function showThumbnail(state = true, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return typeof action.showThumbnail === 'undefined' ? state : action.showThumbnail;
    default:
      return state;
  }
}

function showAttInfo(state = false, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return typeof action.showAttInfo === 'undefined' ? false : action.showAttInfo;
    default:
      return state;
  }
}

function error(state = false, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_ERROR':
    case 'FILE_PREVIEW_LOAD_FILE_SUCESS':
      return action.error || false;
    default:
      return state;
  }
}

function hideFunctions(state = [], action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return typeof action.hideFunctions === 'undefined' ? [] : action.hideFunctions;
    default:
      return state;
  }
}

function fromType(state = null, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return typeof action.fromType === 'undefined' ? null : action.fromType;
    default:
      return state;
  }
}

function onClose(state = null, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_INIT':
      return typeof action.onClose === 'undefined' ? null : action.onClose;
    default:
      return state;
  }
}

function isLoadingMore(state = false, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_LOAD_MORE_START':
      return true;
    case 'FILE_PREVIEW_INIT':
    case 'FILE_PREVIEW_LOAD_MORE_SUCESS':
      return false;
    default:
      return state;
  }
}

function loadMoreFinished(state = false, action) {
  switch (action.type) {
    case 'FILE_PREVIEW_LOAD_MORE_OUT':
      return true;
    case 'FILE_PREVIEW_INIT':
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  attachments,
  originAttachments,
  index,
  loading,
  extra,
  error,
  showThumbnail,
  showAttInfo,
  hideFunctions,
  fromType,
  isLoadingMore,
  loadMoreFinished,
  onClose,
});
