import { CALL_API } from '../middleware/api';

export const SEARCH_REQUEST = 'SEARCH_REQUEST';
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS';
export const SEARCH_FAILURE = 'SEARCH_FAILURE';

/**
 * 搜索
 * @param keywords
 */
export const fetchSearchResult = keywords => dispatch => {
  return dispatch({
    keywords,
    [CALL_API]: {
      types: [SEARCH_REQUEST, SEARCH_SUCCESS, SEARCH_FAILURE],
      params: {
        keywords,
      },
    },
  });
};

export const CLEAR_KEYWORDS = 'CLEAR_KEYWORDS';
/**
 * 清除搜索关键字
 * @returns {{type: object}}
 */
export const clearSearchKeywords = () => {
  return {
    type: CLEAR_KEYWORDS,
  };
};

export const CUSTOM_LIST = 'CUSTOM_LIST';

/**
 * 搜索结果点击选中用户后 添加到userList
 * @param {array} accountIds - 用户accountId array
 * @returns {{object}}
 */
export const getCustomList = accountIds => {
  return {
    type: CUSTOM_LIST,
    accountIds,
  };
};
