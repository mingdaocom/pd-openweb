import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Dialog from 'ming-ui/components/Dialog';
import config from '../config/config';

// 请求错误处理
export const errorMessage = error => {
  if (error) {
    alert(error.msg || error.ex, 2);
  } else {
    alert(_l('操作失败，请稍后重试'), 2);
    console.log(error.code);
  }
};

// 获取storage
export const getTaskStorage = key => {
  const storage = window.localStorage.getItem(md.global.Account.accountId + key);
  if (storage) {
    try {
      JSON.parse(storage);
    } catch (e) {
      console.log(e);
      return storage;
    }
    return JSON.parse(storage);
  }
};

// 写入storage
export const setTaskStorage = (key, data) => {
  safeLocalStorageSetItem(md.global.Account.accountId + key, JSON.stringify(data));
};

// 获取任务状态
export const getTaskState = taskFilter => {
  const storage = getTaskStorage('TaskCenterState');
  let taskFilterKey = 'MyTask';
  if (taskFilter === 8) {
    taskFilterKey = 'Star';
  } else if (taskFilter === 9) {
    taskFilterKey = 'Subordinate';
  }
  return !storage || !storage[taskFilterKey] ? config.defaultState : storage[taskFilterKey];
};

// 获取项目状态
export const getFolderState = () => {
  const storage = getTaskStorage('TaskCenterState');
  return !storage || !storage.Folder ? config.defaultState : storage.Folder;
};

// 写入状态
export const setStateToStorage = (taskFilter, config) => {
  const storage = getTaskStorage('TaskCenterState') || {};
  let key = 'MyTask';
  if (!taskFilter) {
    key = 'Folder';
  } else if (taskFilter === 8) {
    key = 'Star';
  } else if (taskFilter === 9) {
    key = 'Subordinate';
  }

  storage[key] = {
    listStatus: config.listStatus,
    listSort: config.listSort,
    completeTime: config.completeTime,
    lastMyProjectId: config.lastMyProjectId,
    projectId: config.projectId,
    attachmentViewType: config.attachmentViewType,
    viewType: config.viewType,
    folderId: config.folderId,
    taskFilter,
  };

  storage.Active = key !== 'Folder' ? config.taskFilter : '';

  setTaskStorage('TaskCenterState', storage);
};

// 验证当前用户是否在该网络
export const checkIsProject = projectId => {
  let isExist = false;
  _.map(md.global.Account.projects, project => {
    if (projectId === project.projectId) {
      isExist = true;
    }
  });

  return isExist;
};

// 服务器时间换算
export const getCurrentTime = () => {
  return moment().format('YYYY-MM-DD HH:mm');
};

export const formatTimeInfo = (time, isCompleteAppear) => {
  // 当前时间
  const currentTime = moment(getCurrentTime());

  // 年
  const currentYear = currentTime.year();
  const timeYear = time.year();

  const diff = (moment(currentTime.format('YYYY-MM-DD')) - moment(time.format('YYYY-MM-DD'))) / 24 / 60 / 60 / 1000;
  let text = '';
  let color = '';

  if (diff == 0) {
    text = _l('今天');
    color = '#4caf50';
    text = `${text} ${time.format('HH:mm')}`;
  } else if (diff == -1) {
    text = _l('明天');
    color = '#1677ff';
    text = `${text} ${time.format('HH:mm')}`;
  } else if (diff == 1) {
    text = _l('昨天');
    color = '#1677ff';
    text = `${text} ${time.format('HH:mm')}`;
  } else if (moment(currentTime).isSame(time, 'week')) {
    // 本周
    text = time.format('ddd');
    color = '#1677ff';
    text = `${text} ${time.format('HH:mm')}`;
  } else if (currentYear === timeYear) {
    // 本年
    text = isCompleteAppear ? time.format('MMMDo HH:mm') : time.format('MMMDo');
    color = '#757575';
  } else {
    // 跨年
    text = isCompleteAppear ? time.format('YYYY/MM/DD HH:mm') : time.format('YYYY/MM/DD');
    color = '#757575';
  }

  return {
    color,
    text: `${text}`,
  };
};

// 获取开始时间和截止时间的文字
const getTimeInfo = (start, end, isCompleteAppear) => {
  const startTime = moment(start);
  const endTime = moment(end);
  let el = '';

  // 只有开始时间
  if (start && !end) {
    const result = formatTimeInfo(startTime, isCompleteAppear);
    el = `<span style="color:${result.color};">${result.text} ${_l('开始')}</span>`;
    return el;
  }

  // 只有截止时间
  if (!start && end) {
    const result = formatTimeInfo(endTime, isCompleteAppear);
    el = `<span style="color:${result.color};">${result.text} ${_l('截止')}</span>`;
    return el;
  }

  // 如果是同一天
  if (startTime.format('YYYY-MM-DD') === endTime.format('YYYY-MM-DD')) {
    const same = formatTimeInfo(startTime, true);
    el = `<span style="color:${same.color};">${same.text} ~ ${endTime.format('HH:mm')}</span>`;
  } else {
    const start = formatTimeInfo(startTime, isCompleteAppear);
    const end = formatTimeInfo(endTime, isCompleteAppear);
    let color = '#757575'; // 默认灰色

    if (start.color == '#4caf50' || end.color == '#4caf50') {
      // 如果有绿色
      color = '#4caf50';
    } else if (start.color == '#1677ff' || end.color == '#1677ff') {
      // 如果有蓝色
      color = '#1677ff';
    }

    el = `<span style="color:${color};">${start.text} ~ ${end.text}</span>`;
  }

  return el;
};

/**
 * 转换时间
 * @param  {boolean} status 任务状态
 * @param  {string} startTime 开始时间
 * @param  {string} endTime 结束时间
 * @param  {string} actualStartTime 实际开始时间
 * @param  {string} completeTime 完成时间
 * @param  {boolean} isCreate 是否创建
 */
export const formatTaskTime = (status, startTime, endTime, actualStartTime, completeTime, isCreate = false) => {
  const currentTime = getCurrentTime();
  const render = (text, color, className = '') => `<span style="color:${color};" class="${className}">${text}</span>`;
  const COLORS = {
    gray: '#757575',
    blue: '#1677ff',
    green: '#4caf50',
    red: '#ff0000',
    yellow: '#ffa414',
  };
  let diff;
  let day;
  let hour;

  if (!startTime && !endTime) {
    return '';
  }

  // 创建没有逾期延期
  if (isCreate) {
    return getTimeInfo(startTime, endTime, false);
  }

  // 完成
  if (status) {
    // 没有截止时间，按时完成
    if (!endTime) {
      return render(_l('按时完成'), COLORS.green);
    }

    // 时间偏移小时数
    diff = Math.ceil((moment(completeTime) - moment(endTime)) / 60 / 60 / 1000);
    day = Math.floor(Math.abs(diff) / 24);
    hour = Math.abs(diff) % 24;

    if (diff === 0) {
      return render(_l('按时完成'), COLORS.green);
    } else if (diff < 0) {
      if (day) {
        return render(_l('提前%0天完成', day), COLORS.green);
      } else if (hour) {
        return render(_l('提前%0小时完成', hour), COLORS.green);
      }
    } else {
      if (day) {
        return render(_l('逾期%0天完成', day), COLORS.red);
      } else if (hour) {
        return render(_l('逾期%0小时完成', hour), COLORS.red);
      }
    }
  }

  // 延期未开始
  if (
    startTime &&
    ((!actualStartTime && moment(currentTime) > moment(startTime)) ||
      (actualStartTime && moment(actualStartTime) > moment(currentTime)))
  ) {
    // 逾期未完成 优先级高
    if (endTime && moment(currentTime) > moment(endTime)) {
      diff = Math.ceil((moment(currentTime) - moment(endTime)) / 60 / 60 / 1000);
      day = Math.floor(diff / 24);
      hour = diff % 24;
      if (day) {
        return render(_l('逾期%0天', day), COLORS.red, 'taskDelayNoComplete');
      } else if (hour) {
        return render(_l('逾期%0小时', hour), COLORS.red, 'taskDelayNoComplete');
      }
    } else {
      diff = Math.abs(Math.ceil((moment(currentTime) - moment(startTime)) / 60 / 60 / 1000));
      day = Math.floor(diff / 24);
      hour = diff % 24;
      if (day) {
        return render(_l('延期%0天未开始', day), COLORS.yellow, 'taskDelayNoStart');
      } else if (hour) {
        return render(_l('延期%0小时未开始', hour), COLORS.yellow, 'taskDelayNoStart');
      }
    }
  }

  // 逾期
  if (endTime && moment(currentTime) > moment(endTime)) {
    diff = Math.ceil((moment(currentTime) - moment(endTime)) / 60 / 60 / 1000);
    day = Math.floor(diff / 24);
    hour = diff % 24;
    if (day) {
      return render(_l('逾期%0天', day), COLORS.red, 'taskDelayNoComplete');
    } else if (hour) {
      return render(_l('逾期%0小时', hour), COLORS.red, 'taskDelayNoComplete');
    }
  }

  return getTimeInfo(startTime, endTime, false);
};

// 格式化状态
export const formatStatus = (status, lock, auth) => {
  let style = '';
  let tip = '';
  let opAuth = 1; // 0 无权限 1 有权限

  // 未完成
  if (status == 0) {
    tip = _l('标记完成');
    // 锁定
    if (lock) {
      if (auth != 1) {
        style = 'lockTask';
        tip = _l('任务已锁定，无法操作');
        opAuth = '0';
      } else {
        style = 'lockToOtherTask';
        tip = _l('任务已锁定，但我是创建者或负责人可以操作');
      }
    } else if (auth != 1 && auth != 2) {
      style = 'disable';
      tip = _l('只有此任务的成员才能操作');
    }
  } else {
    tip = _l('已完成任务，点击标记为未完成');
    style = 'completeHook';
    if (lock && auth != 1) {
      opAuth = '0';
    }
  }

  return {
    style,
    tip,
    auth,
    opAuth,
  };
};

// build myTaskIcon
export const buildMyTaskIcon = (type, isBatch) => {
  let tip;
  const className = isBatch ? '' : 'Hidden';
  let iconName = ' icon-task-soon';
  switch (type) {
    // 待分配
    case 0:
      tip = _l('选择何时处理这条任务');
      break;
    case 1:
      tip = _l('已分配为今天要做，点击可重新分配');
      iconName = ' icon-task-today';
      break;
    case 2:
      tip = _l('已分配为最近要做，点击可重新分配');
      break;
    case 3:
      tip = _l('已分配为以后考虑，点击可重新分配');
      iconName = ' icon-task-later';
      break;
    default:
      break;
  }
  if (isBatch) {
    return '<span class="myTaskIcon myTaskTip" title="' + tip + '"><i class="icon-task-soon"></i></span>';
  }
  return '<span class="myTaskIcon ' + className + iconName + ' myTaskTip" title="' + tip + '"></span>';
};

// 修改任务状态为未完成时出现弹层
export const taskStatusDialog = (status, callback) => {
  if (status) {
    callback();
  } else {
    Dialog.confirm({
      title: _l('将任务设为未完成'),
      children: (
        <div style={{ color: '#999' }}>
          {_l('您在修改一个已被标记为完成的任务，若将其设为未完成，则当前的“任务完成时间”数据将被删除。是否确认修改？')}
        </div>
      ),
      okText: _l('设为未完成'),
      onOk: () => {
        callback();
      },
    });
  }
};

// 返回自定义字段内容
export const returnCustonValue = item => {
  // 单选框
  if (item.type === 9) {
    if (item.value && item.value !== '0') {
      return _.find(item.options, ({ key }) => key === item.value).value;
    }
    return '';
  }
  // 复选框
  if (item.type === 10) {
    const key = [];
    for (let i = 0; i < item.value.length; i++) {
      if (item.value.substr(i, 1) !== '0') {
        key.push('1' + item.value.slice(i + 1).replace(/1/g, 0));
      }
    }

    item.value = _.map(item.options, option => {
      return key.indexOf(option.key) >= 0 ? option.value : '';
    });
    _.remove(item.value, option => option === '');
    return item.value.join(',');
  }
  // 下拉框
  if (item.type === 11) {
    if (item.value !== '0') {
      return _.find(item.options, ({ key }) => key === item.value).value;
    }
    return '';
  }
  // 附件
  if (item.type === 14) {
    return _.map(JSON.parse(item.value), att => att.originalFilename).join(', ');
  }
  // 日期
  if (item.type === 15) {
    return item.value.split(' ')[0];
  }

  return item.value;
};
