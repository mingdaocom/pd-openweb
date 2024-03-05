import config from '../config/stateConfig';

// config状态
export const stateConfig = (state = config, action) => {
  switch (action.type) {
    case 'CHANGE_TASK_STATUS':
      state.currentStatus = action.status;
      return Object.assign({}, state);
    case 'CHANGE_VIEW':
      state.currentView = action.viewType;
      return Object.assign({}, state);
    case 'CHANGE_FILTER_WEEKEND':
      state.filterWeekend = action.filter;
      return Object.assign({}, state);
    case 'CHANGE_SUB_TASK_LEVEL':
      state.currentLevel = action.level;
      return Object.assign({}, state);
    case 'GANTT_DRAG_RECORD_ID':
      state.dragTaskId = action.taskId;
      return Object.assign({}, state);
    case 'GANTT_DRAG_RECORD_INDEX':
      state.dragHoverIndex = action.index;
      return Object.assign({}, state);
    default:
      return state;
  }
};

// 处理data数据
export const accountTasksKV = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_DATA_SOURCE':
      return action.data;
    case 'ADD_MEMBERS':
      return action.accountTasksKV;
    default:
      return state;
  }
};

// 时间轴数据
export const timeAxisSource = (state = [], action) => {
  switch (action.type) {
    case 'GET_TIME_AXIS_SOURCE':
      return action.timeAxis;
    default:
      return state;
  }
};
