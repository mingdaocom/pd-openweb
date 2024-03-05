import _ from 'lodash';
import jobAjax from 'src/api/job';

const PAGE_SIZE = 50;
export const updateProjectId = projectId => dispatch => {
  dispatch({ type: 'CHANGE_PROJECT_ID', projectId });
};
export const getPositionList = () => (dispatch, getState) => {
  const { positionPageInfo = {}, projectId, positionList = [], searchValue } = getState().orgManagePage.position;
  const { pageIndex } = positionPageInfo;
  let extra = searchValue ? { keywords: searchValue } : { pageIndex: pageIndex || 1, pageSize: PAGE_SIZE };
  jobAjax.getJobs({
    projectId,
    ...extra,
  }).then(res => {
    let currentPosition = (res.list && !_.isEmpty(res.list) && res.list[0]) || {};
    let copyPositionPageInfo = { ...positionPageInfo };
    let list = pageIndex > 1 ? positionList.concat(res.list) : res.list;
    copyPositionPageInfo.isMore = res.list && res.list.length >= PAGE_SIZE;
    dispatch(updatePositionPageInfo({ ...positionPageInfo, isMore: res.list && res.list.length >= PAGE_SIZE }));
    dispatch(updatePositionList(list));
    dispatch({
      type: 'UPDATE_IS_LOADING',
      isLoading: false,
    });
    if (pageIndex === 1 || searchValue) {
      dispatch(updateCurrentPosition(currentPosition));
      dispatch(getUserList({ jobId: currentPosition.jobId }));
    }
  });
};
export const updateIsLoading = loading => dispatch => {
  dispatch({
    type: 'UPDATE_IS_LOADING',
    isLoading: loading,
  });
};
export const updatePositionList = list => dispatch => {
  dispatch({
    type: 'UPDATE_POSITION_LIST',
    positionList: list || [],
  });
};
export const updatePositionPageInfo = data => dispatch => {
  dispatch({ type: 'UPDATE_POSITION_PAGE_INFO', data });
};
export const updateCurrentPosition = currentPosition => dispatch => {
  dispatch({ type: 'UPDATE_CURRENT_POSITION', currentPosition });
};
export const updateSearchValue = searchValue => dispatch => {
  dispatch({ type: 'UPDATE_SEARCH_VALUE', searchValue });
};
export const updateUserPageIndex = userPageIndex => dispatch => {
  dispatch({ type: 'UPDATE_USER_PAGE_INDEX', userPageIndex });
};
export const getUserList = params => (dispatch, getState) => {
  const { jobId = '' } = params;
  const { projectId, userPageIndex } = getState().orgManagePage.position;
  dispatch({ type: 'UPDATE_USER_LOADING', userLoading: true });
  jobAjax.pagedJobAccounts({
    jobId,
    pageIndex: userPageIndex || 1,
    pageSize: PAGE_SIZE,
    projectId,
  }).then(res => {
    const { list = [], allCount } = res;
    dispatch({ type: 'UPDATE_USER_LIST', userList: list });
    dispatch({ type: 'UPDATE_USER_LOADING', userLoading: false });
    dispatch({ type: 'UPDATE_USER_COUNT', allUserCount: allCount });
  });
};
export const updateUserloading = userLoading => dispatch => {
  dispatch({ type: 'UPDATE_USER_LOADING', userLoading });
};
export const updateSelectUserIds = selectUserIds => dispatch => {
  dispatch({ type: 'UPDATE_SELECT_USER_IDS', selectUserIds });
};
export const updateIsImportRole = data => dispatch => {
  dispatch({ type: 'UPDATE_IS_IMPORT_ROLE', data });
};
