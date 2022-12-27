import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './taskTime.less';
import { connect } from 'react-redux';
import { getCurrentTime, formatTimeInfo } from '../../../utils/utils';
import config, { OPEN_TYPE } from '../../../config/config';
import { DateTime } from 'ming-ui/components/NewDateTimePicker';
import { afterUpdateTaskDateInfo, afterUpdateTaskDate } from '../../../utils/taskComm';
import { updateTaskStartTimeAndDeadline, updateTaskActualStartTime, updateCompletedTime } from '../../../redux/actions';
import moment from 'moment';

const TASK_STATUS = {
  nostart: -1,
  processing: 0,
  completed: 1,
};

const TASK_STATUS_TEXT = {
  '-1': _l('未开始'),
  '0': _l('进行中'),
  '1': _l('已完成'),
};

const COLORS = {
  gray: '#9e9e9e',
  blue: '#2196f3',
  green: '#30af00',
  red: '#ff0000',
  yellow: '#ffa414',
};

class TaskTime extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(status, startTime, endTime, actualStartTime, completeTime) {
    const currentTime = getCurrentTime();
    const taskStatusOpts = {};
    let diff;

    // 已完成
    if (status === TASK_STATUS.completed) {
      taskStatusOpts.status = TASK_STATUS.completed;
      // 无计划结束时间
      if (!endTime) {
        taskStatusOpts.text = '';
        taskStatusOpts.color = '';
      } else {
        diff = Math.ceil((moment(completeTime) - moment(endTime)) / 60 / 60 / 1000);

        if (diff === 0) {
          taskStatusOpts.text = _l('按时完成');
          taskStatusOpts.color = COLORS.green;
        } else if (diff < 0) {
          diff = Math.abs(diff);
          taskStatusOpts.text = diff < 24 ? _l('提前%0小时', diff) : _l('提前%0天', Math.floor(diff / 24));
          taskStatusOpts.color = COLORS.green;
        } else {
          taskStatusOpts.text = diff < 24 ? _l('逾期%0小时', diff) : _l('逾期%0天', Math.floor(diff / 24));
          taskStatusOpts.color = COLORS.red;
        }
      }

      return taskStatusOpts;
    }

    // 未开始
    if (startTime && (!actualStartTime || moment(currentTime) < moment(actualStartTime))) {
      taskStatusOpts.status = TASK_STATUS.nostart;
      diff = Math.ceil((moment(currentTime) - moment(startTime)) / 60 / 60 / 1000);

      if (diff === 0) {
        taskStatusOpts.text = _l('即将开始');
        taskStatusOpts.color = COLORS.blue;
      } else if (diff < 0) {
        diff = Math.abs(diff);
        taskStatusOpts.text = this.formatStartTimeText(diff);
        taskStatusOpts.color = diff < 24 ? COLORS.blue : COLORS.gray;
      } else {
        // 逾期未完成 优先级高
        if (endTime && moment(currentTime) > moment(endTime)) {
          diff = Math.ceil((moment(currentTime) - moment(endTime)) / 60 / 60 / 1000);
          taskStatusOpts.text = diff < 24 ? _l('逾期%0小时', diff) : _l('逾期%0天', Math.floor(diff / 24));
          taskStatusOpts.color = COLORS.red;
        } else {
          taskStatusOpts.text = diff < 24 ? _l('延期%0小时', diff) : _l('延期%0天', Math.floor(diff / 24));
          taskStatusOpts.color = COLORS.yellow;
        }
      }

      return taskStatusOpts;
    }

    // 进行中
    taskStatusOpts.status = TASK_STATUS.processing;
    taskStatusOpts.text = '';
    taskStatusOpts.color = '';

    if (endTime) {
      diff = Math.ceil((moment(currentTime) - moment(endTime)) / 60 / 60 / 1000);

      if (diff === 0) {
        taskStatusOpts.text = _l('即将截止');
        taskStatusOpts.color = COLORS.blue;
      } else if (diff < 0) {
        diff = Math.abs(diff);
        taskStatusOpts.text = this.formatEndTimeText(diff);
        taskStatusOpts.color = diff < 24 ? COLORS.blue : COLORS.gray;
      } else {
        taskStatusOpts.text = diff < 24 ? _l('逾期%0小时', diff) : _l('逾期%0天', Math.floor(diff / 24));
        taskStatusOpts.color = COLORS.red;
      }
    }

    return taskStatusOpts;
  }

  /**
   * 格式化开始时间
   */
  formatStartTimeText(diff) {
    const year = Math.floor(diff / 24 / 365);
    const month = Math.floor(diff / 24 / 30);
    const day = Math.floor(diff / 24);

    if (year > 0) {
      return _l('%0年后开始', year);
    }

    if (month > 0) {
      return _l('%0个月后开始', month);
    }

    if (day > 0) {
      return _l('%0天后开始', day);
    }

    return _l('%0小时后开始', diff);
  }

  /**
   * 格式化结束时间
   */
  formatEndTimeText(diff) {
    const year = Math.floor(diff / 24 / 365);
    const month = Math.floor(diff / 24 / 30);
    const day = Math.floor(diff / 24);

    if (year > 0) {
      return _l('还剩%0年', year);
    }

    if (month > 0) {
      return _l('还剩%0个月', month);
    }

    if (day > 0) {
      return _l('还剩%0天', day);
    }

    return _l('还剩%0小时', diff);
  }

  /**
   * 对比实际开始与计划开始
   */
  contrastActualOrPlan(startTime, actualStartTime) {
    let diff = Math.ceil((moment(actualStartTime) - moment(startTime)) / 60 / 60 / 1000);
    let text = '';

    if (diff === 0) {
      text = _l('按时开始');
    } else if (diff < 0) {
      diff = Math.abs(diff);
      text = diff < 24 ? _l('早于计划%0小时', diff) : _l('早于计划%0天', Math.floor(diff / 24));
    } else {
      text = diff < 24 ? _l('晚于计划%0小时', diff) : _l('晚于计划%0天', Math.floor(diff / 24));
    }

    return text;
  }

  /**
   * 时间进度线
   */
  taskProcessLines(status, startTime, endTime, actualStartTime, completeTime) {
    const currentTime = getCurrentTime();
    const mins = (moment(endTime) - moment(startTime)) / 60 / 1000; // 总分钟
    const processOpts = {
      yellow: {
        left: 0,
        width: 0,
      },
      blue: {
        left: 0,
        width: 0,
      },
      green: {
        left: 0,
        width: 0,
      },
      red: {
        left: 0,
        width: 0,
      },
    };

    // 逾期 计划存在   没有实际开始或者实际开始大于计划
    if (startTime && endTime && moment(currentTime) > moment(startTime) && ((!actualStartTime && !status) || moment(actualStartTime) > moment(startTime))) {
      if (actualStartTime && moment(currentTime) > moment(actualStartTime)) {
        processOpts.yellow.width = (moment(actualStartTime) - moment(startTime)) / 60 / 1000 / mins;
      } else {
        processOpts.yellow.width = (moment(currentTime) - moment(startTime)) / 60 / 1000 / mins;
      }

      if (processOpts.yellow.width > 1) {
        processOpts.yellow.width = 1;
      }
    }

    // 已完成
    if (status) {
      if (processOpts.yellow.width > 0) {
        processOpts.green.left = processOpts.yellow.width;
        processOpts.green.width = (moment(completeTime) - moment(actualStartTime)) / 60 / 1000 / mins;
        if (processOpts.green.width + processOpts.yellow.width > 1) {
          processOpts.green.width = 1 - processOpts.yellow.width;
        }
      } else {
        if (!startTime || !endTime) {
          processOpts.green.width = 1;
        } else {
          processOpts.green.width = (moment(completeTime) - moment(startTime)) / 60 / 1000 / mins;
          if (processOpts.green.width > 1) {
            processOpts.green.width = 1;
          }
        }
      }
    } else {
      // 延期
      if (endTime && moment(currentTime) > moment(endTime)) {
        if (processOpts.yellow.width < 1) {
          processOpts.red.left = processOpts.yellow.width;
          processOpts.red.width = 1 - processOpts.yellow.width;
        } else if (processOpts.yellow.width === 0) {
          processOpts.red.left = 0;
          processOpts.red.width = 1;
        }
      } else if (actualStartTime && moment(currentTime) > moment(actualStartTime)) {
        processOpts.blue.left = processOpts.yellow.width;
        // 实际小于计划
        if (moment(actualStartTime) < moment(startTime)) {
          processOpts.blue.width = (moment(currentTime) - moment(startTime)) / 60 / 1000 / mins;
        } else {
          processOpts.blue.width = (moment(currentTime) - moment(actualStartTime)) / 60 / 1000 / mins;
        }

        if (processOpts.blue.width + processOpts.yellow.width > 1) {
          processOpts.blue.width = 1 - processOpts.yellow.width;
        }
      }
    }

    return processOpts;
  }

  /**
   * 修改计划开始时间或计划结束时间
   */
  updatePlanTime(time, isUpdateStartTime) {
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const callback = (source) => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskDate(source);
      } else {
        this.props.updateCallback({ type: 'UPDATE_TASK_PLAN_TIME', tasks: source });
      }
    };

    if (isUpdateStartTime) {
      if (moment(time) > moment(data.deadline)) {
        alert(_l('计划开始时间不能晚于计划结束时间'), 2);
      } else if (!moment(time).isSame(moment(data.startTime))) {
        this.props.dispatch(updateTaskStartTimeAndDeadline(taskId, time, data.deadline, callback));
      }
    } else {
      if (moment(time) < moment(data.startTime)) {
        alert(_l('计划结束时间不能早于计划开始时间'), 2);
      } else if (!moment(time).isSame(moment(data.deadline))) {
        this.props.dispatch(updateTaskStartTimeAndDeadline(taskId, data.startTime, time, callback));
      }
    }
  }

  /**
   * 修改实际开始时间
   */
  updateTaskActualStartTime(actualStartTime) {
    const { taskId, openType } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const callback = () => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskDateInfo(taskId, data.startTime, data.deadline, actualStartTime, data.completeTime);
        afterUpdateTaskDate([{ taskId }]);
      } else {
        this.props.updateCallback({ type: 'UPDATE_TASK_ACTUAL_TIME', time: actualStartTime });
      }
    };

    if (!moment(actualStartTime).isSame(moment(data.actualStartTime))) {
      this.props.dispatch(updateTaskActualStartTime(taskId, actualStartTime, callback));
    }
  }

  /**
   * 修改完成时间
   */
  updateCompletedTime(completeTime) {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const callback = () => {
      if (openType === OPEN_TYPE.slide) {
        afterUpdateTaskDateInfo(taskId, data.startTime, data.deadline, data.actualStartTime, completeTime);
        afterUpdateTaskDate([{ taskId }]);
      } else {
        this.props.updateCallback({ type: 'UPDATE_TASK_COMPLETED_TIME', time: completeTime });
      }
    };

    if (!moment(completeTime).isSame(moment(data.completeTime))) {
      this.props.dispatch(updateCompletedTime(taskId, completeTime));
    }
  }

  /**
   * 获取今天的边距
   */
  getTodayBorderNum(processLines) {
    const width = $('.taskDetail').width() - 176;

    return {
      left: (processLines.blue.width + processLines.yellow.width) * width,
      right: (1 - processLines.blue.width - processLines.yellow.width) * width,
    };
  }

  render() {
    const { taskId } = this.props;
    const { data } = this.props.taskDetails[taskId];
    const hasAuth = data.auth === config.auth.Charger || data.auth === config.auth.Member;
    const { status, text, color } = this.getTaskStatus(data.status, data.startTime, data.deadline, data.actualStartTime, data.completeTime);
    const processLines = this.taskProcessLines(data.status, data.startTime, data.deadline, data.actualStartTime, data.completeTime);

    return (
      <div className="detailTime flexRow">
        <div className="mRight10 detailTimeIcon">
          <i
            className={cx(
              { 'icon-watch_later': status === TASK_STATUS.nostart },
              { 'icon-go_out': status === TASK_STATUS.processing },
              { 'icon-check_circle': status === TASK_STATUS.completed }
            )}
          />
        </div>
        <div className="detailTimeLabel">
          <div className="Font17">{TASK_STATUS_TEXT[status.toString()]}</div>
          <div style={{ color }}>{text}</div>
        </div>
        <div className="flex">
          <div className="flexRow">
            <div className="Font15 detailTimeMs">{_l('开始：')}</div>

            <div className={cx('Font15', { detailTimeNoSet: !data.startTime }, { detailTimeDate: hasAuth })}>
              <DateTime
                selectedValue={data.startTime || moment(getCurrentTime()).format('YYYY-MM-DD HH:00')}
                max={data.deadline ? moment(data.deadline).add(-1, 'h') : null}
                timePicker
                timeMode="hour"
                disabled={!hasAuth}
                onOk={e => this.updatePlanTime(e.format('YYYY-MM-DD HH:00'), true)}
                onClear={() => this.updatePlanTime('', true)}
              >
                {data.startTime ? formatTimeInfo(moment(data.startTime), true).text : _l('设置开始时间')}
              </DateTime>
            </div>

            <div className="flex" />

            <div className="Font15 detailTimeMs">{_l('结束：')}</div>

            <div className={cx('Font15', { detailTimeNoSet: !data.deadline }, { detailTimeDate: hasAuth })}>
              <DateTime
                selectedValue={data.deadline || moment(getCurrentTime()).add(1, 'h').format('YYYY-MM-DD HH:00')}
                min={data.startTime ? moment(data.startTime).add(1, 'h') : null}
                timePicker
                timeMode="hour"
                disabled={!hasAuth}
                onOk={e => this.updatePlanTime(e.format('YYYY-MM-DD HH:00'))}
                onClear={() => this.updatePlanTime('')}
              >
                {data.deadline ? formatTimeInfo(moment(data.deadline), true).text : _l('设置结束时间')}
              </DateTime>
            </div>
          </div>

          <div className="detailTimeLines">
            {Object.keys(processLines).map((key, i) => {
              if (processLines[key].width === 0) {
                return null;
              }

              return (
                <div
                  key={i}
                  className={cx('detailTimeLine', 'detailTimeLine-' + key)}
                  style={{ left: processLines[key].left * 100 + '%', width: processLines[key].width * 100 + '%' }}
                />
              );
            })}

            {processLines.blue.width > 0 ? (
              <div
                className={cx('detailTimeLineToday', { 'tip-bottom-left': this.getTodayBorderNum(processLines).right < 100 })}
                data-tip={_l('今天 %0', moment(getCurrentTime()).format('MMMDo'))}
                style={{ borderLeftWidth: this.getTodayBorderNum(processLines).left, borderRightWidth: this.getTodayBorderNum(processLines).right }}
              >
                <span />
              </div>
            ) : null}
          </div>

          <div className="flexRow">
            {data.actualStartTime || data.completeTime ? (
              <Fragment>
                <div className="detailTimeRealMs">{_l('实际开始于')}</div>
                <DateTime
                  selectedValue={data.actualStartTime}
                  max={data.completeTime ? moment(data.completeTime).add(-1, 'h') : null}
                  timePicker
                  timeMode="hour"
                  disabled={!hasAuth}
                  onOk={e => this.updateTaskActualStartTime(e.format('YYYY-MM-DD HH:00'))}
                  onClear={() => this.updateTaskActualStartTime('')}
                >
                  <span
                    className={cx(
                      'mLeft5 mRight5 detailTimeRealBold detailTimeRealColor',
                      { detailTimeRealStartColor: processLines.yellow.width > 0 },
                      { detailTimeRealLine: hasAuth }
                    )}
                  >
                    {data.actualStartTime ? formatTimeInfo(moment(data.actualStartTime), true).text : '...'}
                  </span>
                </DateTime>
                <div className="detailTimeRealMs">{data.actualStartTime && this.contrastActualOrPlan(data.startTime, data.actualStartTime)}</div>
              </Fragment>
            ) : data.startTime ? (
              <div
                className={cx('detailTimeNowStart ThemeColor3 ThemeBorderColor3', { 'pointer ThemeHoverColor2 ThemeHoverBorderColor2': hasAuth })}
                onClick={() => hasAuth && this.updateTaskActualStartTime(moment(getCurrentTime()).format('YYYY-MM-DD HH:00'))}
              >
                {_l('现在开始')}
              </div>
            ) : null}
            <div className="flex" style={{ minHeight: 22 }} />
            {data.completeTime ? (
              <Fragment>
                <div className="detailTimeRealMs">{_l('实际结束于')}</div>
                <DateTime
                  selectedValue={data.completeTime}
                  min={data.actualStartTime ? moment(data.actualStartTime).add(1, 'h') : null}
                  timePicker
                  timeMode="hour"
                  disabled={!hasAuth}
                  allowClear={false}
                  onOk={e => this.updateCompletedTime(e.format('YYYY-MM-DD HH:00'))}
                >
                  <span
                    className={cx(
                      'mLeft5 detailTimeRealBold detailTimeRealColor',
                      { detailTimeRealEndColor: data.deadline && moment(data.completeTime) > moment(data.deadline) },
                      { detailTimeRealLine: hasAuth }
                    )}
                  >
                    {formatTimeInfo(moment(data.completeTime), true).text}
                  </span>
                </DateTime>
              </Fragment>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(state => state.task)(TaskTime);
