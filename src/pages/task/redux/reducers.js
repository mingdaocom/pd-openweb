import { combineReducers } from 'redux';
import config from '../config/config';
import * as taskGanttReducers from '../containers/taskGantt/redux/reducers';

const taskConfig = (state = config.defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_STATE_CONFIG':
      return Object.assign({}, state, action.taskConfig);
    case 'ATTACHMENT_SWITCH':
      return Object.assign({}, state, { attachmentViewType: action.attachmentViewType });
    case 'UPDATE_PROJECT_ID':
      return Object.assign({}, state, { projectId: action.projectId });
    case 'UPDATE_NETWORK':
      return Object.assign({}, state, { lastMyProjectId: action.lastMyProjectId });
    case 'UPDATE_TASK_STATUS':
      return Object.assign({}, state, { listStatus: action.listStatus });
    case 'UPDATE_FOLDER_RANGE':
      return Object.assign({}, state, {
        filterSettings: Object.assign({}, state.filterSettings, { folderSearchRange: action.folderSearchRange }),
      });
    case 'UPDATE_FOLDER_KEYWORDS':
      return Object.assign({}, state, { searchKeyWords: action.searchKeyWords });
    case 'UPDATE_COMPLETE_TIME':
      return Object.assign({}, state, { completeTime: action.completeTime });
    case 'UPDATE_LIST_SORT':
      return Object.assign({}, state, { listSort: action.listSort });
    case 'UPDATE_TASK_ASCRIPTION':
      return Object.assign({}, state, { taskFilter: action.taskFilter });
    case 'UPDATE_TASK_TAGS':
      return Object.assign({}, state, {
        filterSettings: Object.assign({}, state.filterSettings, { tags: action.tags }),
      });
    case 'UPDATE_CUSTOM_FILTER':
      return Object.assign({}, state, {
        filterSettings: Object.assign({}, state.filterSettings, { customFilter: action.customFilter }),
      });
    case 'UPDATE_CHARGE_IDS':
      return Object.assign({}, state, {
        filterSettings: Object.assign({}, state.filterSettings, { selectChargeIds: action.selectChargeIds }),
      });
    default:
      return state;
  }
};

const taskFirstSetStorage = (state = false, action) => {
  switch (action.type) {
    case 'SET_STORAGE_SUCCESS':
      return true;
    default:
      return state;
  }
};

const folderSettings = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_FOLDER_SETTINGS':
      return action.data;
    case 'UPDATE_FOLDER_NAME':
      return Object.assign({}, state, { folderName: action.folderName });
    case 'CLEAR_FOLDER_TIP':
      return Object.assign({}, state, { isNotice: false });
    case 'UPDATE_FOLDER_TOP':
      return Object.assign({}, state, { isTop: action.isTop });
    case 'UPDATE_FOLDER_MEMBER':
      return Object.assign({}, state, { folderNotice: action.folderNotice });
    case 'UPDATE_FOLDER_ARCHIVED':
      return Object.assign({}, state, { isArchived: action.isArchived });
    case 'CLEAR_FOLDER_SETTINGS':
      return {};
    default:
      return state;
  }
};

const myTaskDataSource = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_MY_TASK_DATA_SOURCE':
      return action.data;
    default:
      return state;
  }
};

const topFolderDataSource = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_TOP_FOLDER_LIST':
      return action.data;
    default:
      return state;
  }
};

const taskDetails = (state = {}, action) => {
  switch (action.type) {
    case 'GET_TASK_DETAIL':
    case 'EDIT_TASK_STATUS':
    case 'UPDATE_TASK_NAME':
    case 'UPDATE_TASK_CHARGE':
    case 'ADD_SUB_TASK':
    case 'DISCUSSIONS_ADD_MEMBERS':
    case 'UPDATE_TASK_NOTICE':
    case 'UPDATE_TASK_LOCKED':
    case 'REMOVE_TASK_MEMBER':
    case 'UPDATE_TASK_FOLDER_ID':
    case 'UPDATE_TASK_MEMBER_STAR':
    case 'AGREE_APPLY_JOIN_TASK':
    case 'REFUSE_JOIN_TASK':
    case 'ADD_TASK_MEMBER':
    case 'ADD_TASK_TAG':
    case 'REMOVE_TASK_TAG':
    case 'ADD_TASK_ATTACHMENTS':
    case 'DELETE_ATTACHMENT_DATA':
    case 'UPDATE_TASK_STAGE_ID':
    case 'UPDATE_TASK_TIMES':
    case 'UPDATE_TASK_ACTUAL_START_TIME':
    case 'UPDATE_TASK_COMPLETED_TIME':
    case 'UPDATE_TASK_SUMMARY':
      return Object.assign({}, state, { [action.taskId]: action.data });
    case 'DESTROY_TASK':
      delete state[action.taskId];
      return state;
    default:
      return state;
  }
};

const taskControls = (state = {}, action) => {
  switch (action.type) {
    case 'GET_TASK_CONTROLS':
    case 'UPDATE_TASK_CONTROLS':
    case 'UPDATE_TASK_CONTROLS_VALUE':
      return Object.assign({}, state, { [action.taskId]: action.data });
    default:
      return state;
  }
};

const taskChecklists = (state = {}, action) => {
  switch (action.type) {
    case 'GET_CHECK_LIST':
    case 'UPDATE_CHECKLIST_INDEX':
    case 'UPDATE_CHECKLIST_ITEM_INDEX':
    case 'UPDATE_CHECKLIST_NAME':
    case 'REMOVE_CHECKLIST':
    case 'ADD_CHECKLIST_ITEM':
    case 'UPDATE_ITEM_NAME':
    case 'REMOVE_ITEM':
    case 'UPDATE_ITEM_STATUS':
      return Object.assign({}, state, { [action.taskId]: action.data });
    case 'ADD_CHECKLIST':
      return Object.assign({}, state, { [action.taskId]: state[action.taskId].concat([action.data]) });
    default:
      return state;
  }
};

const taskDiscussions = (state = {}, action) => {
  switch (action.type) {
    case 'TASK_DISCUSSIONS':
    case 'UPDATE_TASK_DISCUSSIONS':
      return Object.assign({}, state, { [action.taskId]: action.data });
    case 'ADD_TASK_DISCUSSIONS':
      return Object.assign({}, state, { [action.taskId]: [action.data].concat(state[action.taskId]) });
    default:
      return state;
  }
};

const taskFoldStatus = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_TASK_FOLD_STATUS':
      return Object.assign({}, state, { [action.taskId]: action.data });
    default:
      return state;
  }
};

const searchTaskCount = (state = 0, action) => {
  switch (action.type) {
    case 'UPDATE_SEARCH_TASK_COUNT':
      return action.searchTaskCount;
    default:
      return state;
  }
};

export default combineReducers({
  taskConfig,
  taskFirstSetStorage,
  folderSettings,
  myTaskDataSource,
  topFolderDataSource,
  taskDetails,
  taskChecklists,
  taskDiscussions,
  taskControls,
  taskFoldStatus,
  ...taskGanttReducers,
  searchTaskCount,
});
