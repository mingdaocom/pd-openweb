import { PAGE_SIZE, COMPANY_DEPARMENTID } from '../constant';
import { CALL_API } from '../middleware/api';

export const JOB_CURSOR = 'JOB_CURSOR';

export const updateCursorJobId = (jobId) => ({
  type: JOB_CURSOR,
  jobId,
});

export const EMPTY_JOB_USERSELECT = 'EMPTY_JOB_USERSELECT';

export const emptyJobUserSet = () => ({
  type: EMPTY_JOB_USERSELECT,
});

export const JOB_USER_REQUEST = 'JOB_USER_REQUEST';
export const JOB_USER_SUCCESS = 'JOB_USER_SUCCESS';
export const JOB_USER_FAILURE = 'JOB_USER_FAILURE';
const fetchJobUsers = (
  projectId, jobId, pageIndex,
) => {
  const params = {
    pageIndex,
    jobId,
    projectId,
    pageSize: PAGE_SIZE,
    keywords: '',
  };
  return {
    projectId,
    jobId,
    pageIndex,
    [CALL_API]: {
      types: [JOB_USER_REQUEST, JOB_USER_SUCCESS, JOB_USER_FAILURE],
      params,
    },
  };
};
//根据职位获取成员
export const loadJobUsers = (projectId, jobId, pageIndex) => (dispatch) => {
  // TODO: check fields if necessary
  return dispatch(fetchJobUsers(projectId, jobId, pageIndex || 1));
};

export const JOB_LIST_REQUEST = 'JOB_LIST_REQUEST';
export const JOB_LIST_SUCCESS = 'JOB_LIST_SUCCESS';
export const JOB_LIST_FAILURE = 'JOB_LIST_FAILURE';
const fetchJobList = (
  projectId, jobId
) => {
  const params = {
    projectId,
    pageSize: 1000,
  };
  return {
    projectId,
    jobId,
    [CALL_API]: {
      types: [JOB_LIST_REQUEST, JOB_LIST_SUCCESS, JOB_LIST_FAILURE],
      params,
    },
  };
};

//获取职位列表
export const loadJobList = (projectId, jobId) => (dispatch) => {
  // TODO: check fields if necessary
  return dispatch(fetchJobList(projectId, jobId));
};

export const UPDATE_SELECT_JOB_USER = 'UPDATE_SELECT_JOB_USER';
//选择职位成员
export const updateSelectJobUser = (userIds) => ({
  type: UPDATE_SELECT_JOB_USER,
  userIds
});

export const UPDATE_SELECT_ALL_JOBUSER = 'UPDATE_SELECT_ALL_JOBUSER';
// 选择所有
export const updateAllSelectJobUser = (isSelectAll) => ({
  type: UPDATE_SELECT_ALL_JOBUSER,
  isSelectAll
});
