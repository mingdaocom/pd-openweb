import _ from 'lodash';
import shallowEqual from 'shallowequal';
import groupController from 'src/api/group';
import postAjax from 'src/api/post';
import { emitter } from 'src/utils/common';
import postEnum from '../constants/postEnum';

function handleMdAjaxFail(dispatch, actionType, payload = {}) {
  return result => {
    if (result && result.status === 0) {
      dispatch(Object.assign({ type: actionType + '_ABORTED' }, payload));
    } else {
      dispatch(Object.assign({ type: actionType + '_FAIL' }, payload));
    }
  };
}

let ajaxObj;
/**
 * 加载动态列表
 * @param  {object} options     单次请求相关参数，包括 pIndex 等
 * @param  {object} pageOptions 主要参数
 * @return {Promise}
 */
function loadPosts(options, pageOptions, currentCount = 0) {
  let lType = 'project';
  if (pageOptions.listType === 'ireply') {
    lType = pageOptions.listType;
    options = _.assign({ type: 2, keywords: pageOptions.keywords }, options);
  } else {
    if (pageOptions.groupId) {
      lType = 'group';
    } else if (pageOptions.accountId) {
      lType = 'user';
    } else {
      lType = pageOptions.listType;
    }
    options = _.assign(
      {
        fType: pageOptions.fromType,
        gID: pageOptions.groupId,
        aId: pageOptions.accountId,
        tagId: pageOptions.tagId,
        catId: pageOptions.catId,
        projectId: pageOptions.projectId,
        startDate: pageOptions.startDate,
        endDate: pageOptions.endDate,
        postType: pageOptions.postType,
        keywords: pageOptions.keywords,
      },
      options,
      { lType },
    );
    options = _.pickBy(options, v => !_.isNull(v));

    if (options.lType === 'project') {
      if (typeof options.projectId === 'undefined') options.range = 0;
      else options.range = options.projectId ? 2 : 1;
    }
  }
  if (lType !== 'ireply') {
    if (ajaxObj) ajaxObj.abort();
    ajaxObj = postAjax.getPostListByLegacyPara(options);
    return ajaxObj.then(res => (res.success ? res : Promise.reject(res)));
  }
  return postAjax.getIRepliedList(options).then(
    res => {
      try {
        return {
          postList: _.map(res.list || [], item => {
            item.isIReply = true;
            return item;
          }),
          more: parseInt(res.count, 10) > currentCount,
        };
      } catch (e) {
        return Promise.reject(e);
      }
    },
    e => Promise.reject(e),
  );
}

function getFirstPostAutoID(postIds, postsById) {
  const postItem = postIds && postIds.length ? postsById[postIds[0]] : undefined;
  return postItem && postItem.autoID;
}

function getLastPostAutoID(postIds, postsById) {
  const postItem = postIds && postIds.length ? postsById[postIds[postIds.length - 1]] : undefined;
  return postItem && postItem.autoID;
}

function getMaxCommentId(postIds, postsById) {
  const postItem = postIds && postIds.length ? postsById[postIds[postIds.length - 1]] : undefined;
  return postItem && postItem.commentID;
}

export function loading(isLoading) {
  return {
    type: 'POST_LOADING',
    isLoading,
  };
}

export function reload(options, showLoading = false) {
  return (dispatch, getState) => {
    const { post } = getState();
    options = options || post.options;
    dispatch({ type: 'POST_RELOAD_START', options });
    if (showLoading) dispatch(loading(true));
    loadPosts(
      {
        pIndex: 1,
      },
      options,
      post.postIds.length,
    ).then(
      ({ postList, more }) => {
        window.scrollTo(0, 0);
        dispatch({
          type: 'POST_RELOAD_SUCCESS',
          options,
          postList,
          hasMore: !!more,
        });
      },
      handleMdAjaxFail(dispatch, 'POST_RELOAD', { options }),
    );
  };
}

export function loadMore() {
  return (dispatch, getState) => {
    const { post } = getState();
    const { options } = post;
    dispatch({ type: 'POST_LOAD_MORE_START', options });
    loadPosts(
      options.listType === 'ireply'
        ? { maxCommentId: getMaxCommentId(post.ireplyPostIds, post.ireplyPostsById) }
        : {
            pIndex: post.pageIndex + 1,
            lastPostAutoID: getLastPostAutoID(post.postIds, post.postsById),
          },
      options,
      post.postIds.lenth,
    ).then(({ postList, more }) => {
      dispatch(
        {
          type: 'POST_LOAD_MORE_SUCCESS',
          options,
          postList,
          hasMore: !!more,
        },
        handleMdAjaxFail(dispatch, 'POST_LOAD_MORE', { options }),
      );
    });
  };
}

export function focusUpdater() {
  return () => {
    $('#textarea_Updater').focus();
  };
}

/**
 * 加载置顶动态
 * @param  {string} projectId 网络 id, 全部为 null, 其他协作群等没非网络的情况下为空字符串
 */
export function loadTop(projectId) {
  return (dispatch, getState) => {
    dispatch({ type: 'POST_LOAD_TOP_START' });
    if (projectId === '') {
      // 其他协作群组
      dispatch({ type: 'POST_LOAD_TOP_SUCCESS', postList: [], projectId });
      return;
    }
    postAjax
      .getTopPosts({
        projectId,
      })
      .then(postList => {
        dispatch({
          type: 'POST_LOAD_TOP_SUCCESS',
          postList,
          projectId,
        });
      });
  };
}

export function changeFontSize(fontSize) {
  safeLocalStorageSetItem(md.global.Account.accountId + '_fontsize', fontSize);
  return {
    type: 'POST_CHANGE_FONT_SIZE',
    fontSize,
  };
}

const defaultOptions = {
  fromType: postEnum.FROM_TYPE.feed, // fType
  listType: postEnum.LIST_TYPE.project, // lType
  projectId: null,
  groupId: null, // gID
  accountId: null, // aId
  startDate: null,
  endDate: null,
  postType: postEnum.POST_TYPE.all,
  tagId: null,
  keywords: null, // 搜索参数
};

function ensureProjectIdByGroupIdInOptions(options) {
  if (options.groupId && typeof options.projectId === 'undefined') {
    return groupController.getGroupInfo({ groupId: options.groupId }).then(group => {
      if (group && md.global.Account.projects.some(p => p.projectId === group.projectId)) {
        options.projectId = group.projectId;
      }
      return options;
    });
  }
  return Promise.resolve(options);
}

export function changeListType(inputOptions, showLoading = false) {
  return (dispatch, getState) => {
    const { post } = getState();
    const prevOptions = post.options;
    ensureProjectIdByGroupIdInOptions(inputOptions).then(options => {
      options = Object.assign({}, defaultOptions, options);

      if (
        [
          postEnum.LIST_TYPE.my,
          postEnum.LIST_TYPE.myself,
          postEnum.LIST_TYPE.with,
          postEnum.LIST_TYPE.fav,
          postEnum.LIST_TYPE.user,
          postEnum.LIST_TYPE.ireply,
          postEnum.LIST_TYPE.reply,
        ].indexOf(options.listType) > -1
      ) {
        dispatch(loadTop(''));
      } else if (
        prevOptions.projectId !== options.projectId ||
        (_.isNull(options.projectId) && prevOptions.listType !== options.listType)
      ) {
        dispatch(loadTop(options.projectId));
      }

      dispatch({ type: 'POST_CHANGE_SEARCH_KEYWORDS', keywords: null });
      dispatch({ type: 'POST_CHANGE_OPTIONS', options });
      dispatch(reload(options, showLoading || !shallowEqual(Object.assign({}, prevOptions, options), prevOptions)));
    });
  };
}

export function changeSearchKeywords(keywords) {
  return { type: 'POST_CHANGE_SEARCH_KEYWORDS', keywords };
}

export function searchAll(keywords) {
  return changeListType({ keywords });
}

export function filter(inputOptions) {
  return (dispatch, getState) => {
    const { post } = getState();
    const { listType, groupId, accountId, tagId, catId, projectId } = post.options;
    const options = Object.assign(
      {},
      defaultOptions,
      { listType, groupId, accountId, tagId, catId, projectId },
      inputOptions,
    );
    const keywords = typeof options.keywords === 'undefined' ? null : options.keywords;
    dispatch({ type: 'POST_CHANGE_SEARCH_KEYWORDS', keywords });
    dispatch({ type: 'POST_CHANGE_OPTIONS', options });
    dispatch(reload(options, true));
  };
}

export function getPostDetail(postId, knowledgeId, projectId) {
  return dispatch => {
    dispatch({ type: 'POST_GET_POST_DETAIL_START', postId });
    postAjax.getPostDetail({ postId, knowledgeId, projectId }).then(
      postItem => {
        if (postItem.success === '1') {
          dispatch({ type: 'POST_GET_POST_DETAIL_SUCCESS', postItem });
        } else {
          dispatch({
            type: 'POST_GET_POST_DETAIL_FAIL',
            postId,
            errorMessage: '您的权限不足或此动态已被删除，无法查看',
          });
        }
      },
      ({ errorMessage }) => {
        dispatch({ type: 'POST_GET_POST_DETAIL_FAIL', postId, errorMessage });
      },
    );
  };
}

export function addSuccess(postItem, toPostWall = true) {
  return {
    type: 'POST_ADD_SUCCESS',
    postItem,
    toPostWall,
  };
}

export function remove(postId) {
  return dispatch => {
    dispatch({ type: 'POST_REMOVE_START', postId });
    postAjax
      .removePost({
        postID: postId,
        accountID: md.global.Account.accountId,
      })
      .then(data => {
        const { success } = data;
        if (success) {
          alert(_l('删除成功'));
          dispatch({ type: 'POST_REMOVE_SUCCESS', postId });
          emitter.emit('POST_REMOVE_SUCCESS', { postId });
        } else {
          alert((data && data.message) || _l('删除失败'), 2);
        }
      });
  };
}

function updateCommon({
  postId,
  startActionType,
  startActionArgs,
  ajaxMethod,
  failMessage,
  updateMethod,
  successMessage,
  catchMethod,
}) {
  return (dispatch, getState) => {
    dispatch(Object.assign({ type: startActionType }, startActionArgs));
    ajaxMethod(startActionArgs).then(
      success => {
        if (!success) {
          return alert(failMessage, 2);
        }
        const postItem = _.clone(getState().post.postsById[postId]);
        const promise = postItem ? Promise.resolve(updateMethod(postItem)) : postAjax.getPostDetail({ postId });
        promise.then(postItemResult => {
          dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
        });
        if (successMessage) alert(successMessage);
      },
      () => {
        if (catchMethod) catchMethod();
      },
    );
  };
}

export function addTop({ postId, hours }) {
  return updateCommon({
    postId,
    startActionType: 'POST_ADD_TOP_START',
    startActionArgs: { hours, postId },
    ajaxMethod: postAjax.addTopPost,
    failMessage: _l('置顶失败'),
    updateMethod: postItem => {
      postItem.isFeedtop = true;
      return postItem;
    },
    successMessage: _l('置顶成功'),
    catchMethod: loadTop,
  });
}

export function removeTop({ postId }) {
  return updateCommon({
    postId,
    startActionType: 'POST_REMOVE_TOP_START',
    startActionArgs: { postId },
    ajaxMethod: postAjax.removeTopPost,
    failMessage: _l('移除失败'),
    updateMethod: postItem => {
      postItem.isFeedtop = false;
      return postItem;
    },
    successMessage: _l('操作成功'),
    catchMethod: loadTop,
  });
}

export function addFavorite({ postId }) {
  return updateCommon({
    postId,
    startActionType: 'POST_ADD_FAVORITE_START',
    startActionArgs: { postId, isFavorite: true },
    ajaxMethod: postAjax.favorite,
    failMessage: _l('添加失败'),
    updateMethod: postItem => {
      postItem.isFav = true;
      return postItem;
    },
    successMessage: _l('已收藏'),
    catchMethod: () => getPostDetail(postId),
  });
}

export function removeFavorite({ postId }) {
  return updateCommon({
    postId,
    startActionType: 'POST_REMOVE_FAVORITE_START',
    startActionArgs: { postId, isFavorite: false },
    ajaxMethod: postAjax.favorite,
    failMessage: _l('添加失败'),
    updateMethod: postItem => {
      postItem.isFav = false;
      return postItem;
    },
    successMessage: _l('已取消收藏'),
    catchMethod: () => getPostDetail(postId),
  });
}

export function addLike({ postId }) {
  return updateCommon({
    postId,
    startActionType: 'POST_ADD_LIKE_START',
    startActionArgs: { postId, isLike: true },
    ajaxMethod: postAjax.like,
    failMessage: _l('添加失败'),
    updateMethod: postItem => {
      if (!postItem.liked) postItem.likeCount = postItem.likeCount + 1;
      postItem.liked = true;
      return postItem;
    },
    successMessage: null,
    catchMethod: () => getPostDetail(postId),
  });
}

export function removeLike({ postId }) {
  return updateCommon({
    postId,
    startActionType: 'POST_REMOVE_LIKE_START',
    startActionArgs: { postId, isLike: false },
    ajaxMethod: postAjax.like,
    failMessage: _l('添加失败'),
    updateMethod: postItem => {
      if (postItem.liked) postItem.likeCount = postItem.likeCount - 1;
      postItem.liked = false;
      return postItem;
    },
    successMessage: null,
    catchMethod: () => getPostDetail(postId),
  });
}

export function addTagSuccess({ postId, tagId, tagName }) {
  const tag = {
    tagId,
    tagName,
    createUser: md.global.Account.accountId,
  };
  return (dispatch, getState) => {
    const postItem = _.clone(getState().post.postsById[postId]);
    const promise = postItem
      ? Promise.resolve(((postItem.tags = [tag].concat(postItem.tags.filter(t => t.tagId !== tagId))), postItem))
      : postAjax.getPostDetail({ postId });
    promise.then(postItemResult => {
      dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
    });
  };
}

export function removeTagSuccess({ postId, tagId }) {
  return (dispatch, getState) => {
    const postItem = _.clone(getState().post.postsById[postId]);
    const promise = postItem
      ? Promise.resolve(((postItem.tags = postItem.tags.filter(t => t.tagId !== tagId)), postItem))
      : postAjax.getPostDetail({ postId });
    promise.then(postItemResult => {
      dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
    });
  };
}

export function editVoteEndTimeSuccess({ postId, deadline }) {
  return (dispatch, getState) => {
    const postItem = _.clone(getState().post.postsById[postId]);
    const promise = postItem
      ? Promise.resolve(((postItem.Deadline = deadline), postItem))
      : postAjax.getPostDetail({ postId });
    promise.then(postItemResult => {
      dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
    });
  };
}

export function editShareScopeSuccess({ postId, scope }) {
  return (dispatch, getState) => {
    const postItem = _.clone(getState().post.postsById[postId]);
    const promise = postItem
      ? Promise.resolve(((postItem.scope = scope), postItem))
      : postAjax.getPostDetail({ postId });
    promise.then(postItemResult => {
      dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
    });
  };
}

export function addComment(args, successCallback, failCallback) {
  return (dispatch, getState) => {
    dispatch({ type: 'POST_ADD_COMMENT_START', args });
    postAjax.addPostComment(args).then(result => {
      if (result == '-1' || !result.success) {
        failCallback(result);
        return alert(_l('操作失败'), 2);
      }
      if (result.withPost) {
        dispatch(addSuccess(result.withPost));
      }
      const postId = args.postID;
      const postItem = _.clone(getState().post.postsById[postId]);
      const promise = postItem
        ? Promise.resolve(
            ((postItem.commentCount = postItem.commentCount + 1),
            (postItem.comments = [result.comment].concat(postItem.comments)),
            postItem),
          )
        : postAjax.getPostDetail({ postId });
      promise.then(postItemResult => {
        dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
      });
      successCallback(result);
    });
  };
}

export function removeComment(postID, commentID) {
  return (dispatch, getState) => {
    dispatch({ type: 'POST_REMOVE_COMMENT_START' });
    postAjax
      .removePostComment({
        postID,
        commentID,
        accountID: md.global.Account.accountId,
      })
      .then(data => {
        const { success } = data;
        if (!success) {
          alert(_l('删除失败'), 2);
        } else {
          alert(_l('删除成功'));
          const postItem = _.clone(getState().post.postsById[postID]);
          const promise = postItem
            ? Promise.resolve(
                ((postItem.commentCount = postItem.commentCount - 1),
                (postItem.comments = postItem.comments ? postItem.comments.filter(c => c.commentID !== commentID) : []),
                postItem),
              )
            : postAjax.getPostDetail({ postId: postID });
          promise.then(postItemResult => {
            dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
          });
        }
      });
  };
}

export function loadMoreComments(postId) {
  return (dispatch, getState) => {
    dispatch({ type: 'POST_LOAD_MORE_COMMENTS_START' });
    postAjax
      .getMorePostComments({
        postID: postId,
        accountID: md.global.Account.accountId,
      })
      .then(data => {
        if (data == '-1') {
          alert(_l('回复加载失败'), 2);
        } else if (data == 'error') {
          alert(_l('操作失败'), 2);
        } else if (data.length > 0) {
          const postItem = _.clone(getState().post.postsById[postId]);
          const promise = postItem
            ? Promise.resolve(((postItem.commentCount = data.length), (postItem.comments = data), postItem))
            : postAjax.getPostDetail({ postId });
          promise.then(postItemResult => {
            dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: postItemResult });
          });
        }
      });
  };
}

export function edit(args, successCallback, failCallback) {
  return dispatch => {
    dispatch({ type: 'POST_EDIT_START', args });
    postAjax
      .editPost(args)
      .then(result => {
        if (!result.success) {
          failCallback(result);
          return alert('操作失败', 2);
        }
        alert(_l('操作成功'));
        dispatch({ type: 'POST_UPDATE_SUCCESS', postItem: result.post });
        if (successCallback) {
          successCallback(result);
        }
      })
      .catch(result => {
        dispatch({ type: 'POST_EDIT_FAIL', args });
        if (failCallback) {
          failCallback(result);
        }
      });
  };
}

export function changeTitle(title) {
  return {
    type: 'POST_CHANGE_TITLE',
    title,
  };
}
