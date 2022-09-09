import { getOrganizes, pagedOrganizeAccounts } from 'src/api/organize.js';

const PAGE_SIZE = 50;
let ajaxRequest = null;
export const updateProjectId = projectId => dispatch => {
  dispatch({ type: 'CHANGE_PROJECT_ID', projectId });
};
export const getRoleList = () => (dispatch, getState) => {
  const {
    rolePageInfo = {},
    projectId,
    roleList = [],
    searchValue,
    isRequestUserList,
  } = getState().orgManagePage.roleManage;
  const { pageIndex } = rolePageInfo;
  if (ajaxRequest && ajaxRequest.state() === 'pending' && ajaxRequest.abort) {
    ajaxRequest.abort();
  }
  ajaxRequest = getOrganizes({
    pageIndex: pageIndex || 1,
    pageSize: PAGE_SIZE,
    projectId,
    keywords: searchValue,
  });
  ajaxRequest.then(res => {
    let currentRole = (res.list && !_.isEmpty(res.list) && res.list[0]) || {};
    let copyRolePageInfo = { ...rolePageInfo };
    let list = pageIndex > 1 ? roleList.concat(res.list) : res.list;
    copyRolePageInfo.isMore = res.list && res.list.length >= PAGE_SIZE;
    dispatch(updateRolePageInfo({ ...rolePageInfo, isMore: res.list && res.list.length >= PAGE_SIZE }));
    dispatch({
      type: 'UPDATE_ROLE_LIST_DATA',
      roleList: list || [],
    });
    dispatch({
      type: 'UPDATE_IS_LOADING',
      isLoading: false,
    });
    if (pageIndex === 1) {
      dispatch(updateCurrentRole(currentRole));
      !searchValue &&
        isRequestUserList &&
        !_.isEmpty(currentRole) &&
        dispatch(getUserList({ roleId: currentRole.organizeId }));
    }
  });
};
export const updateRolePageInfo = data => dispatch => {
  dispatch({ type: 'UPDATE_ROLE_PAGE_INFO', data });
};
export const updateCurrentRole = currentRole => dispatch => {
  dispatch({ type: 'UPDATE_CURRENT_ROLE', currentRole });
};
export const updateSearchValue = searchValue => dispatch => {
  dispatch({ type: 'UPDATE_SEARCH_VALUE', searchValue });
  dispatch({ type: 'UPDATE_ROLE_PAGE_INFO', data: { pageIndex: 1, isMore: false } });
};
export const updateUserPageIndex = userPageIndex => dispatch => {
  dispatch({ type: 'UPDATE_USER_PAGE_INDEX', userPageIndex });
};
export const getUserList = params => (dispatch, getState) => {
  const { roleId } = params || {};
  const { projectId, userPageIndex, currentRole } = getState().orgManagePage.roleManage;
  dispatch({ type: 'UPDATE_USER_LOADING', userLoading: true });
  pagedOrganizeAccounts({
    organizeId: roleId || '',
    pageIndex: userPageIndex || 1,
    pageSize: PAGE_SIZE,
    keywords: '',
    projectId,
  }).then(res => {
    const { list = [], allCount } = res;
    dispatch({ type: 'UPDATE_USER_LIST', userList: list });
    dispatch({ type: 'UPDATE_USER_LOADING', userLoading: false });
    dispatch({ type: 'UPDATE_USER_COUNT', allUserCount: allCount });
  });
};
export const updateUserLoading = userLoading => dispatch => {
  dispatch({ type: 'UPDATE_USER_LOADING', userLoading });
};
export const updateSelectUserIds = selectUserIds => dispatch => {
  dispatch({ type: 'UPDATE_SELECT_USER_IDS', selectUserIds });
};
export const updateIsImportRole = data => dispatch => {
  dispatch({ type: 'UPDATE_IS_IMPORT_ROLE', data });
};
export const updateIsRequestList = data => dispatch => {
  dispatch({ type: 'UPDATE_IS_REQUEST_LIST', data });
};
