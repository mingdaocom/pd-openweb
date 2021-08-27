import config from '../config/config';
const { workingTimes, workingSumHours, filterWeekendDay, VIEWTYPE, GRANULARITY, TASKSTATUS, SUBTASKLEVEL, TASK_NAME_SIZE, SINGLE_TIME, ARROW_STATUS } = config;

/**
 * 返回有效时长
 * @param  {string} startTime
 * @param  {string} endTime
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {number}  有效时长
 */
const getValidHours = (startTime, endTime, filterWeekend) => {
  // 开始时间和截止时间都不存在
  if (!startTime && !endTime) {
    return 0;
  }

  let validHours = Math.floor((moment(endTime) - moment(startTime)) / 24 / 60 / 60 / 1000) * workingSumHours; // 整数时长
  let validStartHours = parseInt(moment(startTime).format('HH:00'));
  let validEndHours = parseInt(moment(endTime).format('HH:00'));
  let validHoursSingle = 0; // 单独的时间
  let isReverse = false;

  // 交换开始结束时间
  if (validStartHours > validEndHours) {
    const cacheTime = validStartHours;

    isReverse = true;
    validStartHours = validEndHours;
    validEndHours = cacheTime;
  }

  for (let i = 0; i < workingTimes.length; i++) {
    const workingStart = parseInt(workingTimes[i][0]);
    const workingEnd = parseInt(workingTimes[i][1]);

    // 开始时间在工作时间范围内
    if (validStartHours >= workingStart && validStartHours < workingEnd) {
      if (validEndHours <= workingEnd) {
        validHoursSingle += validEndHours - validStartHours;
      } else {
        validHoursSingle += workingEnd - validStartHours;
      }
    }

    // 开始时间小于当前这段的工作时间  结束时间大于当前这段的结束时间
    if (validStartHours < workingStart && validEndHours > workingEnd) {
      validHoursSingle += workingEnd - workingStart;
    }

    // 开始时间小于当前这段的工作时间  结束时间在工作时间范围内
    if (validStartHours < workingStart && validEndHours > workingStart && validEndHours <= workingEnd) {
      validHoursSingle += validEndHours - workingStart;
    }
  }

  if (isReverse) {
    validHoursSingle = workingSumHours - validHoursSingle;
  }

  validHours += validHoursSingle;

  // 过滤周末
  if (filterWeekend) {
    // 相差天数
    let timeDiff = (moment(endTime.split(' ')[0]) - moment(startTime.split(' ')[0])) / 24 / 60 / 60 / 1000;
    // 计算出整数周 算出几个周末
    let weekendCount = Math.floor(timeDiff / 7) * filterWeekendDay.length;
    // 剩下的天
    timeDiff = timeDiff % 7;

    // 统计周末总天数
    for (let i = 0; i < timeDiff; i++) {
      const day = moment(startTime.split(' ')[0])
        .add(i, 'd')
        .day();
      if (_.includes(filterWeekendDay, day)) {
        weekendCount++;
      }
    }

    // 去除周末时长
    validHours -= weekendCount * workingSumHours;
  }

  return validHours;
};

/**
 * 处理出合法的工作时间
 * @param  {string} startTime
 * @param  {string} endTime
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {object}  showStartTime, showEndTime, showHourLong
 */
const checkTime = (startTime, endTime, filterWeekend) => {
  // 最大截止时间
  const maxWorkingEnd = workingTimes[workingTimes.length - 1][1];

  if (startTime) {
    // 开始时间
    let startHours = moment(startTime).format('HH:00');
    // 开始时间周几
    let startDay = moment(startTime).day();
    // 处理开始时间
    const updateStartTime = () => {
      for (let i = 0; i < workingTimes.length; i++) {
        const workingStart = workingTimes[i][0];
        const workingEnd = workingTimes[i][1];

        // 开始时间早于工作时间，则把开始时间设为工作开始时间
        if (parseInt(startHours) < parseInt(workingStart)) {
          startHours = workingStart;
          break;
        }

        // 开始时间大于结束时间 并且 开始时间大于最大结束时间
        if (parseInt(startHours) >= parseInt(workingEnd) && parseInt(startHours) >= parseInt(maxWorkingEnd)) {
          const newStart = parseInt(maxWorkingEnd) - 1;
          startHours = newStart >= 10 ? newStart + ':00' : '0' + newStart + ':00';
          break;
        }

        // 开始时间等于当前工作结束时间
        if (parseInt(startHours) === parseInt(workingEnd)) {
          const newStart = parseInt(workingEnd) - 1;
          startHours = newStart >= 10 ? newStart + ':00' : '0' + newStart + ':00';
          break;
        }

        // 合法时间
        if (parseInt(startHours) >= parseInt(workingStart) && parseInt(startHours) < parseInt(workingEnd)) {
          break;
        }
      }

      startTime = startTime.split(' ')[0] + ' ' + startHours;
    };

    // 处理开始时间 是否过滤特定日期
    if (filterWeekend && _.includes(filterWeekendDay, startDay)) {
      const newStart = parseInt(maxWorkingEnd) - 1;
      let addStartDay = 0;

      startHours = newStart >= 10 ? newStart + ':00' : '0' + newStart + ':00';

      // 推算出当天是否是工作日
      while (_.includes(filterWeekendDay, startDay)) {
        // 周末处理成7
        if (startDay === 0) {
          startDay = 7;
        }
        startDay--;
        addStartDay--;
      }

      startTime =
        moment(startTime.split(' ')[0])
          .add(addStartDay, 'd')
          .format('YYYY-MM-DD') +
        ' ' +
        startHours;
    } else {
      // 处理开始时间
      updateStartTime();
    }
  }

  if (endTime) {
    // 结束时间
    let endHours = moment(endTime).format('HH:00');
    // 结束时间周几
    let endDay = moment(endTime).day();
    // 处理结束时间
    const updateEndTime = () => {
      for (let i = 0; i < workingTimes.length; i++) {
        const workingStart = workingTimes[i][0];
        const workingEnd = workingTimes[i][1];

        // 结束时间晚于工作时间，则把结束时间设为工作结束时间
        if (parseInt(endHours) > parseInt(maxWorkingEnd)) {
          endHours = maxWorkingEnd;
          break;
        }

        // 结束时间小于开始时间
        if (parseInt(endHours) <= parseInt(workingStart)) {
          const newEnd = parseInt(workingStart) + 1;
          endHours = newEnd >= 10 ? newEnd + ':00' : '0' + newEnd + ':00';
          break;
        }

        // 合法时间
        if (parseInt(endHours) > parseInt(workingStart) && parseInt(endHours) <= parseInt(workingEnd)) {
          break;
        }
      }

      endTime = endTime.split(' ')[0] + ' ' + endHours;
    };

    // 处理结束时间 是否过滤特定日期
    if (filterWeekend && _.includes(filterWeekendDay, endDay)) {
      const newEnd = parseInt(workingTimes[0][0]) + 1;
      let addEndDay = 0;

      endHours = newEnd >= 10 ? newEnd + ':00' : '0' + newEnd + ':00';

      // 推算出当天是否是工作日
      while (_.includes(filterWeekendDay, endDay)) {
        endDay++;
        addEndDay++;

        // 7处理成周末 0
        if (endDay === 7) {
          endDay = 0;
        }
      }

      endTime =
        moment(endTime.split(' ')[0])
          .add(addEndDay, 'd')
          .format('YYYY-MM-DD') +
        ' ' +
        endHours;
    } else {
      // 处理结束时间
      updateEndTime();
    }
  }

  // 时长
  const hourLong = getValidHours(startTime, endTime, filterWeekend);

  return {
    showStartTime: startTime,
    showEndTime: endTime,
    showHourLong: hourLong,
  };
};

/**
 * 数据源中生成任务时间条二维数组
 * @param  {[]} source 数据源
 * @param  {number} viewType  当前视图
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {[]}  数据源
 */
const taskTimeBars = (source, viewType, filterWeekend) => {
  // 不同视图下任务名称代表多少小时
  let taskNameTime;

  if (viewType === VIEWTYPE.DAY) {
    taskNameTime = TASK_NAME_SIZE / GRANULARITY.DAY;
  }

  if (viewType === VIEWTYPE.WEEK) {
    taskNameTime = TASK_NAME_SIZE / GRANULARITY.WEEK;
  }

  if (viewType === VIEWTYPE.MONTH) {
    taskNameTime = TASK_NAME_SIZE / GRANULARITY.MONTH;
  }

  source.forEach((data) => {
    let taskListArry = _.cloneDeep(data.tasks);
    const taskTimeBarArry = [];
    const lastTaskTimeBars = [];

    // 循环出无展示开始时间 或 无展示结束时间的数据
    taskListArry.forEach((task) => {
      if (task.showStartTime === '' && task.showEndTime === '' && task.isShow) {
        lastTaskTimeBars.push([task]);
      }
    });

    // 去除无展示开始时间且无展示截止时间的数据  或  不展示的数据
    _.remove(taskListArry, task => (task.showStartTime === '' && task.showEndTime === '') || !task.isShow);

    // 根据开始时间排序
    taskListArry = taskListArry.sort((a, b) => (moment(a.showStartTime) > moment(b.showStartTime) ? 1 : -1));

    /**
     * 检测是否包含了该项
     * @param  {string} taskId
     * @return {boolean}
     */
    const checkIsContain = (taskId) => {
      // 是否包含
      let isContain = false;
      // 检查数组中是否已经包含了该项
      taskTimeBarArry.forEach(timeBars =>
        timeBars.forEach((item) => {
          if (item.taskId === taskId) {
            isContain = true;
          }
        })
      );

      return isContain;
    };

    /**
     * 获取最大结束时间
     * @param  {object} item
     * @return {string}
     */
    const getMaxEndTime = (item) => {
      let maxEndTime = item.showEndTime;
      // 已完成
      if (item.status && moment(maxEndTime) < moment(item.completeTime)) {
        maxEndTime = checkTime(item.showStartTime, item.completeTime, filterWeekend).showEndTime;
      } else if (moment(maxEndTime) < moment(config.timeStamp)) {
        maxEndTime = checkTime(item.showStartTime, config.timeStamp, filterWeekend).showEndTime;
      }

      return maxEndTime;
    };

    // 获取真实展示截止时间
    const getFactEndTime = (item) => {
      const factEndTime = moment(getMaxEndTime(item));
      const offsetTimes = getDays(taskNameTime);
      // 用小时 计算出天偏差和时间
      const { day, time } = offsetEndPositiveHour(moment(factEndTime), offsetTimes.hour);

      return offsetDay(moment(time), offsetTimes.day + day, filterWeekend);
    };

    // 获取带子任务的最小开始时间
    const getMinStartTime = (item) => {
      // 最小展示开始时间
      let minShowStartTime = item.showStartTime;

      if (item.arrowStatus !== ARROW_STATUS.NULL) {
        // 左侧子任务展开元素宽度
        const leftElementWidth = 20;
        let leftElementTime;

        // 日视图
        if (viewType === VIEWTYPE.DAY) {
          leftElementTime = Math.ceil(leftElementWidth / GRANULARITY.DAY);
        }

        // 周视图
        if (viewType === VIEWTYPE.WEEK) {
          leftElementTime = Math.ceil(leftElementWidth / GRANULARITY.WEEK);
        }

        // 月视图
        if (viewType === VIEWTYPE.MONTH) {
          leftElementTime = Math.ceil(leftElementWidth / GRANULARITY.MONTH);
        }

        // 换算时间
        const offsetTimes = getDays(-leftElementTime);
        // 用小时 计算出天偏差和时间
        const { day, time } = offsetStartNegativeHour(moment(item.showStartTime), Math.abs(offsetTimes.hour));

        minShowStartTime = offsetDay(moment(time), offsetTimes.day + day, filterWeekend);
      }

      return minShowStartTime;
    };

    // 是否已插入拖拽项
    let isInsert = false;
    taskListArry.forEach((task, i) => {
      // 不存在添加
      if (!checkIsContain(task.taskId)) {
        // 拖拽项占一行
        if (config.dragItem && taskTimeBarArry.length === config.DARG_INDEX) {
          isInsert = true;
          taskTimeBarArry.push([config.dragItem]);
        }

        // 非拖拽项
        if (task.taskId !== config.singleDragTaskId) {
          taskTimeBarArry.push([task]);
        }
      }

      if (task.deadline) {
        // 加上任务名称真实的展示结束时间
        let factEndTime = moment(getFactEndTime(task));
        taskListArry.forEach((item) => {
          // 展示开始时间 大于当前 展示结束时间  并且 不存在  且 非拖拽项
          if (item.startTime && moment(getMinStartTime(item)) >= factEndTime && !checkIsContain(item.taskId) && item.taskId !== config.singleDragTaskId) {
            factEndTime = moment(getFactEndTime(item));
            taskTimeBarArry[taskTimeBarArry.length - 1].push(item);
          }
        });
      }
    });

    // 未插入
    if (config.dragItem && !isInsert) {
      taskTimeBarArry.push([config.dragItem]);
    }

    data.taskTimeBars = taskTimeBarArry.concat(lastTaskTimeBars);
  });

  return source;
};

/**
 * 返回单条任务数据
 * @param  {[]} tasks  多条任务
 * @param  {object} task  单条任务
 * @param  {boolean} status  当前任务状态
 * @param  {boolean} filterWeekend  是否过滤周末
 * @param  {number} level  当前层级
 */
const singleTaskSourceUpdate = (tasks, task, status, filterWeekend, level) => {
  let startTime = task.startTime;
  let endTime = task.deadline;
  task.isShow = true;
  task.singleTime = '';

  // 不是同一个状态 并且不是显示全部
  if (status !== task.status && status !== TASKSTATUS.ALL) {
    task.isShow = false;
  }

  // 母任务是否展开状态
  let isOpen = false;
  tasks.forEach((item) => {
    if (item.taskId === task.parentId && item.arrowStatus === ARROW_STATUS.OPEN) {
      isOpen = true;
    }
  });

  // 当前呈现子任务的层级 小于 母任务数量  并且 不是显示全部
  if (level <= task.ancestorIds.length && level !== SUBTASKLEVEL.ALL && !isOpen) {
    task.isShow = false;
  }

  // 处理只有单侧的开始时间
  if (task.startTime && !task.deadline) {
    endTime = moment(task.startTime)
      .add(1, 'd')
      .format('YYYY-MM-DD HH:mm:ss');
    task.singleTime = SINGLE_TIME.START;
  }

  // 处理只有单侧的结束时间
  if (!task.startTime && task.deadline) {
    startTime = moment(task.deadline)
      .add(-1, 'd')
      .format('YYYY-MM-DD HH:mm:ss');
    task.singleTime = SINGLE_TIME.END;
  }

  // 任务已完成
  if (task.status === TASKSTATUS.COMPLETED) {
    if (task.startTime || task.deadline) {
      // 结束时间存在 且 完成时间小于结束时间  有效时长用完成时间  提前完成
      if (task.deadline && moment(task.completeTime) < moment(task.deadline)) {
        endTime = moment(task.completeTime)
          .add(1, 'h')
          .format('YYYY-MM-DD HH:00:00');
      }

      // 结束时间不存在
      if (!task.deadline) {
        endTime = moment(task.completeTime)
          .add(1, 'h')
          .format('YYYY-MM-DD HH:00:00');
        task.singleTime = '';
      }

      // 开始不存在 或 开始时间大于结束时间
      if (!task.startTime || moment(task.startTime) >= moment(endTime)) {
        startTime = moment(endTime)
          .add(-1, 'd')
          .format('YYYY-MM-DD HH:00:00');
      }
    } else {
      // 无起止时间的任务
      endTime = moment(task.completeTime)
        .add(1, 'h')
        .format('YYYY-MM-DD HH:00:00');
      startTime = moment(endTime)
        .add(-1, 'd')
        .format('YYYY-MM-DD HH:00:00');
      task.singleTime = SINGLE_TIME.END;
    }
  }

  // 返回呈现的 开始时间、结束时间、时长(小时)
  const updateTimeObj = checkTime(startTime, endTime, filterWeekend);

  Object.assign(task, updateTimeObj);
};

/**
 * 返回单条箭头状态
 * @param  {[]} tasks  多条任务
 * @param  {object} task  单条任务
 * @param  {number} level  当前层级
 */
const singleTaskArrow = (tasks, task, level) => {
  // 无子任务
  if (task.subTaskIds.length === 0) {
    task.arrowStatus = ARROW_STATUS.NULL;
  } else {
    let isExist = false;
    tasks.forEach((item) => {
      if (_.includes(task.subTaskIds, item.taskId)) {
        isExist = true;
      }
    });

    // 子任务不在当前下无箭头
    if (!isExist) {
      task.arrowStatus = ARROW_STATUS.NULL;
    } else {
      if (level === SUBTASKLEVEL.ALL || level > task.ancestorIds.length + 1) {
        task.arrowStatus = ARROW_STATUS.OPEN;
      } else {
        task.arrowStatus = ARROW_STATUS.CLOSED;
      }
    }
  }
};

/**
 * 返回不同状态下的数据状态
 * @param  {array} source  数据源
 * @param  {boolean} status  当前任务状态
 * @param  {number} viewType  当前视图
 * @param  {boolean} filterWeekend  是否过滤周末
 * @param  {number} level  当前层级
 * @return {[]}  数据源
 */
const updateTasksDataSource = (source, status, viewType, filterWeekend, level) => {
  source.forEach((data) => {
    // 循环处理任务箭头的问题
    data.tasks.forEach((task) => {
      singleTaskArrow(data.tasks, task, level);
    });
    data.tasks.forEach((task) => {
      singleTaskSourceUpdate(data.tasks, task, status, filterWeekend, level);
    });
  });

  return taskTimeBars(source, viewType, filterWeekend);
};

/**
 * 返回日视图数据
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {[]}
 */
const getDaysTime = (filterWeekend) => {
  const startTime = config.folderId
    ? moment(config.minStartTime)
        .subtract(7, 'd')
        .format('YYYY-MM-DD')
    : moment(config.minStartTime).format('YYYY-MM-DD');
  const endTime = moment(config.maxEndTime)
    .add(28, 'd')
    .format('YYYY-MM-DD');
  const timeDiff = (moment(endTime) - moment(startTime)) / 24 / 60 / 60 / 1000;
  const result = {};

  for (let i = 0; i <= timeDiff; i++) {
    const momentObj = moment(startTime).add(i, 'd');
    const day = momentObj.day();
    const month = momentObj.month() + 1;
    const year = momentObj.year();
    const key = `${year}-${month}`;

    if (filterWeekend && _.includes(filterWeekendDay, day)) continue;

    if (!result[key]) {
      result[key] = [momentObj.format('YYYY-MM-DD')];
    } else {
      result[key].push(momentObj.format('YYYY-MM-DD'));
    }
  }

  return Object.keys(result).map((item) => {
    return {
      month: item,
      dateList: result[item],
    };
  });
};

/**
 * 返回周视图数据
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {[]}
 */
const getWeeksTime = (filterWeekend) => {
  const startGapDay = moment(config.minStartTime).day();
  const endGapDay = moment(config.maxEndTime).day();
  const startWssk = moment(config.minStartTime).subtract((startGapDay === 0 ? 7 : startGapDay) - 1, 'd');
  const endWssk = moment(config.maxEndTime).add(endGapDay === 0 ? 0 : 7 - endGapDay, 'd');
  const startTime = config.folderId ? startWssk.subtract(1, 'w').format('YYYY-MM-DD') : startWssk.format('YYYY-MM-DD');
  const endTime = endWssk.add(8, 'w').format('YYYY-MM-DD');
  const timeDiff = (moment(endTime) - moment(startTime)) / 24 / 60 / 60 / 1000;
  let result = {};

  for (let i = 0; i <= timeDiff; i++) {
    const momentObj = moment(startTime).add(i, 'd');
    const day = momentObj.day();
    const year = momentObj.isoWeekYear();
    const week = momentObj.isoWeek();
    const key = `${year}-${week}`;
    const date = momentObj.format('YYYY-MM-DD');

    if (filterWeekend && _.includes(filterWeekendDay, day)) continue;

    if (!result[key]) {
      result[key] = [date];
    } else {
      result[key].push(date);
    }
  }

  result = Object.keys(result).reduce((obj, item) => {
    const first = result[item][0];
    const firstDate = moment(first);
    const year = firstDate.isoWeekYear();
    const month = firstDate.month() + 1;
    const key = `${year}-${month}`;
    if (!obj[key]) {
      obj[key] = [result[item]];
    } else {
      obj[key].push(result[item]);
    }
    return obj;
  }, {});

  return Object.keys(result).map((item) => {
    return {
      month: item,
      dateList: result[item],
    };
  });
};

/**
 * 返回月视图数据
 * @return {[]}
 */
const getMonthsTime = () => {
  const startTime = config.folderId ? moment(config.minStartTime).add(-1, 'M') : moment(config.minStartTime);
  const endTime = moment(config.maxEndTime).add(6, 'M');
  const timeDiff = (endTime.year() - startTime.year()) * 12 + (endTime.month() - startTime.month());
  const result = {};

  for (let i = 0; i <= timeDiff; i++) {
    const momentObj = moment(startTime).add(i, 'M');
    const month = momentObj.month() + 1;
    const year = momentObj.year();
    const key = `${year}`;

    if (!result[key]) {
      result[key] = [momentObj.format('YYYY-MM')];
    } else {
      result[key].push(momentObj.format('YYYY-MM'));
    }
  }

  return Object.keys(result).map((item) => {
    return {
      year: item,
      dateList: result[item],
    };
  });
};

/**
 * 返回对应视图的对应时间轴数据
 * @param  {number} viewType  当前视图
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {[]}
 */
const getTimeAxisSource = (viewType, filterWeekend) => {
  if (viewType === VIEWTYPE.DAY) {
    return getDaysTime(filterWeekend);
  }

  if (viewType === VIEWTYPE.WEEK) {
    return getWeeksTime(filterWeekend);
  }

  if (viewType === VIEWTYPE.MONTH) {
    return getMonthsTime();
  }
};

/**
 * 返回各种视图下每小时宽度
 * @param  {number} viewType  当前视图
 * @return {number}
 */
const getOneHourWidth = (viewType) => {
  if (viewType === VIEWTYPE.DAY) {
    return GRANULARITY.DAY;
  }

  if (viewType === VIEWTYPE.WEEK) {
    return GRANULARITY.WEEK;
  }

  if (viewType === VIEWTYPE.MONTH) {
    return GRANULARITY.MONTH;
  }
};

/**
 * 返回各种视图下单天宽度
 * @param  {number} viewType  当前视图
 * @return {number}
 */
const singleDayWidth = (viewType) => {
  if (viewType === VIEWTYPE.DAY) {
    return workingSumHours * GRANULARITY.DAY;
  }

  if (viewType === VIEWTYPE.WEEK) {
    return workingSumHours * GRANULARITY.WEEK;
  }

  if (viewType === VIEWTYPE.MONTH) {
    return workingSumHours * GRANULARITY.MONTH;
  }
};

/**
 * 返回各种视图下单格宽度
 * @param  {number} viewType  当前视图
 * @param  {boolean} filterWeekend  是否过滤周末
 * @param  {string} month 月份
 * @return {number}
 */
const singleTableWidth = (viewType, filterWeekend, month) => {
  // 日
  if (viewType === VIEWTYPE.DAY) {
    return singleDayWidth(viewType);
  }

  // 周
  if (viewType === VIEWTYPE.WEEK) {
    if (filterWeekend) {
      return singleDayWidth(viewType) * (7 - filterWeekendDay.length);
    }
    return singleDayWidth(viewType) * 7;
  }

  // 月
  if (viewType === VIEWTYPE.MONTH) {
    const timeDiff = (moment(month).add(1, 'M') - moment(month)) / 24 / 60 / 60 / 1000;
    const startTime = month + '-01';
    let days = 0;

    for (let i = 0; i < timeDiff; i++) {
      const momentObj = moment(startTime).add(i, 'd');
      if (filterWeekend && _.includes(filterWeekendDay, momentObj.days())) continue;
      days++;
    }

    return days * singleDayWidth(viewType);
  }
};

/**
 * 返回对应视图的对应时间轴数据
 * @param  {number} viewType  当前视图
 * @param  {[]} timeAxisSource
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {number}
 */
const getViewSumWidth = (viewType, timeAxisSource, filterWeekend) => {
  let days = 0;

  if (viewType === VIEWTYPE.DAY) {
    timeAxisSource.forEach((item) => {
      days += item.dateList.length;
    });
  }

  if (viewType === VIEWTYPE.WEEK) {
    timeAxisSource.forEach((items) => {
      items.dateList.forEach((item) => {
        days += item.length;
      });
    });
  }

  if (viewType === VIEWTYPE.MONTH) {
    timeAxisSource.forEach((items) => {
      items.dateList.forEach((item) => {
        const timeDiff = (moment(item).add(1, 'M') - moment(item)) / 24 / 60 / 60 / 1000;
        const startTime = item + '-01';

        for (let i = 0; i < timeDiff; i++) {
          const momentObj = moment(startTime).add(i, 'd');
          if (filterWeekend && _.includes(filterWeekendDay, momentObj.days())) continue;
          days++;
        }
      });
    });
  }

  return days * singleDayWidth(viewType);
};

/**
 * 返回滚动到当前的时间轴索引
 * @param  {number} value
 * @param  {[]} lefts
 * @return {number}
 */
const getScrollIndex = (value, lefts) => {
  let index = 0;
  while (lefts[index] <= value) {
    index++;
  }
  return index;
};

/**
 * 更新水平滚动条
 * @return void
 */
const syncUpdateScroll = () => {
  const scrollValue = $('.timeBarContainer').scrollLeft() * -1;
  const value = Math.abs(scrollValue);
  $('.timeAxisContent .timeAxisContentScroll').css('transform', `translateX(${scrollValue}px)`);
  // timeAxisMonths 类上文字的宽度
  const textWith = 65;
  const monthsEls = $('.timeAxisContent .timeAxisMonths');
  const monthsLeft = monthsEls.map((index, el) => {
    return el.offsetLeft;
  });
  const index = getScrollIndex(value, monthsLeft);
  if (value > monthsLeft[index] - textWith) {
    return;
  }
  monthsEls.eq(index + 1).css('padding-left', value - monthsLeft[index + 1]);
  monthsEls.eq(index).css('padding-left', 0);
  monthsEls.eq(index - 1).css('padding-left', value - monthsLeft[index - 1]);
};

/**
 * 获取展示时间所对应的位置
 * @param  {string} minStartTime
 * @param  {string} time
 * @param  {number} viewType  当前视图
 * @param  {boolean} filterWeekend  是否过滤周末
 * @return {number}
 */
const getTimePosition = (minStartTime, time, viewType, filterWeekend) => {
  // 周视图算出开始第一天
  if (viewType === VIEWTYPE.WEEK) {
    minStartTime = minStartTime[0];
  }
  // 月视图算出开始第一天
  if (viewType === VIEWTYPE.MONTH) {
    minStartTime = minStartTime + '-01';
  }
  const timeDate = moment(time).format('YYYY-MM-DD');
  // 差多少天
  let timeDiff = (moment(timeDate) - moment(minStartTime)) / 24 / 60 / 60 / 1000;
  // 真实天数
  let actualDays = 0;

  if (filterWeekend) {
    if (timeDiff >= 0) {
      // 偏移周不需要重复计算
      actualDays = Math.floor(timeDiff / 7) * (7 - filterWeekendDay.length);
      // 偏移天
      timeDiff = timeDiff % 7;

      for (let i = 0; i < timeDiff; i++) {
        const momentObj = moment(minStartTime).add(i, 'd');
        if (filterWeekend && _.includes(filterWeekendDay, momentObj.days())) continue;
        actualDays++;
      }
    } else {
      // 偏移周不需要重复计算
      actualDays = Math.ceil(timeDiff / 7) * (7 - filterWeekendDay.length);
      // 偏移天
      timeDiff = timeDiff % 7;

      for (let i = 0; i < Math.abs(timeDiff); i++) {
        const momentObj = moment(minStartTime).add(-i, 'd');
        if (filterWeekend && _.includes(filterWeekendDay, momentObj.days())) continue;
        actualDays += -1;
      }
    }
  } else {
    actualDays = timeDiff;
  }

  let hour = 0;
  // 特殊情况：因为时间已经在上面处理成合法的了，所以时间等于工作的开始时间  那就算计算开始时间的位置
  if (moment(time).format('HH:mm') !== workingTimes[0][0]) {
    hour = checkTime(timeDate + ' 00:00', time).showHourLong;
  }

  return (actualDays * workingSumHours + hour) * getOneHourWidth(viewType);
};

/**
 * 把小时转换为天
 * @param  {string} hour 小时
 * @return {object}
 */
const getDays = (hour) => {
  return {
    day: parseInt(hour / workingSumHours),
    hour: hour % workingSumHours,
  };
};

/**
 * 偏移天
 * @param  {object} currentTime 指定的时间
 * @param  {number} day 偏移的天数
 * @param  {boolean} filterWeekend 是否过滤周末
 * @return {string}
 */
const offsetDay = (currentTime, day, filterWeekend) => {
  // 如果不包含周末
  if (!filterWeekend) {
    currentTime = currentTime.add(day, 'd');
  } else {
    const isPositiveNumber = day > 0 ? 1 : -1;
    day = Math.abs(day);
    while (day) {
      currentTime = currentTime.add(isPositiveNumber, 'd');
      if (!_.includes(filterWeekendDay, currentTime.day())) {
        day--;
      }
    }
  }

  return currentTime.format('YYYY-MM-DD HH:00');
};

/**
 * 偏移开始时间（加）
 * @param  {object} currentTime 指定的时间
 * @param  {string} hour 偏移的小时
 * @return {object}
 */
const offsetStartPositiveHour = (currentTime, hour) => {
  let day = 0;

  for (let i = 0; i < hour; i++) {
    currentTime = currentTime.add(1, 'h');

    for (let j = 0; j < workingTimes.length; j++) {
      const workingStart = workingTimes[j][0];
      const workingEnd = workingTimes[j][1];

      if (currentTime.hour() >= parseInt(workingStart) && currentTime.hour() < parseInt(workingEnd)) {
        break;
      } else if (currentTime.hour() >= parseInt(workingTimes[workingTimes.length - 1][1])) {
        day++;
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${workingTimes[0][0]}`));
      } else if (currentTime.hour() === parseInt(workingEnd)) {
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${workingTimes[j + 1][0]}`));
      }
    }
  }

  return {
    day,
    time: currentTime.format('YYYY-MM-DD HH:00'),
  };
};

/**
 * 偏移开始时间（减）
 * @param  {object} currentTime 指定的时间
 * @param  {string} hour 偏移的小时
 * @return {object}
 */
const offsetStartNegativeHour = (currentTime, hour) => {
  let day = 0;
  for (let i = 0; i < hour; i++) {
    currentTime = currentTime.add(-1, 'h');
    for (let j = 0; j < workingTimes.length; j++) {
      const workingStart = workingTimes[j][0];
      const workingEnd = workingTimes[j][1];

      if (currentTime.hour() >= parseInt(workingStart) && currentTime.hour() < parseInt(workingEnd)) {
        break;
      } else if (currentTime.hour() <= parseInt(workingTimes[0][0])) {
        day--;
        const diff = parseInt(workingTimes[workingTimes.length - 1][1]) - 1;
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      } else if (currentTime.hour() === parseInt(workingStart)) {
        const diff = parseInt(workingTimes[j - 1][1]) - 1;
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      }
    }
  }

  return {
    day,
    time: currentTime.format('YYYY-MM-DD HH:00'),
  };
};

/**
 * 偏移结束时间（加）
 * @param  {object} currentTime 指定的时间
 * @param  {string} hour 偏移的小时
 * @return {object}
 */
const offsetEndPositiveHour = (currentTime, hour) => {
  let day = 0;
  for (let i = 0; i < hour; i++) {
    currentTime = currentTime.add(1, 'h');

    for (let j = 0; j < workingTimes.length; j++) {
      const workingStart = workingTimes[j][0];
      const workingEnd = workingTimes[j][1];

      if (currentTime.hour() > parseInt(workingStart) && currentTime.hour() <= parseInt(workingEnd)) {
        break;
      } else if (currentTime.hour() > parseInt(workingTimes[workingTimes.length - 1][1])) {
        day++;
        const diff = parseInt(workingTimes[0][0]) + 1;
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      } else if (currentTime.hour() === parseInt(workingStart)) {
        const diff = parseInt(workingStart) + 1;
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      }
    }
  }

  return {
    day,
    time: currentTime.format('YYYY-MM-DD HH:00'),
  };
};

/**
 * 偏移结束时间（减）
 * @param  {object} currentTime 指定的时间
 * @param  {string} hour 偏移的小时
 * @return {object}
 */
const offsetEndNegativeHour = (currentTime, hour) => {
  let day = 0;
  for (let i = 0; i < hour; i++) {
    currentTime = currentTime.add(-1, 'h');

    for (let j = 0; j < workingTimes.length; j++) {
      const workingStart = workingTimes[j][0];
      const workingEnd = workingTimes[j][1];

      if (currentTime.hour() > parseInt(workingStart) && currentTime.hour() <= parseInt(workingEnd)) {
        break;
      } else if (currentTime.hour() <= parseInt(workingTimes[0][0])) {
        day--;
        const diff = parseInt(workingTimes[workingTimes.length - 1][1]);
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      } else if (currentTime.hour() === parseInt(workingEnd)) {
        const diff = parseInt(workingEnd);
        currentTime = moment(currentTime.format(`YYYY-MM-DD ${diff < 10 ? `0${diff}` : diff}`));
      }
    }
  }

  return {
    day,
    time: currentTime.format('YYYY-MM-DD HH:00'),
  };
};

/**
 * 设置偏移时间
 * @param  {string} start 开始时间
 * @param  {string} end 结束时间
 * @param  {boolean} filterWeekend  是否过滤周末
 * @param  {number} offsetTime 偏移时间
 * @param  {string} minStartTime 最小时间
 * @param  {string} maxEndTime 最大时间
 * @param  {number} viewType 当前视图
 * @return {object}
 */
const offsetTime = (start, end, filterWeekend, offsetTime, minStartTime, maxEndTime, viewType) => {
  const startOffset = getDays(offsetTime);
  const endOffset = getDays(offsetTime);

  let startOffsetDay = startOffset.day;
  let endOffsetDay = endOffset.day;

  const workingStart = workingTimes[0][0];
  const workingEnd = workingTimes[workingTimes.length - 1][1];

  // 日视图
  if (viewType === VIEWTYPE.DAY) {
    minStartTime = minStartTime + ' ' + workingStart;
    maxEndTime = maxEndTime + ' ' + workingEnd;
  }
  // 周视图
  if (viewType === VIEWTYPE.WEEK) {
    minStartTime = minStartTime[0] + ' ' + workingStart;
    maxEndTime = maxEndTime[maxEndTime.length - 1] + ' ' + workingEnd;
  }
  // 月视图
  if (viewType === VIEWTYPE.MONTH) {
    minStartTime = minStartTime + '-01 ' + workingStart;
    maxEndTime =
      moment(maxEndTime)
        .add(1, 'M')
        .add(-1, 'd')
        .format('YYYY-MM-DD ') + workingEnd;
  }

  if (start) {
    if (startOffset.hour > 0) {
      const { day, time } = offsetStartPositiveHour(moment(start), startOffset.hour);
      start = time;
      startOffsetDay += day;
    } else if (startOffset.hour < 0) {
      const { day, time } = offsetStartNegativeHour(moment(start), Math.abs(startOffset.hour));
      start = time;
      startOffsetDay += day;
    }

    if (startOffsetDay !== 0) {
      start = offsetDay(moment(start), startOffsetDay, filterWeekend);
      // 单侧不允许超出时间视图
      if (moment(start) < moment(minStartTime) && config.singleDragTaskId) {
        start = minStartTime;
      }
    }
  }

  if (end) {
    if (endOffset.hour > 0) {
      const { day, time } = offsetEndPositiveHour(moment(end), endOffset.hour);
      end = time;
      endOffsetDay += day;
    } else if (endOffset.hour < 0) {
      const { day, time } = offsetEndNegativeHour(moment(end), Math.abs(endOffset.hour));
      end = time;
      endOffsetDay += day;
    }

    if (endOffsetDay !== 0) {
      end = offsetDay(moment(end), endOffsetDay, filterWeekend);
      // 单侧不允许超出时间视图
      if (moment(end) > moment(maxEndTime) && config.singleDragTaskId) {
        end = maxEndTime;
      }

      // 单侧拖拽
      if (config.singleDragTaskId) {
        config.isHiddenLastTips = false;
        // 日视图
        if (viewType === VIEWTYPE.DAY && moment(end) > moment(maxEndTime).add(-1, 'd')) {
          config.isHiddenLastTips = true;
        }
        // 周视图
        if (viewType === VIEWTYPE.WEEK && moment(end) > moment(maxEndTime).add(-2, 'd')) {
          config.isHiddenLastTips = true;
        }
        // 月视图
        if (viewType === VIEWTYPE.MONTH && moment(end) > moment(maxEndTime).add(-10, 'd')) {
          config.isHiddenLastTips = true;
        }
      }
    }
  }

  return {
    start,
    end,
  };
};

export default {
  getValidHours,
  checkTime,
  taskTimeBars,
  singleTaskSourceUpdate,
  updateTasksDataSource,
  getTimeAxisSource,
  getViewSumWidth,
  singleTableWidth,
  getOneHourWidth,
  syncUpdateScroll,
  getTimePosition,
  offsetTime,
};
