import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import cx from 'classnames';
import _ from 'lodash';
import LunarCalendar from 'lunar-calendar';
import moment from 'moment';
import { Icon, LoadDiv } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetAjax from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { saveView, updateWorksheetControls } from 'src/pages/worksheet/redux/actions';
import * as Actions from 'src/pages/worksheet/redux/actions/calendarview';
import { getAdvanceSetting } from 'src/utils/control';
import { isLightColor } from 'src/utils/control';
import { addBehaviorLog, dateConvertToServerZone } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import SelectField from '../components/SelectField';
import SelectFieldForStartOrEnd from '../components/SelectFieldForStartOrEnd';
import { eventDidMount } from './CalendarEvent';
import CalendarIds from './CalendarIds';
import { CALENDAR_BUTTON_TEXT, CALENDAR_VIEW_FORMATS, TAB_LIST } from './constants';
import External from './External';
import { Wrap, WrapNum } from './styles';
import { getCalendartypeData, getHoverColor, getRows, getShowExternalData, isIllegalFormat, isTimeStyle } from './util';
import {
  changeEndStr,
  getCurrentView,
  getTimeControls,
  renderLine,
  resetFcEventDraggingPoint,
  setShowTip,
} from './util';
import './index.less';

let time;
let clickData = null;

const getCanNew = props => {
  const { worksheetInfo = {}, allowAddNewRecord = true, sheetSwitchPermit } = props;
  return isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && worksheetInfo.allowAdd && allowAddNewRecord;
};
@autoSize
class RecordCalendar extends Component {
  constructor(props) {
    super(props);
    this.calendarComponentRef = React.createRef();
    this.state = {
      showExternal: false,
      recordInfoVisible: false,
      scrollType: null,
      unselectAuto: false,
      isSearch: false,
      isLoading: false,
      height: props.height,
      canNew: getCanNew(props),
      calendarFormatData: [],
      showChoose: false,
      selectTimeInfo: {},
      changeData: null,
      popupVisible: '',
      addDataList: [],
      random: parseInt(Math.random() * 1000000000000),
      fullCalendarKey: JSON.stringify(Math.random()),
      isMove: false,
    };
  }
  componentDidMount() {
    this.setState({
      canNew: getCanNew(this.props),
    });
    this.getFormatData(this.props);
    this.props.getCalendarData();
    this.props.fetchExternal();
    this.getEventsFn();
  }

  componentWillReceiveProps(nextProps) {
    const { base, calendarview = {}, height, sheetSwitchPermit } = nextProps;
    if (
      !_.isEqual(sheetSwitchPermit, this.props.sheetSwitchPermit) ||
      _.get(nextProps, 'worksheetInfo.allowAdd') !== _.get(this.props, 'worksheetInfo.allowAdd')
    ) {
      this.setState({
        canNew: getCanNew(nextProps),
      });
    }
    const { calendarData = {}, calendarFormatData } = calendarview;
    const { viewId } = base;
    const currentView = getCurrentView(nextProps);
    const preView = getCurrentView(this.props);
    const { initialView } = calendarData;
    if (nextProps.height !== this.props.height) {
      $('.boxCalendar,.calendarCon,.fc-daygrid-body,.fc-scrollgrid-sync-table,.fc-col-header ').width('100%');
      this.setState({ height });
    }
    if (!_.isEqual(calendarFormatData, (this.props.calendarview || {}).calendarFormatData)) {
      this.getFormatData(nextProps);
    }
    if (viewId !== this.props.base.viewId || !_.isEqual(currentView, preView)) {
      nextProps.getCalendarData();
      this.calendarComponentRef.current && this.calendarComponentRef.current.getApi().changeView(initialView); // 更改视图类型
      nextProps.fetchExternal();
      this.getEventsFn();
      this.setState({ fullCalendarKey: JSON.stringify(Math.random()) });
    }
    if (
      viewId !== this.props.base.viewId ||
      getAdvanceSetting(currentView).begindate !== getAdvanceSetting(preView).begindate ||
      getAdvanceSetting(currentView).colorid !== getAdvanceSetting(preView).colorid ||
      getAdvanceSetting(currentView).calendarcids !== getAdvanceSetting(preView).calendarcids ||
      getAdvanceSetting(currentView).viewtitle !== getAdvanceSetting(preView).viewtitle
    ) {
      // 切换视图，或更改开始时间字段 重新更新排期数据
      nextProps.refreshEventList();
      nextProps.fetchExternal();
      this.setState({ isSearch: false });
    }
    if (
      !_.isEqual(initialView, this.props.calendarview.calendarData.initialView) &&
      this.calendarComponentRef.current
    ) {
      this.calendarComponentRef.current.getApi().changeView(initialView); // 更改视图类型
    }
  }

  componentDidUpdate() {
    if (this.calendarComponentRef.current) {
      const { base } = this.props;
      const { viewId, worksheetId } = base;
      let view = this.calendarComponentRef.current.getApi().view;
      let data = getCalendartypeData();
      data[`${worksheetId}-${viewId}`] = view.type;
      safeLocalStorageSetItem('CalendarViewType', JSON.stringify(data));
    }
  }

  dbClickDay = () => {
    if (clickData) {
      this.selectFn(clickData);
    }
  };

  calendarActionOff = () => {
    const { random } = this.state;
    const $el = document.querySelector(`.boxCalendar_${random} .fc-view-harness-active`);
    if ($el) {
      $el.removeEventListener('dblclick', this.dbClickDay);
    }
    $(`.boxCalendar_${random} .fc-toolbar-chunk`).off('click');
  };

  calendarActionFn = () => {
    const { random } = this.state;
    if (!window.isSafari) {
      document
        .querySelector(`.boxCalendar_${random} .fc-view-harness-active`)
        .addEventListener('dblclick', this.dbClickDay, true);
    }
    $(`.boxCalendar_${random} .fc-toolbar-chunk`)
      .last()
      .on('click', () => {
        this.getEventsFn();
      });
  };

  getEventsFn = () => {
    setTimeout(() => {
      if (!this.calendarComponentRef.current) {
        return;
      }
      const { filters } = this.props;
      let view = this.calendarComponentRef.current.getApi().view;
      let beginTime = moment(view.activeStart).format('YYYY-MM-DD HH:mm');
      let endTime = moment(view.activeEnd).format('YYYY-MM-DD HH:mm');
      let searchData = {
        beginTime,
        endTime,
      };
      this.props.changeCalendarTime(beginTime, endTime);
      this.props.fetch(Object.assign({}, filters, searchData));
      renderLine(this.state.random, getCurrentView(this.props));
    }, 200);
  };

  getFormatData = nextProps => {
    const { calendarview = {}, base = {} } = nextProps;
    const { calendarFormatData = [] } = calendarview;
    const { worksheetId, viewId } = base;
    this.setState({
      showExternal: (getShowExternalData() || []).includes(`${worksheetId}-${viewId}`),
      calendarFormatData,
    });
  };

  updateData = (newOldControl, rowId, cb) => {
    const { base, updataEditable } = this.props;
    const { appId, worksheetId, viewId } = base;
    updataEditable(false);
    worksheetAjax
      .updateWorksheetRow({
        rowId,
        appId,
        worksheetId,
        viewId,
        newOldControl,
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          this.getEventsFn();
          if (cb) {
            cb(data);
          }
          clickData = null;
          this.setState({
            changeData: null,
          });
        }
      });
  };

  // 显示农历
  getLunar = item => {
    const { unlunar } = getAdvanceSetting(getCurrentView(this.props)); // 默认显示农历
    if (unlunar !== '0') {
      return '';
    }
    let data = LunarCalendar.solarToLunar(item.date.getFullYear(), item.date.getMonth() + 1, item.date.getDate());
    return (
      <React.Fragment>
        {(item.view.type === 'timeGridWeek' ||
          item.view.type === 'dayGridWeek' ||
          item.view.type === 'dayGridMonth') && <span className="lunar">{data.lunarDayName}</span>}
        {(item.view.type === 'timeGridDay' || item.view.type === 'dayGridDay') && (
          <span className="lunar">{`${data.GanZhiYear}${data.lunarMonthName}${data.lunarDayName}`}</span>
        )}
      </React.Fragment>
    );
  };

  changeEventFn = info => {
    let endData = _.get(info, ['data', 'endData']);
    let startData = _.get(info, ['data', 'startData']) || {};
    let dateStr = info.dateStr;
    let startTime;
    const { rowId, calendar = {} } = info;
    if (info.allDay) {
      // YYYY-MM-DD
      let str = calendar.start
        ? `${dateStr} ${moment(calendar.start).format('YYYY-MM-DD HH:mm').substring(11)}`
        : `${dateStr} 08:00`;
      startTime = isTimeStyle(startData) ? str : dateStr;
    } else {
      // 'YYYY-MM-DD HH:mm'
      startTime = moment(dateStr).format(_.get(info, ['data', 'startFormat']));
    }
    let control = [
      {
        controlId: startData.controlId,
        controlName: startData.controlName,
        type: startData.type,
        value: isTimeStyle(startData) ? dateConvertToServerZone(startTime) : startTime,
      },
    ];
    if (endData && calendar.end) {
      // 开始时间与拖拽时间的时间差
      let l = moment(startTime).valueOf() - moment(calendar.start).valueOf();
      const endTime = moment(moment(calendar.end).valueOf() + l).format(_.get(info, ['data', 'endFormat']));
      control.push({
        controlId: endData.controlId,
        controlName: endData.controlName,
        type: endData.type,
        value: isTimeStyle(endData) ? dateConvertToServerZone(endTime) : endTime,
      });
    }
    this.updateData(control, rowId, data => {
      this.props.updateEventData(rowId, data, startTime);
    });
  };

  showTip = (event, flag) => {
    setShowTip(event, flag, this.state.canNew);
  };

  selectFn = info => {
    this.setState(
      {
        selectTimeInfo: info,
      },
      () => {
        let endDivStr = info.endStr;
        if (!info.allDay) {
          endDivStr = moment(info.endStr).format('YYYY-MM-DD');
        } else {
          endDivStr = moment(endDivStr).subtract(1, 'day').format('YYYY-MM-DD');
        }
        this.showChooseTrigger(endDivStr, info.view.type);
      },
    );
  };

  // 兼容Safari
  dbClickFn = () => {
    // 需要手动实现双击事件
    let date = +new Date();
    if (!time) {
      time = date;
    } else {
      if (date - time <= 500) {
        time = '';
        return true;
      } else {
        time = date;
      }
    }
    return false;
  };

  showChooseTrigger = data => {
    setTimeout(() => {
      const { random, canNew } = this.state;
      if (!canNew) {
        return;
      }
      let date = moment(data).format('YYYY-MM-DD');
      $(`span[data-date=${date}-${random}]`)[0].click();
    }, 500);
  };

  renderCalendarItem = item => {
    const { base, calendarview = {}, updateCalendarEventIsAdd } = this.props;
    const { calendarData = {} } = calendarview;
    const { calendarInfo = [] } = calendarData;
    return (
      <CalendarIds
        item={item}
        calendarInfo={calendarInfo}
        {..._.cloneDeep(this.state)}
        isHide={true}
        calendarview={calendarview}
        changeEventFn={this.changeEventFn}
        onChangeState={state => this.setState({ ...state })}
        base={base}
        getEventsFn={this.getEventsFn}
        updateCalendarEventIsAdd={updateCalendarEventIsAdd}
        clickData={clickData}
        onChangeClickData={data => {
          clickData = data;
        }}
      />
    );
  };

  refreshCalendarData = () => {
    this.getEventsFn();
    this.props.refreshEventList();
    this.props.fetchExternal();
  };

  render() {
    const {
      toCustomWidget,
      worksheetInfo,
      sheetSwitchPermit,
      isCharge,
      controls = [],
      base,
      calendarview = {},
      setViewConfigVisible,
    } = this.props;
    const { calendarData = {}, calenderEventList = {} } = calendarview;
    const { eventScheduled = [] } = calenderEventList;
    const { appId, worksheetId, viewId } = base;
    const currentView = getCurrentView(this.props);
    let {
      begindate = '',
      enddate = '',
      colorid = '',
      hour24 = '0',
      calendarcids = '[]',
      weekbegin,
      showall = '0',
    } = getAdvanceSetting(currentView);
    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
      console.log(error);
    }
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
    }
    const { recordInfoVisible, recordId, isLoading, rows = [], showPrevNext = false, random } = this.state;
    const typeEvent = this.props.getInitType();
    const eventData = calenderEventList[`${typeEvent}Dt`] || [];
    const { startFormat, calendarInfo = [], unweekday = '', btnList, initialView } = calendarData;
    const { height, calendarFormatData } = this.state;
    let isDelete =
      calendarcids[0].begin &&
      calendarInfo.length > 0 &&
      (!calendarInfo[0].startData || !calendarInfo[0].startData.controlId);
    if (
      !isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit) &&
      SYS_CONTROLS_WORKFLOW.includes(_.get(calendarInfo[0], 'startData.controlId'))
    ) {
      isDelete = true;
    }
    let isHaveSelectControl = !calendarcids[0].begin || isDelete; // 是否选中了开始时间 //开始时间字段已删除

    if (isHaveSelectControl || isIllegalFormat(calendarInfo)) {
      return (
        <Wrap>
          <SelectField
            sheetSwitchPermit={sheetSwitchPermit}
            isCharge={isCharge}
            context={
              <SelectFieldForStartOrEnd
                {...this.props}
                isCalendarcids
                saveView={(data, viewNew) => {
                  let viewData = {};
                  const { moreSort } = currentView;
                  // 第一次创建Calendar时，配置排序数据
                  if (!moreSort) {
                    viewData = {
                      editAttrs: ['moreSort', 'sortType', 'advancedSetting'],
                      moreSort: [{ controlId: 'ctime', isAsc: true }],
                      sortType: 2,
                    };
                  }
                  this.props.saveView(data, { ...viewNew, ...viewData });
                  setViewConfigVisible(true);
                }}
                view={currentView}
                isDelete={isDelete}
                timeControls={getTimeControls(controls)}
                begindateOrFirst
              />
            }
            viewType={4}
            toCustomWidget={toCustomWidget}
          />
        </Wrap>
      );
    }
    let others = {};
    if (_.get(currentView, 'advancedSetting.showtime')) {
      const times = _.get(currentView, 'advancedSetting.showtime').split('-');
      others.slotMinTime = times[0];
      others.slotMaxTime = times[1];
    }

    const eventClick = eventInfo => {
      // 点击任务 获得任务id或其他相关内容
      const { extendedProps } = eventInfo.event._def;
      handleRecordClick(currentView, extendedProps, () => {
        this.setState({
          recordId: extendedProps.rowid,
          recordInfoVisible: true,
          rows: getRows(eventInfo.event.start, eventInfo.event.start, calendarview),
          showPrevNext: true,
        });
        addBehaviorLog('worksheetRecord', worksheetId, { rowId: extendedProps.rowid }); // 埋点
      });
    };

    return (
      <div className={`boxCalendar boxCalendar_${random}`}>
        {this.state.showExternal && (
          <External
            showExternal={this.state.showExternal}
            recordInfoVisible={this.state.recordInfoVisible}
            showRecordInfo={(rowid, data, eventData) => {
              handleRecordClick(currentView, data.extendedProps, () => {
                this.setState({
                  recordId: rowid,
                  recordInfoVisible: true,
                  showPrevNext: !!data.start,
                  rows: data.start
                    ? eventData
                        .filter(
                          o =>
                            (!!o.start &&
                              moment(o.start).isSameOrBefore(data.start, 'day') &&
                              moment(o.end).isSameOrAfter(data.end, 'day')) ||
                            moment(o.start).isSame(data.start, 'day'),
                        )
                        .map(o => {
                          return { ...o.extendedProps };
                        })
                    : [],
                });
              });
            }}
            tabList={TAB_LIST}
          />
        )}
        <div
          className={cx('calendarCon', {
            boldEvent: _.get(currentView, 'advancedSetting.rowHeight') === '1',
          })}
        >
          <div
            className={cx('scheduleBtn Hand', { show: this.state.showExternal })}
            onClick={() => {
              let showExternalData = getShowExternalData() || [];
              if (!this.state.showExternal) {
                showExternalData.push(`${worksheetId}-${viewId}`);
              } else {
                showExternalData = showExternalData.filter(o => o !== `${worksheetId}-${viewId}`);
              }
              safeLocalStorageSetItem('CalendarShowExternal', JSON.stringify(showExternalData));
              this.setState(
                {
                  showExternal: !this.state.showExternal,
                },
                () => {
                  this.props.fetchExternal();
                },
              );
            }}
          >
            <Icon className="Font16 Hand" icon="abstract" />
            <span className="mLeft7 Bold">{_l('排期')}</span>
            {/* 未排期数量 */}
            {!this.state.showExternal && calenderEventList.eventNoScheduledCount > 0 && (
              <span className="num mLeft7">{`( ${_l('%0未排期', calenderEventList.eventNoScheduledCount)} )`}</span>
            )}
            {this.state.showExternal && <Icon className="Font16 mLeft7 Hand" icon="close" />}
          </div>
          {!isLoading ? (
            <FullCalendar
              key={this.state.fullCalendarKey}
              dragScroll={true}
              themeSystem="bootstrap"
              height={height}
              ref={this.calendarComponentRef}
              initialView={initialView} // 选中的日历模式
              headerToolbar={{
                right: btnList,
                center: 'title',
                left: '',
              }}
              eventDragStart={() => {
                this.setState({ isMove: true });
                resetFcEventDraggingPoint();
              }}
              eventDragStop={() => this.setState({ isMove: false })}
              views={CALENDAR_VIEW_FORMATS}
              dayCellContent={item => {
                return (
                  <React.Fragment>
                    {item.view.type === 'dayGridMonth' && this.getLunar(item)}
                    <WrapNum className={cx('num Hand', { canAdd: this.state.canNew })}>
                      <span className="txt">{item.dayNumberText.replace('日', '')}</span>
                      {!['timeGridDay', 'timeGridWeek'].includes(item.view.type) && this.renderCalendarItem(item)}
                    </WrapNum>
                  </React.Fragment>
                );
              }}
              dayCellDidMount={item => {
                if (!this.state.canNew) {
                  return;
                }
                $(item.el).on({
                  mousemove: event => {
                    if ($('.fc-more-popover').length > 0) return;
                    this.showTip(event, true);
                  },
                  mouseout: () => {
                    this.showTip(null, false);
                  },
                });
                $(item.el)
                  .find('.fc-daygrid-day-events')
                  .on({
                    mousemove: event => {
                      this.showTip(event, false);
                      event.stopPropagation();
                    },
                  });
              }}
              dayHeaderContent={item => {
                const date = new Date(item.date);
                const day = date.getDate();
                const weekday = date.toLocaleDateString(window.getCurrentLang() || 'zh-cn', { weekday: 'short' });
                return (
                  <React.Fragment>
                    {item.view.type !== 'dayGridMonth' && this.getLunar(item)}
                    <div className="num">
                      {item.view.type !== 'dayGridMonth' ? `${day} ${weekday}` : weekday}
                      {['timeGridDay', 'timeGridWeek'].includes(item.view.type) && this.renderCalendarItem(item)}
                    </div>
                  </React.Fragment>
                );
              }}
              dayHeaderDidMount={() => {
                $('.fc-col-header-cell').on('click', () => {
                  clickData = null;
                });
              }}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={window.getCurrentLang() || 'zh-cn'}
              buttonText={CALENDAR_BUTTON_TEXT}
              allDayText={_l('全天')}
              hiddenDays={
                unweekday.length >= 7
                  ? ''
                  : unweekday
                      .replace('7', '0')
                      .split('')
                      .map(o => {
                        return +o;
                      })
              } // 隐藏周几
              editable={true}
              firstDay={weekbegin ? Number(weekbegin) % 7 : 1} // 周一至周六为1～6，周日为0
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false,
              }}
              timeZone="local"
              defaultTimedEventDuration={'00:00:01'}
              events={calendarFormatData}
              viewDidMount={() => {
                this.calendarActionFn();
                this.getEventsFn();
              }}
              viewWillUnmount={this.calendarActionOff}
              viewClassNames={'worksheetFullCalendar'}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
                omitZeroMinute: true,
                hour12: hour24 === '0',
              }} // 任务的时间
              eventOrder={'start'} //String / Array / Function, default: "start,-duration,allDay,title"
              displayEventEnd={false} // 让月视图的任务既显示开始时间又显示结束时间
              eventClick={eventClick}
              eventDidMount={info =>
                eventDidMount(
                  info,
                  currentView,
                  controls,
                  worksheetInfo,
                  base,
                  sheetSwitchPermit,
                  isCharge,
                  this.props,
                  () => eventClick(info),
                  this.state.isMove,
                )
              }
              eventDrop={info => {
                let endData = _.get(info, ['event', 'extendedProps', 'endData']) || {};
                let startData = _.get(info, ['event', 'extendedProps', 'startData']) || {};
                // 日历上 记录的拖拽
                let control = [
                  {
                    controlId: startData.controlId,
                    controlName: startData.controlName,
                    type: startData.type,
                    value: dateConvertToServerZone(moment(info.event.start).format(startData.startFormat)),
                  },
                ];
                //周/天 非全天 视图 全天拖拽到非全天时间
                let isNotAllDay =
                  !info.event.end &&
                  !info.event.allDay &&
                  info.oldEvent.allDay &&
                  ['timeGridDay', 'timeGridWeek'].includes(info.view.type);
                if (info.event.end || (!info.event.end && info.event.allDay) || isNotAllDay) {
                  let end = !info.event.end
                    ? isNotAllDay
                      ? moment(info.event.start).add(1, 'hours').format(startFormat)
                      : moment(info.event.start).format('YYYY-MM-DD') + ' 23:59:59'
                    : changeEndStr(info.event.end, info.event.allDay, calendarview);
                  control.push({
                    controlId: endData.controlId,
                    controlName: endData.controlName,
                    type: endData.type,
                    value: dateConvertToServerZone(end),
                  });
                }
                this.updateData(control, info.event.extendedProps.rowid, data => {
                  this.props.updateEventData(info.event._def.extendedProps.rowid, data, info.event.start);
                });
              }}
              eventResize={info => {
                let endData = _.get(info, ['event', 'extendedProps', 'endData']) || {};
                if (!endData.controlId) {
                  alert(_l('请配置结束控件'), 3);
                  this.getEventsFn();
                  return;
                }
                this.updateData(
                  [
                    {
                      controlId: endData.controlId,
                      controlName: endData.controlName,
                      type: endData.type,
                      value: dateConvertToServerZone(changeEndStr(info.event.end, info.event.allDay, calendarview)),
                    },
                  ],
                  info.event.extendedProps.rowid,
                );
              }}
              dayMaxEventRows={showall === '0'}
              moreLinkContent={info => {
                return <div className="w100" title={_l('查看其他%0个', info.num)}>{`+${info.num}`}</div>;
              }}
              moreLinkClick={() => {
                const setMorePoper = () => {
                  if ($('.fc-more-popover').length > 0) {
                    let h = $('.fc-more-popover').height();
                    let top = $('.fc-more-popover').position().top;
                    let mH = $('.fc-scroller-harness-liquid').height();
                    if (h + top > mH) {
                      $('.fc-more-popover').css({ bottom: 10, top: 'initial' });
                    }
                    $('.fc-more-popover').addClass('show');
                  }
                };
                if ($('.fc-more-popover').length > 0) {
                  setMorePoper();
                } else {
                  setTimeout(() => {
                    setMorePoper();
                  }, 500);
                }
              }}
              unselectAuto={this.state.unselectAuto}
              selectable={true}
              // selectHelper={true}
              select={info => {
                if (!this.state.canNew) {
                  return;
                }
                // isSafari 且 双击
                if (window.isSafari && this.dbClickFn()) {
                  this.selectFn({ ...info });
                  return;
                }
                clickData = info;
                // 全天事件
                if (info.allDay) {
                  // 且 多天 即非一格
                  if (moment(info.end).diff(moment(info.start), 'day') > 1) {
                    // 全天事件 框选多天
                    this.selectFn(info);
                  }
                } else {
                  // 30分钟以上 即非一格
                  if (moment(info.end).diff(moment(info.start), 'minute') > 30) {
                    this.selectFn(info);
                  }
                }
              }}
              // droppable={true} //true 会造成所有的拖动都走drop
              drop={info => {
                // 排期列表 =>拖拽到日历
                let rowId = $(info.draggedEl).attr('rowid');
                if (!rowId) {
                  return;
                }
                let keyId = $(info.draggedEl).attr('keyId');
                let data = eventScheduled.filter(o => o.keyIds === keyId);
                if (data.length && data.length === 1) {
                  this.changeEventFn({
                    ...info,
                    calendar: {
                      start: data[0].start,
                      end: !data[0].allDay
                        ? data[0].end
                        : `${moment(data[0].end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`,
                    },
                    data: {
                      ...data[0],
                    },
                    rowId,
                  });
                } else {
                  this.setState(
                    {
                      selectTimeInfo: info,
                      changeData: eventData.find(o => o.rowid === rowId) || {},
                    },
                    () => {
                      this.showChooseTrigger(info.dateStr, info.view.type);
                    },
                  );
                }
              }}
              eventMouseEnter={item => {
                this.showTip(null, false);
                let { startData } = calendarInfo[0] || {};
                let colorHover = getHoverColor(item.event.backgroundColor);
                if (
                  (!isTimeStyle(startData) && !item.event.allDay) ||
                  (!item.event.allDay && item.view.type === 'dayGridMonth')
                ) {
                  $(item.el).find('.fc-daygrid-event-dot').css({
                    'border-color': item.event.backgroundColor,
                  });
                } else {
                  $(item.el).css({
                    'background-color': colorHover,
                    'border-color': colorHover,
                  });
                  $(item.el)
                    .find('.fc-event-title,.fc-event-time')
                    .css({
                      color: !isLightColor(colorHover) ? '#fff' : '#151515',
                    });
                }
              }}
              eventMouseLeave={item => {
                let { startData } = calendarInfo[0] || {};
                if (
                  (!isTimeStyle(startData) && !item.event.allDay) ||
                  (!item.event.allDay && item.view.type === 'dayGridMonth')
                ) {
                  // $(item.el).find('.fc-daygrid-event-dot').css({
                  //   'border-color': item.event.backgroundColor,
                  // });
                } else {
                  $(item.el).css({
                    'background-color': item.event.backgroundColor,
                    'border-color': item.event.backgroundColor,
                  });
                  $(item.el)
                    .find('.fc-event-title,.fc-event-time')
                    .css({
                      color: !isLightColor(item.event.backgroundColor) ? '#fff' : '#151515',
                    });
                }
              }}
              {...others}
            />
          ) : (
            <LoadDiv />
          )}
        </div>
        {/* 表单信息 */}
        {recordInfoVisible && (
          <RecordInfoWrapper
            enablePayment={worksheetInfo.enablePayment}
            showPrevNext={showPrevNext}
            projectId={worksheetInfo.projectId}
            currentSheetRows={rows}
            allowAdd={worksheetInfo.allowAdd}
            sheetSwitchPermit={sheetSwitchPermit} // 表单权限
            visible
            appId={appId}
            viewId={viewId}
            from={1}
            view={currentView}
            hideRecordInfo={() => {
              this.setState({ recordInfoVisible: false });
            }}
            recordId={recordId}
            worksheetId={worksheetId}
            rules={worksheetInfo.rules}
            updateSuccess={(ids, updated) => {
              let attribute = controls.find(o => o.attribute === 1);
              // 更改了 开始时间/结束时间/标题字段/颜色 =>更新日历视图数据
              if (
                updated[begindate] ||
                (colorid && updated[colorid]) ||
                (enddate && updated[enddate]) ||
                (attribute && updated[attribute.controlId])
              ) {
                this.refreshCalendarData();
              }
            }}
            onDeleteSuccess={() => {
              // 删除行数据后重新加载页面
              this.refreshCalendarData();
              this.setState({
                rows: [],
                showPrevNext: false,
                recordInfoVisible: false,
              });
            }}
            hideRows={() => {
              this.refreshCalendarData();
              this.setState({
                rows: [],
                showPrevNext: false,
              });
            }}
            handleAddSheetRow={() => {
              this.refreshCalendarData();
              this.setState({ recordInfoVisible: false });
            }}
          />
        )}
        {this.state.canNew && <div id="mytips">{_l('双击创建记录')}</div>}
      </div>
    );
  }
}
export default connect(
  state => ({
    ...state.sheet,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    worksheetInfo: state.sheet.worksheetInfo,
    sheetButtons: state.sheet.sheetButtons,
    printList: state.sheet.printList,
  }),
  dispatch => bindActionCreators({ ...Actions, saveView, updateWorksheetControls }, dispatch),
)(RecordCalendar);
