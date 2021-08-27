export function postId(state = null, action) {
  switch (action.type) {
    case 'POST_DETAIL_CHANGE_ID':
      return action.postId || '';
    default:
      return state || '';
  }
}

export function errors(state = {}, action) {
  switch (action.type) {
    case 'POST_DETAIL_CHANGE_ID':
      state = Object.assign({}, state);
      delete state[action.postId];
      return state;
    case 'POST_GET_POST_DETAIL_FAIL':
      state = Object.assign({}, state, {
        [action.postId]: action.errorMessage || _l('获取动态详情失败'),
      });
      return state;
    default:
      return state;
  }
}
