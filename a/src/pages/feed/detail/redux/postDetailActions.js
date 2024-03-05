import { getPostDetail } from '../../redux/postActions';

export function changePostDetailId(postId, knowledgeId, projectId) {
  return (dispatch, getState) => {
    dispatch(getPostDetail(postId, knowledgeId, projectId));
    dispatch({ type: 'POST_DETAIL_CHANGE_ID', postId });
  };
}

export function clearPostDetail() {
  return { type: 'POST_DETAIL_CHANGE_ID', postId: '' };
}
