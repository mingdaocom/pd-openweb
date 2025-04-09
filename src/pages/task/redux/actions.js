import config from '../config/config';
import ajaxRequest from 'src/api/taskCenter';
import tagController from 'src/api/tag';
import { errorMessage } from '../utils/utils';
import {
  updateTimeError,
  updateTimeErrorDialog,
  updateTaskErrorDialog,
} from '../components/updateTimeError/updateTimeError';
import { emitter } from 'src/util';
import updateStageViewControlsSource from '../utils/updateStage';
import _ from 'lodash';

export const addTask = data => (dispatch, getState) => {
  const { taskConfig } = getState().task;

  // 任务列表
  if (!taskConfig.folderId) {
    dispatch({
      type: 'CREATE_TASK_TO_LIST',
      data,
    });
    emitter.emit('CREATE_TASK_TO_LIST', {
      type: 'CREATE_TASK_TO_LIST',
      data,
    });
  }

  // 项目列表
  if (taskConfig.folderId && taskConfig.viewType === 1) {
    dispatch({
      type: 'CREATE_TASK_TO_TREE',
      data,
    });
    emitter.emit('CREATE_TASK_TO_TREE', {
      type: 'CREATE_TASK_TO_TREE',
      data,
    });
  }

  // 项目看板
  if (taskConfig.folderId && taskConfig.viewType === 2) {
    dispatch({
      type: 'CREATE_TASK_TO_STAGE',
      data,
    });
    emitter.emit('CREATE_TASK_TO_STAGE', {
      type: 'CREATE_TASK_TO_STAGE',
      data,
    });
  }
};

export const updateStateConfig = taskConfig => {
  return {
    type: 'UPDATE_STATE_CONFIG',
    taskConfig,
  };
};

// 切换网络
export const updateNetwork = lastMyProjectId => {
  return {
    type: 'UPDATE_NETWORK',
    lastMyProjectId,
  };
};

// 切换任务状态
export const updateTaskStatus = (listStatus, listSort) => (dispatch, getState) => {
  dispatch({
    type: 'UPDATE_LIST_SORT',
    listSort,
  });
  dispatch({
    type: 'UPDATE_TASK_STATUS',
    listStatus,
  });
};

// 切换项目下的搜索范围
export const updateFolderRange = folderSearchRange => {
  return {
    type: 'UPDATE_FOLDER_RANGE',
    folderSearchRange,
  };
};

// 更新项目的筛选内容
export const updateKeyWords = searchKeyWords => {
  return {
    type: 'UPDATE_FOLDER_KEYWORDS',
    searchKeyWords,
  };
};

// 更新完成时间
export const updateCompleteTime = completeTime => {
  return {
    type: 'UPDATE_COMPLETE_TIME',
    completeTime,
  };
};

// 更新排序
export const updateListSort = listSort => {
  return {
    type: 'UPDATE_LIST_SORT',
    listSort,
  };
};

// 更新任务归属
export const updateTaskAscription = taskFilter => {
  return {
    type: 'UPDATE_TASK_ASCRIPTION',
    taskFilter,
  };
};

// 更新标签
export const updateTaskTags = tags => {
  return {
    type: 'UPDATE_TASK_TAGS',
    tags,
  };
};

// 更新自定义字段
export const updateCustomFilter = customFilter => {
  return {
    type: 'UPDATE_CUSTOM_FILTER',
    customFilter,
  };
};

// 更新负责人
export const updateChargeIds = selectChargeIds => {
  return {
    type: 'UPDATE_CHARGE_IDS',
    selectChargeIds,
  };
};

export const taskFirstSetStorage = () => {
  return {
    type: 'SET_STORAGE_SUCCESS',
  };
};

export const attachmentSwitch = attachmentViewType => {
  return {
    type: 'ATTACHMENT_SWITCH',
    attachmentViewType,
  };
};

// 获取项目信息
export const getFolderSettings = folderId => (dispatch, getState) => {
  ajaxRequest.getFolderSettingsForCurrentUser({ folderID: folderId }).then(result => {
    if (result.status) {
      dispatch({
        type: 'UPDATE_PROJECT_ID',
        projectId: result.data.projectID,
      });
    }

    dispatch({
      type: 'UPDATE_FOLDER_SETTINGS',
      data: result.status ? result.data : result.error,
    });
  });
};

// 清除项目信息
export const clearFolderSettings = () => {
  return {
    type: 'CLEAR_FOLDER_SETTINGS',
  };
};

// 更新项目名称
export const updateFolderName =
  (folderId, folderName, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateFolderName({ folderID: folderId, folderName }).then(result => {
      if (result.status) {
        dispatch({
          type: 'UPDATE_FOLDER_NAME',
          folderName,
        });
        callback();
      } else {
        errorMessage(result.error);
      }
    });
  };

// 清除项目小红点
export const clearFolderTip = () => {
  return {
    type: 'CLEAR_FOLDER_TIP',
  };
};

// 修改置顶
export const updateFolderTopState = isTop => {
  return {
    type: 'UPDATE_FOLDER_TOP',
    isTop,
  };
};

// 修改项目提醒
export const updateFolderNotice = (folderID, unNotice) => (dispatch, getState) => {
  ajaxRequest
    .updateFolderMemberNotice({
      folderId: folderID,
      unNotice,
    })
    .then(source => {
      if (source.status) {
        dispatch({
          type: 'UPDATE_FOLDER_MEMBER',
          folderNotice: unNotice,
        });
      } else {
        errorMessage(result.error);
      }
    });
};

// 归档
export const updateFolderArchivedState = isArchived => {
  return {
    type: 'UPDATE_FOLDER_ARCHIVED',
    isArchived,
  };
};

// 缓存我的任务数据
export const updateMyTaskDataSource = data => {
  return {
    type: 'UPDATE_MY_TASK_DATA_SOURCE',
    data,
  };
};

// 缓存置顶项目数据
export const updateTopFolderList = data => {
  return {
    type: 'UPDATE_TOP_FOLDER_LIST',
    data,
  };
};

// 获取任务详情
export const getTaskDetail =
  (taskId, callback = () => {}, addPostSuccessCount = () => {}) =>
  (dispatch, getState) => {
    const { taskConfig } = getState().task;
    const listSort = taskConfig.listSort || 10;

    ajaxRequest.getTaskDetail({ taskID: taskId, sort: listSort, isDecode: true }).then(result => {
      dispatch({
        type: 'GET_TASK_DETAIL',
        taskId,
        data: _.cloneDeep(result),
      });

      addPostSuccessCount();
      if (result.status && result.data.taskID && result.data.auth !== config.auth.None) {
        getCheckListsWithItemsInTask(taskId, addPostSuccessCount)(dispatch);
        if (result.data.hasControls) {
          getTaskControls(taskId, addPostSuccessCount)(dispatch);
        } else {
          addPostSuccessCount();
        }
      }

      callback();
    });
  };

// 修改任务提醒
export const updateTaskNotice = (taskId, notice) => (dispatch, getState) => {
  ajaxRequest.updateTaskMemberNotice({ notice, taskID: taskId }).then(result => {
    if (result.status) {
      const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
      taskDetail.data.notice = notice;

      dispatch({
        type: 'UPDATE_TASK_NOTICE',
        taskId,
        data: taskDetail,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 修改任务锁定状态
export const updateTaskLocked =
  (taskId, locked, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskLocked({ locked, taskID: taskId }).then(result => {
      if (result.status) {
        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
        taskDetail.data.locked = locked;

        dispatch({
          type: 'UPDATE_TASK_LOCKED',
          taskId,
          data: taskDetail,
        });

        callback();
      } else {
        errorMessage(result.error);
      }
    });
  };

// 销毁任务数据
export const destroyTask = taskId => {
  return {
    type: 'DESTROY_TASK',
    taskId,
  };
};

// 更改任务状态
export const editTaskStatus =
  (taskId, status, isSubTask, subTaskId, callback = () => {}) =>
  (dispatch, getState) => {
    const updateTaskStatus = (code = 0) => {
      ajaxRequest.updateTaskStatus({ taskID: subTaskId || taskId, status, isSubTask, code }).then(result => {
        if (result.status) {
          callback(result.data, isSubTask);

          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

          if (!taskDetail) {
            return;
          }

          taskDetail.data.subTask.forEach(item => {
            result.data.tasks.forEach(task => {
              if (item.taskID === task.taskId) {
                item.startTime = task.startTime;
                item.deadline = task.deadline;
                item.actualStartTime = task.actualStartTime;
                item.completeTime = task.completedTime;
                item.status = task.status;
              }
            });
          });

          if (!subTaskId) {
            const taskObj = _.find(result.data.tasks, item => item.taskId === taskId);

            taskDetail.data.startTime = taskObj.startTime;
            taskDetail.data.deadline = taskObj.deadline;
            taskDetail.data.actualStartTime = taskObj.actualStartTime;
            taskDetail.data.completeTime = taskObj.completedTime;
            taskDetail.data.status = taskObj.status;
          }

          dispatch({
            type: 'EDIT_TASK_STATUS',
            taskId,
            data: taskDetail,
          });
        } else if (result.error.code === 1000) {
          updateTaskErrorDialog(() => updateTaskStatus(result.error.code));
        } else {
          errorMessage(result.error);
        }
      });
    };

    updateTaskStatus();
  };

// 更改项目
export const updateTaskFolderId =
  (taskId, folderId, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskFolderID({ taskID: taskId, folderID: folderId }).then(result => {
      if (result.status) {
        alert(_l('修改成功'));

        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

        taskDetail.data.auth = result.data.auth;
        taskDetail.data.folderCanLook = result.data.folderCanLook;
        taskDetail.data.isFolderMember = result.data.isFolderMember;
        taskDetail.data.ancestors = [];

        taskDetail.data.folderID = result.data.folderID;
        taskDetail.data.folderName = result.data.folderName;

        taskDetail.data.stageID = result.data.stageID;
        taskDetail.data.stageName = result.data.stageName;
        taskDetail.data.stages = result.data.stages;

        dispatch({
          type: 'UPDATE_TASK_FOLDER_ID',
          taskId,
          data: taskDetail,
        });

        dispatch({
          type: 'UPDATE_TASK_CONTROLS',
          taskId,
          data: result.data.controls,
        });

        callback();
      } else {
        errorMessage(result.error);
      }
    });
  };

// 更改母任务
export const updateTaskParentId =
  (taskId, parentId, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskParentID({ taskID: taskId, parentID: parentId }).then(result => {
      if (result.status) {
        alert(_l('修改成功'));

        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

        taskDetail.data.auth = result.data.auth;
        taskDetail.data.folderCanLook = result.data.folderCanLook;
        taskDetail.data.isFolderMember = result.data.isFolderMember;
        taskDetail.data.ancestors = result.data.ancestors;
        taskDetail.data.parentID = result.data.parentID || '';

        taskDetail.data.folderID = result.data.folderID || '';
        taskDetail.data.folderName = result.data.folderName || '';

        taskDetail.data.stageID = result.data.stageID || '';
        taskDetail.data.stageName = result.data.stageName || '';
        taskDetail.data.stages = result.data.stages || [];

        dispatch({
          type: 'UPDATE_TASK_FOLDER_ID',
          taskId,
          data: taskDetail,
        });

        dispatch({
          type: 'UPDATE_TASK_CONTROLS',
          taskId,
          data: result.data.controls,
        });

        callback(taskDetail.data);
      } else {
        errorMessage(result.error);
      }
    });
  };

// 更改阶段
export const updateTaskStageId =
  (taskId, stageId, stageName, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskStageID({ taskID: taskId, stageID: stageId }).then(result => {
      if (result.status) {
        alert(_l('修改成功'));

        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
        const oldCharge = _.cloneDeep(taskDetail.data.charge);

        taskDetail.data.stageID = stageId;
        taskDetail.data.stageName = stageName;

        // 新负责人
        if (result.data.accountID) {
          taskDetail.data.charge.accountID = result.data.accountID;
          taskDetail.data.charge.avatar = result.data.avatar;
          taskDetail.data.charge.fullName = result.data.fullName;

          // 老负责人加入到成员中
          if (oldCharge.accountID && oldCharge.accountID !== 'user-undefined') {
            taskDetail.data.member = taskDetail.data.member.concat([{ type: 0, status: 0, account: oldCharge }]);
          }

          // 成员中删除新负责人
          _.remove(taskDetail.data.member, item => item.account.accountID === result.data.accountID);
        }

        dispatch({
          type: 'UPDATE_TASK_STAGE_ID',
          taskId,
          data: taskDetail,
        });

        callback(result.data);
      } else {
        errorMessage(result.error);
      }
    });
  };

// 删除任务成员
export const removeTaskMember = (taskId, accountId) => (dispatch, getState) => {
  const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

  _.remove(taskDetail.data.member, item => item.account.accountID === accountId);

  dispatch({
    type: 'REMOVE_TASK_MEMBER',
    taskId,
    data: taskDetail,
  });
};

// 更改任务名称
export const updateTaskName =
  (taskId, taskName, subTaskId, callback = () => {}) =>
  (dispatch, getState) => {
    _.debounce(() => {
      ajaxRequest.updateTaskName({ taskID: subTaskId || taskId, name: taskName }).then(result => {
        if (result.status) {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

          // 子任务
          if (subTaskId) {
            taskDetail.data.subTask.forEach(item => {
              if (item.taskID === subTaskId) {
                item.taskName = taskName;
              }
            });
          } else {
            taskDetail.data.taskName = taskName;
          }

          dispatch({
            type: 'UPDATE_TASK_NAME',
            taskId,
            data: taskDetail,
          });

          alert(_l('修改成功'));

          callback();
        } else {
          errorMessage(result.error);
        }
      });
    }, 50)();
  };

// 更改任务星标
export const updateTaskMemberStar =
  (taskId, star, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskMemberStar({ taskID: taskId, star }).then(result => {
      if (result.status) {
        callback();

        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

        if (!taskDetail) {
          return;
        }

        taskDetail.data.star = star;

        dispatch({
          type: 'UPDATE_TASK_MEMBER_STAR',
          taskId,
          data: taskDetail,
        });
      } else {
        errorMessage(result.error);
      }
    });
  };

// 更改任务负责人
export const updateTaskCharge =
  (taskId, user, subTaskId, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.updateTaskCharge({ taskID: subTaskId || taskId, charge: user.accountId }).then(result => {
      if (result.status) {
        alert(_l('修改成功'));
        callback();

        const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

        if (!taskDetail) {
          return;
        }

        // 子任务
        if (subTaskId) {
          taskDetail.data.subTask.forEach(item => {
            if (item.taskID === subTaskId) {
              item.charge.accountID = user.accountId;
              item.charge.avatar = user.avatar;
              item.charge.fullName = user.fullname;
            }
          });
        } else {
          const oldCharge = _.cloneDeep(taskDetail.data.charge);

          // 新负责人
          taskDetail.data.charge.accountID = user.accountId;
          taskDetail.data.charge.avatar = user.avatar;
          taskDetail.data.charge.fullName = user.fullname;

          // 老负责人加入到成员中
          if (oldCharge.accountID && oldCharge.accountID !== 'user-undefined') {
            taskDetail.data.member = taskDetail.data.member.concat([{ type: 0, status: 0, account: oldCharge }]);
          }

          // 成员中删除新负责人
          _.remove(taskDetail.data.member, item => item.account.accountID === user.accountId);
        }

        dispatch({
          type: 'UPDATE_TASK_CHARGE',
          taskId,
          data: taskDetail,
        });
        emitter.emit('UPDATE_TASK_CHARGE', {
          type: 'UPDATE_TASK_CHARGE',
          taskId,
          data: taskDetail,
        });
      } else {
        errorMessage(result.error);
      }
    });
  };

// 更新任务描述
export const updateTaskSummary = (taskId, summary) => (dispatch, getState) => {
  ajaxRequest.updateTaskSummary({ taskID: taskId, summary }).then(result => {
    if (result.status) {
      const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

      taskDetail.data.summary = result.data;

      dispatch({
        type: 'UPDATE_TASK_SUMMARY',
        taskId,
        data: taskDetail,
      });

      // alert(_l('修改成功'));
    } else {
      errorMessage(result.error);
    }
  });
};

// 添加成员
export const addTaskMember =
  (taskId, users, specialAccounts, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest
      .batchAddTaskMember({
        taskIDstr: taskId,
        memberstr: users.join(','),
        specialAccounts: specialAccounts,
      })
      .then(result => {
        if (result.status) {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

          if (result.data.limitedCount) {
            alert(_l('有%0位外部用户邀请失败。外部用户短信邀请用量达到上限。', result.data.limitedCount));
          } else if (result.data.successMember) {
            alert(_l('添加成功'));

            const member = result.data.successMember.map(item => {
              return {
                type: 0,
                status: 0,
                account: item,
              };
            });

            taskDetail.data.member = taskDetail.data.member.concat(member);

            dispatch({
              type: 'ADD_TASK_MEMBER',
              taskId,
              data: taskDetail,
            });
          } else {
            alert(_l('用户已存在，请勿重复添加'), 3);
          }

          callback({ status: true });
        } else {
          errorMessage(result.error);
        }
      });
  };

// 任务同意加入
export const agreeApplyJoinTask = (taskId, accountId) => (dispatch, getState) => {
  ajaxRequest.agreeApplyJoinTask({ taskID: taskId, accountID: accountId }).then(result => {
    if (result.status) {
      const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

      taskDetail.data.member.forEach(item => {
        if (item.account.accountID === accountId) {
          item.status = 0;
        }
      });

      dispatch({
        type: 'AGREE_APPLY_JOIN_TASK',
        taskId,
        data: taskDetail,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 任务拒绝加入
export const refuseJoinTask = (taskId, accountId) => (dispatch, getState) => {
  ajaxRequest.refuseJoinTask({ taskID: taskId, accountID: accountId }).then(result => {
    if (result.status) {
      const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

      _.remove(taskDetail.data.member, item => item.account.accountID === accountId);

      dispatch({
        type: 'REFUSE_JOIN_TASK',
        taskId,
        data: taskDetail,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 添加子任务
export const addSubTask =
  (taskId, taskName, accountId, projectId, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.addTask({ taskName, chargeAccountID: accountId, parentID: taskId, projectId }).then(result => {
      if (result.status) {
        ajaxRequest.getTaskDetail({ taskID: result.data.taskID }).then(source => {
          if (source.status && source.data.taskID) {
            const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
            taskDetail.data.subTask = taskDetail.data.subTask.concat([source.data]);

            dispatch({
              type: 'ADD_SUB_TASK',
              taskId,
              data: taskDetail,
            });
          }
        });

        callback(result.data);
      } else {
        errorMessage(result.error);
      }
    });
  };

// 获取检查清单
export const getCheckListsWithItemsInTask =
  (taskId, addPostSuccessCount = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.getCheckListsWithItemsInTask({ taskId }).then(result => {
      if (result.status) {
        dispatch({
          type: 'GET_CHECK_LIST',
          taskId,
          data: result.data,
        });
      } else {
        errorMessage(result.error);
      }
      addPostSuccessCount();
    });
  };

// 添加清单
export const addCheckList = (taskId, value) => (dispatch, getState) => {
  ajaxRequest.addCheckList({ taskId, name: value }).then(result => {
    if (result.status) {
      if (result.data.overflow) {
        alert(_l('无法添加，单个任务下至多添加100个检查清单'), 3);
      } else {
        dispatch({
          type: 'ADD_CHECKLIST',
          taskId,
          data: result.data.checkList,
        });
      }
    } else {
      errorMessage(result.error);
    }
  });
};

// 修改清单顺序
export const updateCheckListIndex =
  (taskId, currentCheckListId, previousCheckListId, insertIndex) => (dispatch, getState) => {
    ajaxRequest.updateCheckListIndex({ currentCheckListId, previousCheckListId }).then(result => {
      if (result.status) {
        const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
        const currentData = _.find(checklist, item => item.checkListId === currentCheckListId);

        _.remove(checklist, item => item.checkListId === currentCheckListId);
        checklist.splice(insertIndex, 0, currentData);

        dispatch({
          type: 'UPDATE_CHECKLIST_INDEX',
          taskId,
          data: checklist,
        });
      } else {
        errorMessage(result.error);
      }
    });
  };

// 修改清单名称
export const updateCheckListName = (taskId, checkListId, name) => (dispatch, getState) => {
  ajaxRequest.updateCheckListName({ checkListId, name }).then(result => {
    if (result.status) {
      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
      checklist.map(item => {
        if (item.checkListId === checkListId) {
          item.name = name;
        }
        return item;
      });

      dispatch({
        type: 'UPDATE_CHECKLIST_NAME',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 删除清单
export const removeCheckList = (taskId, checkListId) => (dispatch, getState) => {
  ajaxRequest.removeCheckList({ checkListId }).then(result => {
    if (result.status) {
      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
      _.remove(checklist, item => item.checkListId === checkListId);

      dispatch({
        type: 'REMOVE_CHECKLIST',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 修改检查项顺序
export const updateItemIndex =
  (taskId, currentItemId, previousItemId, targetCheckListId, insertIndex) => (dispatch, getState) => {
    ajaxRequest.updateItemIndex({ currentItemId, previousItemId, targetCheckListId }).then(result => {
      if (result.status) {
        const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
        let currentData;

        checklist.map(list => {
          // 获取拖拽项
          list.items.forEach(item => {
            if (item.itemId === currentItemId) {
              currentData = item;
            }
          });
          // 删除拖拽项
          _.remove(list.items, item => item.itemId === currentItemId);
          return list;
        });

        // 查询到正确的放的checklist 插入对应的拖拽项
        checklist.map(list => {
          if (list.checkListId === targetCheckListId) {
            list.items.splice(insertIndex, 0, currentData);
          }
          return list;
        });

        dispatch({
          type: 'UPDATE_CHECKLIST_ITEM_INDEX',
          taskId,
          data: checklist,
        });
      } else {
        errorMessage(result.error);
      }
    });
  };

// 添加检查项
export const addItems = (taskId, checkListId, names) => (dispatch, getState) => {
  ajaxRequest.addItems({ checkListId, names }).then(result => {
    if (result.status) {
      if (result.data.overflow) {
        alert(_l('检查项至多可添加100个'), 3);
      }

      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
      checklist.map(item => {
        if (item.checkListId === checkListId) {
          item.items = item.items.concat(result.data.items);
        }
        return item;
      });

      dispatch({
        type: 'ADD_CHECKLIST_ITEM',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 修改检查项名称
export const updateItemName = (taskId, itemId, name) => (dispatch, getState) => {
  ajaxRequest.updateItemName({ itemId, name }).then(result => {
    if (result.status) {
      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);
      checklist.forEach(list => {
        list.items.forEach(item => {
          if (item.itemId === itemId) {
            item.name = name;
          }
        });
      });

      dispatch({
        type: 'UPDATE_ITEM_NAME',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 删除检查项
export const removeItem = (taskId, itemId) => (dispatch, getState) => {
  ajaxRequest.removeItem({ itemId }).then(result => {
    if (result.status) {
      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);

      checklist.map(list => {
        _.remove(list.items, item => item.itemId === itemId);
        return list;
      });

      dispatch({
        type: 'REMOVE_ITEM',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 检查项转任务之后删除检查项
export const createTaskRemoveItem = (taskId, itemId) => (dispatch, getState) => {
  const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);

  checklist.map(list => {
    _.remove(list.items, item => item.itemId === itemId);
    return list;
  });

  dispatch({
    type: 'REMOVE_ITEM',
    taskId,
    data: checklist,
  });
};

// 修改检查项状态
export const updateItemStatus = (taskId, itemId, status) => (dispatch, getState) => {
  ajaxRequest.updateItemStatus({ itemId, status }).then(result => {
    if (result.status) {
      const checklist = _.cloneDeep(getState().task.taskChecklists[taskId]);

      checklist.forEach(list =>
        list.items.forEach(item => {
          if (item.itemId === itemId) {
            item.status = status;
          }
        }),
      );

      dispatch({
        type: 'UPDATE_ITEM_STATUS',
        taskId,
        data: checklist,
      });
    } else {
      errorMessage(result.error);
    }
  });
};

// 自定义字段
export const getTaskControls =
  (taskId, addPostSuccessCount = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest.getTaskControls({ taskID: taskId }).then(result => {
      if (result.status) {
        dispatch({
          type: 'GET_TASK_CONTROLS',
          taskId,
          data: result.data,
        });
      } else {
        errorMessage(result.error);
      }
      addPostSuccessCount();
    });
  };

// 自定义字段值更新
export const updateControlValue = (taskId, controlId, value, opts, isAttachment) => (dispatch, getState) => {
  ajaxRequest.updateControlValue({ taskId, controlId, value, knowledgeAtt: isAttachment ? opts : '' }).then(result => {
    if (result.status) {
      const controls = _.cloneDeep(getState().task.taskControls[taskId]);

      controls.forEach(item => {
        if (item.controlId === controlId) {
          // 附件
          if (item.type === 14) {
            item.value = JSON.stringify(result.data.attachments);
          } else if (item.type === 21) {
            // 关联控件
            item.value = JSON.parse(item.value);
            // 删除
            if (JSON.parse(value).isd) {
              item.value.splice(opts, 1);
            } else {
              // 添加
              item.value = item.value.concat(JSON.parse(result.data.relation));
            }
            item.value = JSON.stringify(item.value);
          } else if (item.type === 19 || item.type === 23 || item.type === 24) {
            // 地区
            item.value = opts;
          } else {
            item.value = value;
          }
        }
      });

      dispatch({
        type: 'UPDATE_TASK_CONTROLS_VALUE',
        taskId,
        data: controls,
      });

      updateStageViewControlsSource(taskId, result.data.controls);
    } else {
      errorMessage(result.error);
    }
  });
};

// 更新自定义字段附件删除之后的值
export const updateTaskControlFiles = (taskId, controlId, value) => (dispatch, getState) => {
  const controls = _.cloneDeep(getState().task.taskControls[taskId]);

  controls.forEach(item => {
    if (item.controlId === controlId) {
      item.value = JSON.stringify(value);
    }
  });

  dispatch({
    type: 'UPDATE_TASK_CONTROLS_VALUE',
    taskId,
    data: controls,
  });
};

// 任务详情折叠项
export const taskFoldStatus =
  (taskId, foldId, callback = () => {}) =>
  (dispatch, getState) => {
    const foldStatus = _.cloneDeep(getState().task.taskFoldStatus[taskId]) || [];

    if (_.includes(foldStatus, foldId)) {
      _.remove(foldStatus, id => id === foldId);
    } else {
      foldStatus.push(foldId);
    }

    dispatch({
      type: 'UPDATE_TASK_FOLD_STATUS',
      taskId,
      data: foldStatus,
    });

    callback();
  };

// 获取任务讨论
export const updateCommentList = (taskId, data) => {
  return {
    type: 'TASK_DISCUSSIONS',
    taskId,
    data,
  };
};

// 删除任务讨论
export const removeTaskDiscussions = (taskId, discussionId) => (dispatch, getState) => {
  const { taskDiscussions } = getState().task;
  const discussions = taskDiscussions[taskId];

  _.remove(discussions, item => item.discussionId === discussionId);

  dispatch({
    type: 'UPDATE_TASK_DISCUSSIONS',
    taskId,
    data: discussions,
  });
};

// 添加任务讨论
export const addTaskDiscussions = (taskId, data) => {
  return {
    type: 'ADD_TASK_DISCUSSIONS',
    taskId,
    data,
  };
};

// 讨论中添加任务成员
export const discussionsAddMembers = (taskId, data) => (dispatch, getState) => {
  const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

  data.forEach(account => {
    account.accountID = account.accountId;
    taskDetail.data.member = taskDetail.data.member.concat([{ type: 0, status: 0, account }]);
  });

  dispatch({
    type: 'DISCUSSIONS_ADD_MEMBERS',
    taskId,
    data: taskDetail,
  });
};

// 添加标签
export const addTaskTag =
  (taskId, tagId, tagName, callback = () => {}) =>
  (dispatch, getState) => {
    tagController
      .addTaskTag2({
        taskIds: [taskId],
        tagName,
        tagID: tagId === 'createNewTagsID' ? '' : tagId,
      })
      .then(result => {
        if (result.id) {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
          taskDetail.data.tags.push({
            tagID: result.id,
            color: result.extra,
            tagName: result.value,
          });

          dispatch({
            type: 'ADD_TASK_TAG',
            taskId,
            data: taskDetail,
          });
        }

        callback(result);
      });
  };

// 删除标签
export const removeTasksTag =
  (taskId, tagId, callback = () => {}) =>
  (dispatch, getState) => {
    tagController
      .removeTasksTag({
        sourceIds: [taskId],
        tagId,
      })
      .then(data => {
        if (data.state === 0) {
          callback();
        } else {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
          _.remove(taskDetail.data.tags, item => item.tagID === tagId);

          dispatch({
            type: 'REMOVE_TASK_TAG',
            taskId,
            data: taskDetail,
          });
        }
      });
  };

// 添加附件
export const addTaskAttachments =
  (taskId, attachmentData, kcAttachmentData, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest
      .addTaskAttachments({
        taskId,
        atts: JSON.stringify(attachmentData),
        knowledgeAtts: JSON.stringify(kcAttachmentData),
      })
      .then(result => {
        if (result.status) {
          callback();

          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
          taskDetail.data.attachments = result.data.concat(taskDetail.data.attachments);

          dispatch({
            type: 'ADD_TASK_ATTACHMENTS',
            taskId,
            data: taskDetail,
          });
        } else {
          errorMessage(result.error);
        }
      });
  };

// 删除附件
export const deleteAttachmentData = (taskId, attachments) => (dispatch, getState) => {
  const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);
  taskDetail.data.attachments = attachments;

  dispatch({
    type: 'DELETE_ATTACHMENT_DATA',
    taskId,
    data: taskDetail,
  });
};

// 修改任务计划时间
export const updateTaskStartTimeAndDeadline =
  (taskId, startTime, deadline, callback = () => {}) =>
  (dispatch, getState) => {
    const updateTaskTimes = (startTime, deadline, updateType = 0, timeLock = '') => {
      ajaxRequest
        .updateTaskStartTimeAndDeadline({
          taskId,
          startTime,
          deadline,
          updateType,
          timeLock,
        })
        .then(result => {
          if (result.status) {
            const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

            if (result.data.changedTasks.length) {
              callback(result.data.changedTasks);

              const currentTask = _.find(result.data.changedTasks, item => item.taskId === taskId);

              taskDetail.data.startTime = currentTask.startTime;
              taskDetail.data.deadline = currentTask.deadline;

              taskDetail.data.subTask.forEach(item => {
                result.data.changedTasks.forEach(obj => {
                  if (item.taskID === obj.taskId) {
                    item.startTime = obj.startTime;
                    item.deadline = obj.deadline;
                  }
                });
              });

              dispatch({
                type: 'UPDATE_TASK_TIMES',
                taskId,
                data: taskDetail,
              });
            }

            // 二次确认层
            if (result.data.updateTypes) {
              updateTimeErrorDialog(result, startTime, type => {
                updateTaskTimes(startTime, deadline, type, result.data.timeLock);
              });
            }
          } else {
            updateTimeError(result);
          }
        });
    };

    updateTaskTimes(startTime, deadline);
  };

// 修改任务实际开始时间
export const updateTaskActualStartTime =
  (taskId, actualStartTime, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest
      .updateTaskActualStartTime({
        taskId,
        actualStartTime,
      })
      .then(result => {
        if (result.code === 1) {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

          taskDetail.data.actualStartTime = actualStartTime;
          // 计划为空
          if (!taskDetail.data.startTime) {
            taskDetail.data.startTime = actualStartTime;
          }

          dispatch({
            type: 'UPDATE_TASK_ACTUAL_START_TIME',
            taskId,
            data: taskDetail,
          });

          callback();
        } else {
          errorMessage(result);
        }
      });
  };

// 修改任务完成时间
export const updateCompletedTime =
  (taskId, time, callback = () => {}) =>
  (dispatch, getState) => {
    ajaxRequest
      .updateCompletedTime({
        taskId,
        time,
      })
      .then(result => {
        if (result.code === 1) {
          const taskDetail = _.cloneDeep(getState().task.taskDetails[taskId]);

          taskDetail.data.completeTime = time;

          dispatch({
            type: 'UPDATE_TASK_COMPLETED_TIME',
            taskId,
            data: taskDetail,
          });

          callback();
        } else {
          errorMessage(result);
        }
      });
  };

// 修改搜索的任务计数
export const updateSearchTaskCount = searchTaskCount => {
  return {
    type: 'UPDATE_SEARCH_TASK_COUNT',
    searchTaskCount,
  };
};
