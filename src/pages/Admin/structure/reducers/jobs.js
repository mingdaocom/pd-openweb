import * as JOBS_ACTIONS from '../actions/jobs';
import { PAGE_SIZE } from '../constant';

const initialState = {
  user: [],///当前职位下的成员
  jobId: '',//当前的职位ID
  userIds: [],//选择的成员
  allCount: 0,//成员个数
  jobList: [],//职位列表
  isLoading: false,
  isUserLoading: false,
  pageIndex: 1,
  pageSize: PAGE_SIZE,
  isSelectAll: false,//是否全选
  jobName: '',
  currentJobId: ''
}

export default (state = initialState, action) => {
  const { jobList = [], currentJobId } = state
  const { jobId, response, type, userIds, pageIndex, isSelectAll } = action;
  if (type === 'PROJECT_ID_CHANGED') return initialState;
  // if (typeof JOBS_ACTIONS[type] === 'undefined') return state;
  switch (type) {
    case JOBS_ACTIONS.JOB_CURSOR:
      return {
        ...state,
        currentJobId: jobId,
        jobId,
        userIds: [],
      };
    case JOBS_ACTIONS.JOB_LIST_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case JOBS_ACTIONS.JOB_USER_REQUEST:
      if (currentJobId === jobId) {
        return {
          ...state,
          isUserLoading: true,
        };
      }
      return {
        ...state,
        userIds: [],
        isSelectAll: false,//是否全选
        isUserLoading: true,
        currentJobId: jobId,
        jobId,
      };
    case JOBS_ACTIONS.JOB_USER_SUCCESS:
      let list = jobList.find(it => it.jobId === jobId);
      return {
        ...state,
        // jobId,
        // currentJobId: jobId,
        allCount: response.allCount || 0,
        user: response.list || [],
        pageIndex,
        jobName: list ? list.jobName : '',
        isUserLoading: false,
      }
    case JOBS_ACTIONS.EMPTY_JOB_USERSELECT:
      return {
        ...state,
        userIds: [],
        isSelectAll: false,//是否全选
      }
    case JOBS_ACTIONS.JOB_LIST_SUCCESS:
      let resList = response.list || [];
      if (!jobId) {
        return {
          ...state,
          jobList: resList,//?
          jobId: resList.length > 0 ? resList[0].jobId : '',
          currentJobId: resList.length > 0 ? resList[0].jobId : '',
          jobName: resList.length > 0 ? resList[0].jobName : '',
          isLoading: false,
        }
      } else {
        // 有jobId ，编辑
        return {
          ...state,
          jobList: resList,
          jobId,
          currentJobId: jobId,
          jobName: resList.find(it => it.jobId === jobId).jobName,
          isLoading: false,
        }
      }
    case JOBS_ACTIONS.UPDATE_SELECT_JOB_USER:
      return {
        ...state,
        userIds,
        isSelectAll: false,//是否全选
      }
    case JOBS_ACTIONS.UPDATE_SELECT_ALL_JOBUSER:
      return {
        ...state,
        userIds: [],
        isSelectAll,
      }
    default:
      return state;
  }
};
