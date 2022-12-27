import utils from '../utils/utils';
import config from '../config/config';
import _ from 'lodash';

// 改变当前任务状态
export const changeTaskStatus = (status) => {
  return {
    type: 'CHANGE_TASK_STATUS',
    status,
  };
};

// 改变当前视图
export const changeView = (viewType) => {
  return {
    type: 'CHANGE_VIEW',
    viewType,
  };
};

// 是否过滤周末不显示
export const changeFilterWeekend = (filter) => {
  return {
    type: 'CHANGE_FILTER_WEEKEND',
    filter,
  };
};

// 切换显示子任务的层级
export const changeSubTaskLevel = (level) => {
  return {
    type: 'CHANGE_SUB_TASK_LEVEL',
    level,
  };
};

// 处理呈现数据
export const updateDataSource = source => (dispatch, getState) => {
  const { accountTasksKV, stateConfig } = getState().task;

  source = _.cloneDeep(source || accountTasksKV);
  const data = utils.updateTasksDataSource(source, stateConfig.currentStatus, stateConfig.currentView, stateConfig.filterWeekend, stateConfig.currentLevel);

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data,
  });
};

// 添加负责人
export const addMembers = data => (dispatch, getState) => {
  let { accountTasksKV } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  data.reverse().forEach((user) => {
    accountTasksKV.unshift({
      account: {
        accountId: user.accountId,
        fullname: user.fullname,
        avatar: user.avatar,
      },
      taskTimeBars: [],
      tasks: [],
    });
  });

  dispatch({
    type: 'ADD_MEMBERS',
    accountTasksKV,
  });
};

// 处理时间轴数据
export const getTimeAxisSource = () => (dispatch, getState) => {
  const { stateConfig } = getState().task;
  const timeAxis = utils.getTimeAxisSource(stateConfig.currentView, stateConfig.filterWeekend);

  dispatch({
    type: 'GET_TIME_AXIS_SOURCE',
    timeAxis,
  });
};

// 显示或隐藏任务
export const showOrHideTask = (index, id, arrowStatus) => (dispatch, getState) => {
  let { accountTasksKV, stateConfig } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  accountTasksKV[index].tasks.forEach((item) => {
    if (item.taskId === id) {
      item.arrowStatus = arrowStatus;
    }

    // 子项全部打开或关闭
    if (_.includes(item.ancestorIds, id)) {
      item.isShow = config.ARROW_STATUS.OPEN === arrowStatus;
      if (item.arrowStatus !== config.ARROW_STATUS.NULL) {
        item.arrowStatus = arrowStatus;
      }
    }
  });

  accountTasksKV[index] = utils.taskTimeBars([accountTasksKV[index]], stateConfig.currentView, stateConfig.filterWeekend)[0];

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 开始拖拽
export const ganttDragRecordId = (taskId) => {
  return {
    type: 'GANTT_DRAG_RECORD_ID',
    taskId,
  };
};

// 记录经过的人员下标
export const ganttDragRecordIndex = (index) => {
  return {
    type: 'GANTT_DRAG_RECORD_INDEX',
    index,
  };
};

// 拖拽单侧调整视图呈现
export const updateStartTimeAndEndTime = (id, index, time, type, isReset) => (dispatch, getState) => {
  let { accountTasksKV, stateConfig } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  accountTasksKV[index].tasks.forEach((item, i) => {
    if (item.taskId === id) {
      // 拖左侧
      if (type === config.DRAG_DIRECTION.LEFT) {
        // 只有结束时间
        if (item.singleTime === config.SINGLE_TIME.END) {
          item.singleTime = '';
        }
        item.showStartTime = time;
      } else {
        // 只有开始时间
        if (item.singleTime === config.SINGLE_TIME.START) {
          item.singleTime = '';
        }
        item.showEndTime = time;
      }
      // 重置时间类型
      if (isReset) {
        item.singleTime = config.recordSingleTime;
        // 清除单侧id
        config.singleDragTaskId = '';
      } else {
        config.dragItem = item;
      }
      // 重新计算时长
      item.showHourLong = utils.getValidHours(item.showStartTime, item.showEndTime, stateConfig.filterWeekend);
    }
  });

  accountTasksKV[index].taskTimeBars.forEach((timeBars, i) =>
    timeBars.forEach((item) => {
      // 记录当前项的下标
      if (item.taskId === id) {
        config.DARG_INDEX = i;
      }
    })
  );

  accountTasksKV[index] = utils.taskTimeBars([accountTasksKV[index]], stateConfig.currentView, stateConfig.filterWeekend)[0];

  // 重置
  config.dragItem = '';
  config.DARG_INDEX = 0;

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 更新项目socket推送过来的数据
export const updateFolderSocketSource = source => (dispatch, getState) => {
  let { accountTasksKV, stateConfig } = getState().task;
  const oldTaskKV = _.cloneDeep(accountTasksKV);
  accountTasksKV = _.cloneDeep(accountTasksKV);

  // 项目已删除
  if (source.data.length === 1 && source.data[0].eventType === 'D_folder') {
    $('.taskType .myTask').click();
    alert('项目已删除', 3);

    return false;
  }

  source.data.forEach((item) => {
    // 任务删除
    if (item.eventType === 'D_task') {
      accountTasksKV.forEach((data) => {
        if (data.account.accountId === item.charge.accountId) {
          _.remove(data.tasks, task => task.taskId === item.taskId);
        }
      });
    } else if (item.eventType === 'A_task') {
      // 任务新增
      let isInsertSuccess = false;
      accountTasksKV.forEach((data) => {
        if (data.account.accountId === item.charge.accountId) {
          data.tasks.push(item);
          isInsertSuccess = true;
        }
      });

      // 当前用户不存在
      if (!isInsertSuccess) {
        accountTasksKV.unshift({
          account: {
            accountId: item.charge.accountId,
            fullname: item.charge.fullname,
            avatar: item.charge.avatar,
          },
          taskTimeBars: [],
          tasks: [item],
        });
      }
    } else {
      accountTasksKV.forEach(data =>
        data.tasks.forEach((task) => {
          if (task.taskId === item.taskId) {
            // 更新任务名称
            if (item.eventType === 'U_name') {
              task.taskName = item.taskName;
            }

            // 更新任务时间
            if (item.eventType === 'U_time' || item.eventType === 'U_parent') {
              task.startTime = item.startTime;
              task.deadline = item.deadline;
            }

            // 更新任务状态
            if (item.eventType === 'U_status') {
              task.status = item.status;
              task.completeTime = item.completeTime;
            }

            // 更新任务母任务
            if (item.eventType === 'U_parent') {
              task.ancestorIds = item.ancestorIds;
              task.parentId = item.parentId;
            }

            // 更新任务的子任务列表
            if (item.eventType === 'U_subTaskIds') {
              task.subTaskIds = item.subTaskIds;
            }

            // 移除子任务
            if (item.eventType === 'Pull_subTaskIds') {
              item.subTaskIds.forEach((id) => {
                _.remove(task.subTaskIds, taskId => taskId === id);
              });
            }

            // 新增子任务
            if (item.eventType === 'Push_subTaskIds') {
              item.subTaskIds.forEach((id) => {
                if (!_.includes(task.subTaskIds, id)) {
                  task.subTaskIds.push(id);
                }
              });
            }
          }
        })
      );
    }
  });

  // 和原始数据比较哪些变更过
  accountTasksKV.forEach((item, i) => {
    if (!_.isEqual(item, oldTaskKV[i])) {
      item = utils.updateTasksDataSource([item], stateConfig.currentStatus, stateConfig.currentView, stateConfig.filterWeekend, stateConfig.currentLevel)[0];
    }
  });

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 更新下属socket推送过来的数据
export const updateSubordinateSocketSource = source => (dispatch, getState) => {
  let { accountTasksKV, stateConfig } = getState().task;
  const oldTaskKV = _.cloneDeep(accountTasksKV);
  const currentAccountId = source.id.split('|')[2];
  accountTasksKV = _.cloneDeep(accountTasksKV);

  source.data.forEach((item) => {
    // 任务删除
    if (item.eventType === 'D_task') {
      accountTasksKV.forEach((data) => {
        if (data.account.accountId === currentAccountId) {
          _.remove(data.tasks, task => task.taskId === item.taskId);
        }
      });
    } else if (item.eventType === 'A_task') {
      // 任务新增
      accountTasksKV.forEach((data) => {
        if (data.account.accountId === currentAccountId && !data.account.hidden) {
          data.tasks.push(item);
        }
      });
    } else {
      accountTasksKV.forEach((data) => {
        if (data.account.accountId === currentAccountId) {
          data.tasks.forEach((task) => {
            if (task.taskId === item.taskId) {
              // 更新任务名称
              if (item.eventType === 'U_name') {
                task.taskName = item.taskName;
              }

              // 更新任务时间
              if (item.eventType === 'U_time' || item.eventType === 'U_parent') {
                task.startTime = item.startTime;
                task.deadline = item.deadline;
              }

              // 更新任务状态
              if (item.eventType === 'U_status') {
                task.status = item.status;
                task.completeTime = item.completeTime;
              }

              // 更新任务母任务
              if (item.eventType === 'U_parent') {
                task.ancestorIds = item.ancestorIds;
                task.parentId = item.parentId;
              }

              // 更新任务的子任务列表
              if (item.eventType === 'U_subTaskIds') {
                task.subTaskIds = item.subTaskIds;
              }

              // 移除子任务
              if (item.eventType === 'Pull_subTaskIds') {
                item.subTaskIds.forEach((id) => {
                  _.remove(task.subTaskIds, taskId => taskId === id);
                });
              }

              // 新增子任务
              if (item.eventType === 'Push_subTaskIds') {
                item.subTaskIds.forEach((id) => {
                  if (!_.includes(task.subTaskIds, id)) {
                    task.subTaskIds.push(id);
                  }
                });
              }
            }
          });
        }
      });
    }
  });

  // 和原始数据比较哪些变更过
  accountTasksKV.forEach((item, i) => {
    if (!_.isEqual(item, oldTaskKV[i])) {
      item = utils.updateTasksDataSource([item], stateConfig.currentStatus, stateConfig.currentView, stateConfig.filterWeekend, stateConfig.currentLevel)[0];
    }
  });

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 添加关注的同事
export const addFollowMembers = data => (dispatch, getState) => {
  let { accountTasksKV } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  data.forEach((user) => {
    accountTasksKV.push({
      account: {
        accountId: user.accountId,
        fullname: user.fullname,
        avatar: user.avatar,
        hidden: false,
        type: 4,
      },
      taskTimeBars: [],
      tasks: [],
    });
  });

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 移除关注的同事
export const removeFollowMembers = accountId => (dispatch, getState) => {
  let { accountTasksKV } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  _.remove(accountTasksKV, item => item.account.accountId === accountId);

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 修改用户配置展开缩起状态
export const updateUserStatus = (accountId, hidden) => (dispatch, getState) => {
  let { accountTasksKV } = getState().task;
  accountTasksKV = _.cloneDeep(accountTasksKV);

  accountTasksKV.forEach((item) => {
    if (item.account.accountId === accountId) {
      item.account.hidden = hidden;
      item.taskTimeBars = [];
      item.tasks = [];
    }
  });

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};

// 获取更多用户数据
export const moreSubordinateTasks = data => (dispatch, getState) => {
  let { accountTasksKV, stateConfig } = getState().task;
  const oldTaskKV = _.cloneDeep(accountTasksKV);
  accountTasksKV = _.cloneDeep(accountTasksKV);

  accountTasksKV.forEach((tasksKV) => {
    data.forEach((item) => {
      if (tasksKV.account.accountId === item.account.accountId) {
        item.tasks.forEach((task) => {
          if (!_.find(tasksKV.tasks, { taskId: task.taskId })) {
            tasksKV.tasks.push(task);
          }
        });
      }
    });
  });

  // 和原始数据比较哪些变更过
  accountTasksKV.forEach((item, i) => {
    if (!_.isEqual(item, oldTaskKV[i])) {
      item = utils.updateTasksDataSource([item], stateConfig.currentStatus, stateConfig.currentView, stateConfig.filterWeekend, stateConfig.currentLevel)[0];
    }
  });

  dispatch({
    type: 'UPDATE_DATA_SOURCE',
    data: accountTasksKV,
  });
};
