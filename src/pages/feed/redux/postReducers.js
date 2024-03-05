import _ from 'lodash';
import defaultOptions from './defaultOptions';
import postEnum from '../constants/postEnum';

function getPostIdsFromPostList(postList, isIReply = false) {
  if (!postList || !postList.length) return [];
  return _(postList)
    .map(postItem => postItem && (options && isIReply ? postItem.commentID : postItem.postID))
    .compact()
    .value();
}

function normalizePost(postItem) {
  if (!postItem) return postItem;
  const properties = {};
  if (typeof postItem.commentCount !== 'number') {
    properties.commentCount = parseInt(postItem.commentCount, 10);
  }
  if (typeof postItem.likeCount !== 'number') {
    properties.likeCount = parseInt(postItem.likeCount, 10);
  }
  if (!postItem.categories) {
    properties.categories = [];
  }
  if (!postItem.tags) {
    properties.tags = [];
  }
  if (Object.keys(properties).length) {
    postItem = Object.assign({}, postItem, properties);
  }
  return postItem;
}
function getPostByIdsFromPostList(postList, isIReply = false) {
  if (!postList || !postList.length) return {};
  postList = postList.filter(postItem => !!isIReply === !!postItem.isIReply);
  return postList.reduce((obj, postItem) => {
    if (postItem) {
      if (postItem.isIReply && postItem.commentID) {
        obj[postItem.commentID] = normalizePost(postItem);
      } else if (postItem.postID) {
        obj[postItem.postID] = normalizePost(postItem);
      }
    }
    return obj;
  }, {});
}

export function ireplyPostIds(state = [], action) {
  switch (action.type) {
    case 'POST_RELOAD_SUCCESS':
      return getPostIdsFromPostList(action.postList, true);
    case 'POST_LOAD_MORE_SUCCESS':
      return _.uniqBy(state.concat(getPostIdsFromPostList(action.postList, true)));
    default:
      return state;
  }
}
export function ireplyPostsById(state = {}, action) {
  switch (action.type) {
    case 'POST_RELOAD_SUCCESS':
    case 'POST_LOAD_MORE_SUCCESS':
      return Object.assign({}, state, getPostByIdsFromPostList(action.postList, true));
    default:
      return state;
  }
}

export function postIds(state = [], action) {
  switch (action.type) {
    case 'POST_ADD_SUCCESS':
      return action.toPostWall ? [action.postItem.postID].concat(state) : state;
    case 'POST_REMOVE_SUCCESS':
      return state.filter(id => id !== action.postId);
    case 'POST_RELOAD_SUCCESS':
      return getPostIdsFromPostList(action.postList);
    case 'POST_LOAD_MORE_SUCCESS':
      return _.uniqBy(state.concat(getPostIdsFromPostList(action.postList)));
    default:
      return state;
  }
}

export function topPostIds(state = [], action) {
  switch (action.type) {
    case 'POST_LOAD_TOP_SUCCESS':
      return getPostIdsFromPostList(action.postList, action.options);
    case 'POST_LOAD_TOP_FAIL':
      return [];
    case 'POST_ADD_SUCCESS':
    case 'POST_UPDATE_SUCCESS':
      if (action.postItem.isFeedtop) state = _.uniqBy(state.concat([action.postItem.postID]));
      else state = state.filter(id => id !== action.postItem.postID);
      return state;
    case 'POST_REMOVE_SUCCESS':
      return state.filter(id => id !== action.postId);
    default:
      return state;
  }
}

export function postsById(state = {}, action) {
  switch (action.type) {
    case 'POST_ADD_SUCCESS':
    case 'POST_UPDATE_SUCCESS':
    case 'POST_GET_POST_DETAIL_SUCCESS':
      return Object.assign({}, state, { [action.postItem.postID]: normalizePost(action.postItem) });
    case 'POST_REMOVE_SUCCESS':
      state = Object.assign({}, state);
      delete state[action.postId];
      return state;
    case 'POST_RELOAD_SUCCESS':
    case 'POST_LOAD_MORE_SUCCESS':
      return Object.assign({}, state, getPostByIdsFromPostList(action.postList));
    case 'POST_LOAD_TOP_SUCCESS':
      return Object.assign({}, getPostByIdsFromPostList(action.postList), state);
    default:
      return state;
  }
}

export function hasNew(state = false, action) {
  switch (action.type) {
    case 'POST_HAS_NEW':
      return action.hasNew;
    default:
      return state;
  }
}

export function hasMore(state = false, action) {
  switch (action.type) {
    case 'POST_RELOAD_START':
      return false;
    case 'POST_LOAD_MORE_FAIL':
      return true;
    case 'POST_RELOAD_SUCCESS':
    case 'POST_LOAD_MORE_SUCCESS':
      return action.hasMore;
    default:
      return state;
  }
}

export function loading(state = true, action) {
  switch (action.type) {
    case 'POST_RELOAD_FAIL':
    case 'POST_RELOAD_SUCCESS':
    case 'POST_LOAD_MORE_FAIL':
    case 'POST_LOAD_MORE_SUCCESS':
      return false;
    case 'POST_LOADING':
      return action.isLoading !== false;
    default:
      return state;
  }
}

export function loadingMore(state = false, action) {
  switch (action.type) {
    case 'POST_LOAD_MORE_START':
      return true;
    case 'POST_RELOAD_FAIL':
    case 'POST_RELOAD_SUCCESS':
    case 'POST_LOAD_MORE_FAIL':
    case 'POST_LOAD_MORE_SUCCESS':
      return false;
    default:
      return state;
  }
}

export function pageIndex(state = 1, action) {
  switch (action.type) {
    case 'POST_RELOAD_SUCCESS':
      return 1;
    case 'POST_LOAD_MORE_SUCCESS':
      return state + 1;
    default:
      return state;
  }
}

export function fontSize(state = 13, action) {
  switch (action.type) {
    case 'POST_CHANGE_FONT_SIZE':
      return action.fontSize || 13;
    default:
      return state;
  }
}

export function options(state = defaultOptions, action) {
  switch (action.type) {
    case 'POST_RELOAD_SUCCESS':
    case 'POST_CHANGE_OPTIONS':
      return Object.assign({}, state, action.options);
    default:
      return state;
  }
}

// 右侧搜索框的值，在当前筛选条件中搜索，因为列表刷新后元素会被移除重新渲染所以状态不能放在组件中
export function searchKeywords(state = null, action) {
  switch (action.type) {
    case 'POST_CHANGE_SEARCH_KEYWORDS':
      return action.keywords;
    default:
      return state;
  }
}

export function title(state = _l('动态墙'), action) {
  switch (action.type) {
    case 'POST_CHANGE_TITLE':
      return action.title;
    default:
      return state;
  }
}
