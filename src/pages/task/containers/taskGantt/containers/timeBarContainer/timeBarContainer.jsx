import React, { Component } from 'react';
import { connect } from 'react-redux';
import config from '../../config/config';
import utils from '../../utils/utils';
import './timeBarContainer.less';
import {
  getTimeAxisSource,
  showOrHideTask,
  ganttDragRecordId,
  ganttDragRecordIndex,
  updateStartTimeAndEndTime,
  updateUserStatus,
} from '../../redux/actions';
import TimeBarFences from '../../component/timeBarFences/timeBarFences';
import TaskTimeBar from '../../component/taskTimeBar/taskTimeBar';
import ajaxRequest from 'src/api/taskCenter';
import { updateTimeError, updateTimeErrorDialog } from '../../../../components/updateTimeError/updateTimeError';
import TaskDetail from '../../../taskDetail/taskDetail';

class TimeBarContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openTaskDetail: false,
      taskId: '',
    };
  }

  componentDidMount() {
    const that = this;
    // 竖着滚动对应左侧竖着滚动  横向滚动对应时间条滚动
    $(this.timeBarContainer).on({
      mouseover() {
        config.scrollSelector = $(this);
      },
      scroll() {
        if (config.scrollSelector && !config.scrollSelector.is($('.ganttMembers .ganttMembersList'))) {
          $('.ganttMembers .ganttMembersList').scrollTop(this.scrollTop);
        }
        utils.syncUpdateScroll();
        // 无起止时间数据居中显示
        $('.timeBars.noDateList').css('padding-left', $('.timeBarContainer').scrollLeft() + 20);

        // 左侧接近触边加载数据 不是拖拽的时候加载
        if (!config.folderId && $(this).scrollLeft() < 50 && config.isReady && !config.isSingleDrag && !$('#ganttDragPreview').length) {
          const accountIds = [];
          that.props.accountTasksKV.forEach((item) => {
            if (!item.account.hidden) {
              accountIds.push(item.account.accountId);
            }
          });
          // 最小时间
          let startTime = '';
          if (that.props.stateConfig.currentView === config.VIEWTYPE.DAY) {
            startTime = moment(config.minStartTime)
              .add(-6, 'w')
              .format('YYYY-MM-DD HH:00');
          } else if (that.props.stateConfig.currentView === config.VIEWTYPE.WEEK) {
            startTime = moment(config.minStartTime)
              .add(-12, 'w')
              .format('YYYY-MM-DD HH:00');
          } else if (that.props.stateConfig.currentView === config.VIEWTYPE.MONTH) {
            startTime = moment(config.minStartTime)
              .add(-24, 'w')
              .format('YYYY-MM-DD HH:00');
          }
          const endTime = config.minStartTime;

          // 设置新的最小时间
          config.minStartTime = startTime;
          that.props.dispatch(getTimeAxisSource());
          that.props.getMoreSubordinateTasks(accountIds, startTime, endTime);
        }
      },
    });

    // 记录鼠标按下的位置
    $(document).on('mousedown.ganttDrag', '.timeBars .timeBar', (event) => {
      config.mouseOffset = {
        left: event.clientX,
        top: event.clientY,
      };
    });
  }

  /**
   * 显示或隐藏任务
   * @param  {number} index
   * @param  {string} id
   * @param  {number} arrowStatus
   */
  showOrHideTask(index, id, arrowStatus) {
    this.props.dispatch(showOrHideTask(index, id, arrowStatus));
  }

  /**
   * 任务时间条开始拖拽
   * @param  {string} taskId
   */
  ganttBeginDrag(taskId) {
    this.props.dispatch(ganttDragRecordId(taskId));
  }

  /**
   * 任务时间条拖拽经过他人
   * @param  {number} index  -1: 表示经过自己
   */
  ganttDragHover(index) {
    this.props.dispatch(ganttDragRecordIndex(index));
  }

  /**
   * 任务时间条放开拖拽
   * @param  {string} taskId
   */
  ganttEndDrop() {
    let timeLock = '';
    let chargeAccountId = '';
    // 开始时间不存在
    if (!config.newStartTime) {
      timeLock = false;
    } else if (!config.newEndTime) {
      // 结束时间不存在
      timeLock = true;
    }

    // 已经过别的用户
    if (this.props.stateConfig.dragHoverIndex !== -1) {
      chargeAccountId = this.props.accountTasksKV[this.props.stateConfig.dragHoverIndex].account.accountId;
    }

    this.updateTaskStartTimeAndDeadline(this.props.stateConfig.dragTaskId, timeLock, config.newStartTime, config.newEndTime, 0, chargeAccountId);
    this.ganttBeginDrag('');
    this.ganttDragHover(-1);
  }

  /**
   * 修改开始时间和截止时间
   * @param  {string} taskId
   * @param  {string or boolean} timeLock
   * @param  {string} startTime
   * @param  {string} endTime
   * @param  {number} updateType
   * @param  {string} chargeAccountId
   */
  updateTaskStartTimeAndDeadline(taskId, timeLock, startTime, endTime, updateType = 0, chargeAccountId = '') {
    ajaxRequest
      .updateTaskStartTimeAndDeadline({
        taskId,
        startTime,
        deadline: endTime,
        timeLock,
        chargeAccountId,
        updateType,
      })
      .then((source) => {
        config.isEndDrag = false;
        if (source.status) {
          // 是否更新时间轴视图
          let isUpdateTimeAxis = false;
          if (startTime && moment(startTime) < moment(config.minStartTime)) {
            config.minStartTime = startTime;
            isUpdateTimeAxis = true;
          }

          if (endTime && moment(endTime) > moment(config.maxEndTime)) {
            config.maxEndTime = endTime;
            isUpdateTimeAxis = true;
          }

          // 有变更更新时间轴视图
          if (isUpdateTimeAxis) {
            this.props.dispatch(getTimeAxisSource());
          }

          // 二次确认层
          if (source.data.updateTypes) {
            const callback = (updateType) => {
              this.updateTaskStartTimeAndDeadline(taskId, source.data.timeLock, startTime, endTime, updateType);
            };
            updateTimeErrorDialog(source, startTime, callback);
          }
        } else {
          updateTimeError(source);
        }
      });
  }

  /**
   * 修改视图的开始时间和截止时间
   * @param  {string} taskId
   * @param  {number} index
   * @param  {string} time
   * @param  {number} type
   * @param  {boolean} isReset
   */
  updateStartTimeAndEndTime(taskId, index, time, type, isReset = false) {
    this.props.dispatch(updateStartTimeAndEndTime(taskId, index, time, type, isReset));
  }

  /**
   * 修改用户配置展开缩起状态
   * @param  {string} accountId
   */
  updateUserStatus(accountId) {
    ajaxRequest.updateUserStatusOfSetting({
      projectId: config.projectId,
      accountId,
      isHidden: false,
    });

    this.props.dispatch(updateUserStatus(accountId, false));
    this.props.getMoreSubordinateTasks([accountId], config.minStartTime, '');
  }

  /**
   * 无下属和关注的同事上边距高度
   */
  taskTimeBarBoxStyle() {
    if (this.props.accountTasksKV.length === 2 && this.props.accountTasksKV[0].account.hidden && this.props.accountTasksKV[1].account.hidden) {
      return {
        paddingTop: $(document).height() - 338,
      };
    }

    return {};
  }

  /**
   * 打开任务详情
   */
  openTaskDetail = (taskId) => {
    this.setState({ openTaskDetail: true, taskId });
  };

  render() {
    const { accountTasksKV, stateConfig, timeAxisSource } = this.props;
    const currentView = stateConfig.currentView;
    const filterWeekend = stateConfig.filterWeekend;
    const minStartTime = timeAxisSource[0].dateList[0];
    const lastDateList = timeAxisSource[timeAxisSource.length - 1].dateList;
    const maxEndTime = lastDateList[lastDateList.length - 1];
    const dragTaskId = stateConfig.dragTaskId;
    const dragHoverIndex = stateConfig.dragHoverIndex;

    return (
      <div className="flex relative">
        <div
          className="timeBarContainer"
          ref={(timeBarContainer) => {
            this.timeBarContainer = timeBarContainer;
          }}
        >
          <div className="timeBarBox" style={{ width: utils.getViewSumWidth(currentView, timeAxisSource, filterWeekend) }}>
            <TimeBarFences viewType={currentView} timeAxisSource={timeAxisSource} filterWeekend={filterWeekend} />
            <div className="taskTimeBarBox" style={this.taskTimeBarBoxStyle()}>
              {accountTasksKV.map((item, i) => {
                return (
                  <TaskTimeBar
                    key={i}
                    item={item}
                    index={i}
                    dragTaskId={dragTaskId}
                    dragHoverIndex={dragHoverIndex}
                    viewType={currentView}
                    filterWeekend={filterWeekend}
                    minStartTime={minStartTime}
                    maxEndTime={maxEndTime}
                    updateUserStatus={this.updateUserStatus.bind(this)}
                    updateTaskStartTimeAndDeadline={this.updateTaskStartTimeAndDeadline.bind(this)}
                    updateStartTimeAndEndTime={this.updateStartTimeAndEndTime.bind(this)}
                    showOrHideTask={this.showOrHideTask.bind(this)}
                    ganttBeginDrag={this.ganttBeginDrag.bind(this)}
                    ganttDragHover={this.ganttDragHover.bind(this)}
                    ganttEndDrop={this.ganttEndDrop.bind(this)}
                    openTaskDetail={this.openTaskDetail}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div id="ganttDragPreviewBox" />
        <TaskDetail
          visible={this.state.openTaskDetail}
          taskId={this.state.taskId}
          openType={3}
          closeCallback={() => this.setState({ openTaskDetail: false })}
        />
      </div>
    );
  }
}

export default connect((state) => {
  const { accountTasksKV, stateConfig, timeAxisSource } = state.task;

  return {
    accountTasksKV,
    stateConfig,
    timeAxisSource,
  };
})(TimeBarContainer);
