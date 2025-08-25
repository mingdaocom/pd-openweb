import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { DragSource } from 'react-dnd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import Tooltip from 'ming-ui/components/Tooltip';
import { formatTaskTime } from '../../../../utils/utils';
import config from '../../config/config';
import utils from '../../utils/utils';
import DragPreview from '../dragPreview/dragPreview';
import './timeBars.less';

let root;

const ganttSource = {
  beginDrag(props, monitor, component) {
    // 触发拖拽单侧的时候也触发了拖拽整个的bug
    if (config.isSingleDrag) {
      return {};
    }

    $('body').addClass('ganttDraging');

    const dargDom = $(findDOMNode(component)).find('.timeBar')[0];
    const preview = dargDom.outerHTML;
    const componentRect = dargDom.getBoundingClientRect();
    config.offset = {
      x: config.mouseOffset.left - componentRect.left,
      y: config.mouseOffset.top - componentRect.top,
    };

    config.offsetX = componentRect.left;
    config.scrollLeft = $('.ganttMain .timeBarContainer').scrollLeft();
    config.originalStartTime = props.data.startTime;
    config.originalEndTime = props.data.deadline;
    config.oldStartTime = props.data.showStartTime;
    config.oldEndTime = props.data.showEndTime;

    if (config.SINGLE_TIME.START === props.data.singleTime) {
      config.oldEndTime = '';
    }

    if (config.SINGLE_TIME.END === props.data.singleTime) {
      config.oldStartTime = '';
    }

    root = createRoot(document.getElementById('ganttDragPreviewBox'));
    root.render(<DragPreview preview={preview} data={props.data} />);
    props.ganttBeginDrag(props.data.taskId);
    return {
      index: props.index,
      taskId: props.data.taskId,
    };
  },
  isDragging(props, monitor) {
    if (props.data.taskId !== monitor.getItem().taskId) return false;
    const preview = document.getElementById('ganttDragPreview');
    const clientOffset = monitor.getClientOffset();

    if (preview && clientOffset) {
      preview.style.left = clientOffset.x - config.offset.x + 'px';
      preview.style.top = clientOffset.y - config.offset.y + 'px';

      // 当前scrollLeft值
      const currentScrollLeft = $('.ganttMain .timeBarContainer').scrollLeft();
      // 计算偏移距离
      const diffLeft = clientOffset.x - config.offset.x + currentScrollLeft - config.offsetX - config.scrollLeft;
      // 计算偏移小时
      const diffHours = Math.floor(diffLeft / utils.getOneHourWidth(props.viewType));
      // 偏移小时相同的时候不重现换算
      if (config.diffHours === diffHours) {
        return false;
      }
      // 记录新的偏移小时
      config.diffHours = diffHours;

      // 无调整用原始时间显示
      if (diffHours === 0) {
        // 填充开始时间
        if (config.oldStartTime) {
          $(preview).find('.dragPreviewStartTime').html(moment(config.originalStartTime).format('Do HH'));
        }
        // 填充结束时间
        if (config.oldEndTime) {
          $(preview).find('.dragPreviewEndTime').html(moment(config.originalEndTime).format('Do HH'));
        }
      } else {
        const newTimes = utils.offsetTime(
          config.oldStartTime,
          config.oldEndTime,
          props.filterWeekend,
          diffHours,
          props.minStartTime,
          props.maxEndTime,
          props.viewType,
        );
        config.newStartTime = newTimes.start;
        config.newEndTime = newTimes.end;

        // 填充开始时间
        if (config.newStartTime) {
          $(preview).find('.dragPreviewStartTime').html(moment(config.newStartTime).format('Do HH'));
        }
        // 填充结束时间
        if (config.newEndTime) {
          $(preview).find('.dragPreviewEndTime').html(moment(config.newEndTime).format('Do HH'));
        }
      }

      // 处理滚动条滚动
      clearInterval(config.setInterval);
      config.setInterval = setInterval(() => {
        const $scroll = $('.ganttMain .timeBarContainer');
        const top = clientOffset.y - config.offset.y;
        const left = clientOffset.x - config.offset.x;

        // 竖着滚动
        if (top <= 210) {
          $scroll.scrollTop($scroll.scrollTop() - 100);
        } else if ($(window).height() - top <= 40) {
          $scroll.scrollTop($scroll.scrollTop() + 100);
        }

        // 横向滚动
        if (left <= 300 + $('.taskGanttContainer .ganttMembers').width()) {
          $scroll.scrollLeft($scroll.scrollLeft() - 100);
          utils.syncUpdateScroll();
        } else if ($(window).width() - left - $(preview).width() <= 50) {
          $scroll.scrollLeft($scroll.scrollLeft() + 100);
          utils.syncUpdateScroll();
        }
      }, 200);
    }
  },
  endDrag(props) {
    // 触发拖拽单侧的时候也触发了拖拽整个的bug
    if (config.isSingleDrag) {
      return;
    }

    config.isEndDrag = true;
    props.ganttEndDrop();
    clearInterval(config.setInterval);
    root.root();
    $('body').removeClass('ganttDraging');
  },
};

@DragSource(config.DRAG_GANTT, ganttSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class TimeBars extends Component {
  constructor(props) {
    super(props);

    this.state = {
      offsetX: 0,
    };
  }

  componentDidMount() {
    this.noDateListAlignLeft();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      _.isEqual(nextProps.data, this.props.data) &&
      this.props.viewType === nextProps.viewType &&
      this.props.filterWeekend === nextProps.filterWeekend &&
      nextProps.dragTaskId !== nextProps.data.taskId &&
      this.props.dragTaskId !== this.props.data.taskId &&
      nextState.offsetX === this.state.offsetX &&
      nextProps.data.taskId !== config.singleDragTaskId &&
      this.props.data.taskId !== config.singleDragTaskId &&
      this.getTimeBarStyle().left !== parseInt($(this.timeBars).css('left'))
    ) {
      return false;
    }

    return true;
  }

  componentDidUpdate() {
    this.noDateListAlignLeft();
  }

  /**
   * 无起止时间数据左对齐
   */
  noDateListAlignLeft() {
    $(this.timeBars).css(
      'padding-left',
      this.props.data.showHourLong === 0 ? $('.timeBarContainer').scrollLeft() + 20 : 0,
    );
  }

  /**
   * 单侧拖拽move绑定
   * @param  {number} direction
   */
  dragMouseMove(direction) {
    const that = this;

    $(document).on({
      'mousemove.ganttDragSingle': function (evt) {
        evt.stopPropagation();
        // 当前scrollLeft值
        const currentScrollLeft = $('.ganttMain .timeBarContainer').scrollLeft();
        // 计算偏移距离
        const diffLeft = evt.clientX + currentScrollLeft - config.offsetX - config.scrollLeft;
        // 计算偏移小时
        const diffHours = Math.floor(diffLeft / utils.getOneHourWidth(that.props.viewType));
        // 新的时间
        let { start, end } = utils.offsetTime(
          config.oldStartTime,
          config.oldEndTime,
          that.props.filterWeekend,
          diffHours,
          that.props.minStartTime,
          that.props.maxEndTime,
          that.props.viewType,
        );
        // 清除滚动
        clearInterval(config.setInterval);

        // 拖拽左侧
        if (direction === config.DRAG_DIRECTION.LEFT) {
          if (moment(start) >= moment(config.originalEndTime)) {
            start = moment(config.originalEndTime).add(-1, 'h').format('YYYY-MM-DD HH:mm');
          }
          // 新时间
          config.newStartTime = start;
          // 更新开始时间
          that.props.updateStartTimeAndEndTime(config.singleDragTaskId, that.props.index, start, direction);
          // 处理滚动条
          that.dragTriggerScroll(evt);
        }
        // 拖拽右侧
        if (direction === config.DRAG_DIRECTION.RIGHT) {
          if (moment(end) <= moment(config.originalStartTime)) {
            end = moment(config.originalStartTime).add(1, 'h').format('YYYY-MM-DD HH:mm');
          }
          // 新时间
          config.newEndTime = end;
          // 更新结束时间
          that.props.updateStartTimeAndEndTime(config.singleDragTaskId, that.props.index, end, direction);
          // 处理滚动条
          that.dragTriggerScroll(evt);
        }
      },
      'mouseup.ganttDragSingle': function (evt) {
        evt.stopPropagation();

        // 修改开始时间
        if (direction === config.DRAG_DIRECTION.LEFT && config.newStartTime) {
          // 更新
          that.props.updateTaskStartTimeAndDeadline(config.singleDragTaskId, true, config.newStartTime, '');
          // 数据先恢复到初始状态
          that.props.updateStartTimeAndEndTime(
            config.singleDragTaskId,
            that.props.index,
            config.oldStartTime,
            direction,
            true,
          );
        }

        // 修改结束时间
        if (direction === config.DRAG_DIRECTION.RIGHT && config.newEndTime) {
          // 更新
          that.props.updateTaskStartTimeAndDeadline(config.singleDragTaskId, false, '', config.newEndTime);
          // 数据先恢复到初始状态
          that.props.updateStartTimeAndEndTime(
            config.singleDragTaskId,
            that.props.index,
            config.oldEndTime,
            direction,
            true,
          );
        }

        // 单侧拖拽结束
        config.isEndDrag = true;
        config.isSingleDrag = false;
        config.singleDragTaskId = '';

        // 清除滚动
        clearInterval(config.setInterval);

        $(document).off('mousemove.ganttDragSingle');
        $(document).off('mouseup.ganttDragSingle');
      },
    });
  }

  /**
   * 左侧拖拽绑定
   * @param  {object} evt
   */
  timeBarDragLeft(evt) {
    config.isSingleDrag = true;
    config.offsetX = evt.clientX;
    config.scrollLeft = $('.ganttMain .timeBarContainer').scrollLeft();
    config.oldStartTime = this.props.data.showStartTime;
    config.oldEndTime = '';
    config.originalEndTime = this.props.data.showEndTime;
    config.singleDragTaskId = this.props.data.taskId;
    config.recordSingleTime = this.props.data.singleTime;

    evt.stopPropagation();
    this.dragMouseMove(config.DRAG_DIRECTION.LEFT);
  }

  /**
   * 右侧拖拽绑定
   * @param  {object} evt
   */
  timeBarDragRight(evt) {
    config.isSingleDrag = true;
    config.offsetX = evt.clientX;
    config.scrollLeft = $('.ganttMain .timeBarContainer').scrollLeft();
    config.oldStartTime = '';
    config.oldEndTime = this.props.data.showEndTime;
    config.originalStartTime = this.props.data.showStartTime;
    config.singleDragTaskId = this.props.data.taskId;
    config.recordSingleTime = this.props.data.singleTime;

    evt.stopPropagation();
    this.dragMouseMove(config.DRAG_DIRECTION.RIGHT);
  }

  /**
   * 拖拽碰到边触发滚动条滚动
   * @param  {object} evt
   */
  dragTriggerScroll(evt) {
    // 处理滚动条滚动
    config.setInterval = setInterval(() => {
      const $scroll = $('.ganttMain .timeBarContainer');
      const left = evt.clientX;

      // 横向滚动
      if (left <= 460) {
        $scroll.scrollLeft($scroll.scrollLeft() - 100);
        utils.syncUpdateScroll();
      } else if ($(window).width() - left <= 50) {
        $scroll.scrollLeft($scroll.scrollLeft() + 100);
        utils.syncUpdateScroll();
      }
    }, 200);
  }

  /**
   * 获取任务时间对应的位置
   * @param  {string} time
   * @param  {string} startTime
   * @return {number}
   */
  getTimePosition(time, startTime) {
    const { viewType, filterWeekend, minStartTime } = this.props;
    return utils.getTimePosition(startTime || minStartTime, time, viewType, filterWeekend);
  }

  /**
   * 获取任务时间块样式
   * @return {object}
   */
  getTimeBarStyle() {
    const { data, row, filterWeekend } = this.props;
    const style = {
      top: row * 26 + 10,
    };

    // 无有效时长 文案居中 无背景色
    if (data.showHourLong === 0) {
      style.left = 0;
      style.right = 0;
      style.background = 'rgba(240, 240, 240, .7)';

      return style;
    }

    // 只有开始时间
    if (data.singleTime === config.SINGLE_TIME.START) {
      style.left = this.getTimePosition(data.showStartTime);
      style.right = 0;

      return style;
    }

    // 只有结束时间
    if (data.singleTime === config.SINGLE_TIME.END) {
      style.left = 0;
      let endTime = config.timeStamp;
      if (data.status === config.TASKSTATUS.COMPLETED) {
        endTime = moment(data.completeTime).add(1, 'h').format('YYYY-MM-DD HH:mm');
      }

      if (moment(endTime) <= moment(data.showEndTime)) {
        style.width =
          this.getTimePosition(data.showEndTime) +
          (data.taskId !== config.singleDragTaskId ? config.TASK_NAME_SIZE : 0);
      } else {
        // 结束时间的有效日期
        const validEndTime = utils.checkTime(data.showStartTime, endTime, filterWeekend).showEndTime;
        style.width =
          this.getTimePosition(validEndTime) + (data.taskId !== config.singleDragTaskId ? config.TASK_NAME_SIZE : 0);
      }

      return style;
    }

    style.left = this.getTimePosition(data.showStartTime);
    return style;
  }

  /**
   * 获取颜色条样式
   * @return {string}
   */
  getBGColor() {
    const { data } = this.props;

    // 有效时长是0时无颜色
    if (data.showHourLong === 0) {
      return 'transparent';
    }

    // 已完成
    if (data.status === config.TASKSTATUS.COMPLETED) {
      return '#81c784'; // 绿色
    }

    // 只有开始时间
    if (data.singleTime === config.SINGLE_TIME.START) {
      return '#64b5f6'; // 蓝色
    }

    // 服务器时间 小于等于当前时间
    if (moment(config.timeStamp) <= moment(data.deadline)) {
      return '#64b5f6'; // 蓝色
    }

    return '#ff7043'; // 红色
  }

  /**
   * 获取颜色条样式
   * @return {object}
   */
  getColorBlockStyle() {
    const { data, viewType } = this.props;

    const style = {
      width: utils.getOneHourWidth(viewType) * data.showHourLong,
      background: this.getBGColor(),
    };

    // 宽度大于72时圆角10px
    if (style.width >= 72) {
      style.borderRadius = 10;
    }

    return style;
  }

  /**
   * 获取子母任务展开收起按钮样式
   * @return {object}
   */
  timeBarArrowBtnStyle() {
    const { data } = this.props;

    // 无起止时间
    if (data.showHourLong === 0) {
      return {
        marginRight: -8,
        marginLeft: -12,
      };
    }

    // 有起止时间 或 只有开始时间 或 singleTime 不存在表示正在拖拽无数据一侧的情况下
    if ((data.startTime && data.deadline) || data.singleTime === config.SINGLE_TIME.START || !data.singleTime) {
      return {
        marginLeft: -20,
      };
    }

    // 只有结束时间
    return {
      marginLeft: this.getTimePosition(data.showStartTime) - 28,
    };
  }

  /**
   * 获取箭头样式
   * @return {object}
   */
  timeBarArrowStyle() {
    const { data } = this.props;

    // 只有开始时间 箭头画右边
    if (data.singleTime === config.SINGLE_TIME.START) {
      return {
        borderLeftColor: this.getBGColor(),
      };
    }

    // 只有结束时间 箭头画左边
    if (data.singleTime === config.SINGLE_TIME.END) {
      return {
        borderRightColor: this.getBGColor(),
        marginLeft: data.arrowStatus === config.ARROW_STATUS.NULL ? this.getTimePosition(data.showStartTime) - 16 : -8,
      };
    }
  }

  /**
   * 获取单侧补足线的样式
   * @return {object}
   */
  timeBarDashedStyle() {
    const { data } = this.props;
    // 默认淡红色
    const style = {
      background: '#fbe9e7',
    };

    if (data.singleTime === config.SINGLE_TIME.START) {
      style.right = 0;
      style.borderTopLeftRadius = 10;
      style.borderBottomLeftRadius = 10;
    } else {
      style.width = this.getTimePosition(data.showStartTime);
    }

    // 只有开始时间 || 服务器时间 小于等于 当前结束时间
    if (data.singleTime === config.SINGLE_TIME.START || moment(config.timeStamp) <= moment(data.deadline)) {
      // 淡灰色
      style.background = 'rgba(240, 240, 240, .7)';
    }

    // 已完成
    if (data.status === config.TASKSTATUS.COMPLETED) {
      // 淡绿色
      style.background = '#e8f5e9';
    }

    return style;
  }

  /**
   * 获取超期几小时
   * @return {number}
   */
  getOverdueHour() {
    const { data, filterWeekend } = this.props;
    let endTime = config.timeStamp;

    if (data.status === config.TASKSTATUS.COMPLETED) {
      endTime = moment(data.completeTime).add(1, 'h').format('YYYY-MM-DD HH:00');
    }

    if (moment(endTime) <= moment(data.showEndTime)) {
      return 0;
    }

    return utils.checkTime(data.showStartTime, endTime, filterWeekend).showHourLong - data.showHourLong;
  }

  /**
   * 获取超期文案
   * @return {jsx}
   */
  getOverdueMessage() {
    const { data } = this.props;

    // 拖的时候不呈现超期文案
    if (data.taskId === config.singleDragTaskId) {
      return '';
    }

    const hours = Math.ceil((moment(data.completeTime || config.timeStamp) - moment(data.deadline)) / 60 / 60 / 1000);
    if (this.getOverdueHour() * utils.getOneHourWidth(this.props.viewType) >= config.TASK_MESSAGE_SIZE) {
      return (
        <span className="timeBarMessageP">
          {hours < 24 ? _l('逾期%0小时', hours) : _l('逾期%0天', Math.floor(hours / 24))}
        </span>
      );
    }
  }

  /**
   * 显示或隐藏任务
   */
  showOrHideTask() {
    const { data, index } = this.props;
    config.isEndDrag = true;
    this.props.showOrHideTask(
      index,
      data.taskId,
      data.arrowStatus === config.ARROW_STATUS.OPEN ? config.ARROW_STATUS.CLOSED : config.ARROW_STATUS.OPEN,
    );
  }

  /**
   * 打开任务详情弹层
   */
  openTaskDetailDialog() {
    if (!config.isEndDrag) {
      this.props.openTaskDetail(this.props.data.taskId);
    } else {
      config.isEndDrag = false;
    }
  }

  /**
   * tip 完成时间message
   */
  tooltipTimeMessage() {
    const { data } = this.props;

    // 未指定起止时间
    if (!data.startTime && !data.deadline) {
      return '';
    }

    // 未完成
    if (data.status === config.TASKSTATUS.NO_COMPLETED) {
      // 未指定截止时间 或 系统时间小于截止时间
      if (!data.deadline || moment(config.timeStamp) <= moment(data.deadline)) {
        return '';
      }
    }

    return (
      <div
        className="Font13"
        dangerouslySetInnerHTML={{
          __html: formatTaskTime(data.status, data.startTime, data.deadline, data.actualStartTime, data.completeTime),
        }}
      />
    );
  }

  /**
   * tip 文案
   */
  tooltip() {
    const { data } = this.props;
    return (
      <div>
        <div className="Font13" style={{ lineHeight: '18px', width: 200, wordBreak: 'break-all' }}>
          {data.taskName}
        </div>
        <div>
          <span style={{ color: '#757575' }}>{_l('开始：')}</span>
          {data.startTime ? moment(data.startTime).format('YYYY/MM/DD HH:00') : '--'}
        </div>

        {data.status === config.TASKSTATUS.COMPLETED ? (
          <div>
            <span style={{ color: '#757575' }}>{_l('完成：')}</span>
            {moment(data.completeTime).format('YYYY/MM/DD HH:mm')}
          </div>
        ) : (
          <div>
            <span style={{ color: '#757575' }}>{_l('截止：')}</span>
            {data.deadline ? moment(data.deadline).format('YYYY/MM/DD HH:00') : '--'}
          </div>
        )}

        {this.tooltipTimeMessage()}
      </div>
    );
  }

  /**
   * tips计算偏移量
   */
  onMouseOver(evt) {
    let offsetX = evt.clientX - $(evt.currentTarget).offset().left - $(evt.currentTarget).outerWidth() / 2;

    // 右边不够放
    if ($(window).width() - evt.clientX < 120) {
      offsetX -= 120 - $(window).width() + evt.clientX;
    }

    this.setState({
      offsetX,
    });
  }

  render() {
    const { data, viewType, connectDragSource, dragTaskId } = this.props;
    const timeBarStyle = this.getColorBlockStyle();
    const offset = [this.state.offsetX, 1];

    return (
      <Tooltip
        popupPlacement="top"
        text={this.tooltip()}
        themeColor="white"
        mouseEnterDelay={0.5}
        offset={offset}
        overflow={[0, 0]}
        autoCloseDelay={0}
      >
        <div
          className={cx(
            'timeBars pointer',
            { isDragging: data.taskId === dragTaskId },
            { noDateList: data.showHourLong === 0 },
          )}
          style={this.getTimeBarStyle()}
          ref={timeBars => {
            this.timeBars = timeBars;
          }}
          onMouseOver={evt => this.onMouseOver(evt)}
          onClick={() => this.openTaskDetailDialog()}
        >
          {data.singleTime === config.SINGLE_TIME.START || data.singleTime === config.SINGLE_TIME.END ? (
            <span className="timeBarDashed" style={this.timeBarDashedStyle()} />
          ) : undefined}

          {data.arrowStatus !== config.ARROW_STATUS.NULL ? (
            <span className="timeBarArrowBtn" style={this.timeBarArrowBtnStyle()} onClick={() => this.showOrHideTask()}>
              <i
                className={cx(
                  data.arrowStatus === config.ARROW_STATUS.OPEN ? 'icon-remove_circle_outline' : 'icon-add_circle',
                )}
              />
            </span>
          ) : undefined}

          {data.singleTime === config.SINGLE_TIME.END ? (
            <span className="timeBarArrow timeBarArrowLeft" style={this.timeBarArrowStyle()} />
          ) : undefined}

          {data.showHourLong === 0 ? undefined : data.status === config.TASKSTATUS.COMPLETED ? (
            <span
              className={cx(
                'timeBar pointer',
                { clearLeftBorder: data.singleTime === config.SINGLE_TIME.END },
                { clearRightBorder: data.singleTime === config.SINGLE_TIME.START },
              )}
              style={timeBarStyle}
            />
          ) : (
            connectDragSource(
              <span
                className={cx(
                  'timeBar',
                  { clearLeftBorder: data.singleTime === config.SINGLE_TIME.END },
                  { clearRightBorder: data.singleTime === config.SINGLE_TIME.START },
                )}
                style={timeBarStyle}
              >
                <div>
                  {timeBarStyle.width < 8 ? undefined : (
                    <i
                      className={cx('timeBarDragLeft', { dragBigRadius: timeBarStyle.width >= 72 })}
                      onMouseDown={evt => this.timeBarDragLeft(evt)}
                    />
                  )}

                  <i
                    className={cx('timeBarDragRight', { dragBigRadius: timeBarStyle.width >= 72 })}
                    onMouseDown={evt => this.timeBarDragRight(evt)}
                  />

                  {data.taskId === config.singleDragTaskId && config.oldStartTime ? (
                    <div className="dragPreviewTipsLeft">{moment(data.showStartTime).format('Do HH')}</div>
                  ) : undefined}

                  {data.taskId === config.singleDragTaskId && config.oldEndTime && !config.isHiddenLastTips ? (
                    <div className="dragPreviewTipsRight">{moment(data.showEndTime).format('Do HH')}</div>
                  ) : undefined}
                </div>
              </span>,
            )
          )}

          {data.singleTime === config.SINGLE_TIME.START ? (
            <span className="timeBarArrow timeBarArrowRight" style={this.timeBarArrowStyle()} />
          ) : undefined}

          {data.deadline ? (
            <span
              className={cx(
                'timeBarOverdue',
                { Hidden: utils.getOneHourWidth(viewType) * this.getOverdueHour() === 0 },
                { timeBarOverdueStyle: timeBarStyle.width >= 72 },
              )}
              style={{ width: utils.getOneHourWidth(viewType) * this.getOverdueHour() }}
            >
              {this.getOverdueMessage()}
            </span>
          ) : undefined}

          {data.taskId !== config.singleDragTaskId ? (
            <span
              className={cx(
                'overflow_ellipsis',
                { noDateColor: data.showHourLong === 0 },
                { timeBarTaskName: data.status === config.TASKSTATUS.COMPLETED },
              )}
            >
              {data.taskName}
            </span>
          ) : undefined}
        </div>
      </Tooltip>
    );
  }
}
