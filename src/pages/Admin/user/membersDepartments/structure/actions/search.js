import departmentController from 'src/api/department';

/**
 * 搜索
 * @param keywords
 */
export const fetchSearchResult = keywords => (dispatch, getState) => {
  const { showDisabledDepartment } = getState().entities;
  const { projectId } = getState().current;
  dispatch({ type: 'UPDATE_IS_SEARCHING', isSearching: true });
  departmentController
    .searchDeptAndUsers({
      keywords,
      projectId,
      includeDisabled: showDisabledDepartment,
    })
    .then(res => {
      dispatch({ type: 'SEARCH_SUCCESS', result: res });
      dispatch({ type: 'UPDATE_SEARCH_USERS', searchUsers: res.users || [] });
      dispatch({ type: 'UPDATE_IS_SEARCHING', isSearching: false });
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
