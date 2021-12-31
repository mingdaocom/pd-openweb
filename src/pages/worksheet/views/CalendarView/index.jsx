import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './index.less';
import { Icon, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import SelectField from '../components/SelectField';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAdvanceSetting, browserIsMobile } from 'src/util';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { addRecord } from 'worksheet/common/newRecord';
import moment from 'moment';
import LunarCalendar from 'lunar-calendar';
import SelectFieldForStartOrEnd from '../components/SelectFieldForStartOrEnd';
import { updateWorksheetRow } from 'src/api/worksheet';
import External from './External';
import * as Actions from 'src/pages/worksheet/redux/actions/calendarview';
import { saveView } from 'src/pages/worksheet/redux/actions';
import { getHoverColor, isTimeStyle } from './util';
import { isLightColor } from 'src/util';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config';
import { navigateTo } from 'src/router/navigateTo';
import CurrentDateInfo from 'src/pages/Mobile/RecordList/View/CalendarView/components/CurrentDateInfo';

import styled from 'styled-components';
const Wrap = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
`;
import { getTimeControls } from './util';
let tabList = [
  { key: 'eventAll', txt: _l('全部') },
  { key: 'eventScheduled', txt: _l('已排期') },
  { key: 'eventNoScheduled', txt: _l('未排期') },
];
let time;
let clickData = null;
@connect(
  state => ({
    ...state.sheet,
    chatVisible: state.chat.visible,
    sheetListVisible: state.sheetList.isUnfold,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    worksheetInfo: state.sheet.worksheetInfo,
    mobileMoreClickVisible: state.sheet.calendarview.mobileMoreClickVisible,
  }),
  dispatch => bindActionCreators({ ...Actions, saveView }, dispatch),
)
class RecordCalendar extends Component {
  constructor(props) {
    super(props);
    this.calendarComponentRef = React.createRef();
    const { allowAdd } = props.worksheetInfo;
    this.state = {
      showExternal: !!window.localStorage.getItem('CalendarShowExternal'),
      recordInfoVisible: false,
      scrollType: null,
      unselectAuto: false,
      isSearch: false,
      isLoading: false,
      height: browserIsMobile()
        ? document.documentElement.clientHeight - 43
        : document.documentElement.clientHeight - 126,
      canNew: isOpenPermit(permitList.createButtonSwitch, props.sheetSwitchPermit) && allowAdd,
      calendarFormatData: [],
    };
  }
  componentDidMount() {
    this.getFormatData(this.props);
    this.props.getCalendarData();
    this.props.fetchExternal();
    this.getEventsFn();
    window.addEventListener('resize', () => {
      this.setState({
        height: browserIsMobile()
          ? document.documentElement.clientHeight - 43
          : document.documentElement.clientHeight - 126,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { sheetListVisible, chatVisible, base, calendarview = {} } = nextProps;
    const { calendarData = {}, calendarFormatData } = calendarview;
    const { viewId } = base;
    const currentView = this.getCurrentView(nextProps);
    const preView = this.getCurrentView(this.props);
    const { initialView } = calendarData;
    if (!_.isEqual(calendarFormatData, (this.props.calendarview || {}).calendarFormatData)) {
      this.getFormatData(nextProps);
    }
    if (viewId !== this.props.base.viewId || !_.isEqual(currentView, preView)) {
      nextProps.getCalendarData();
      this.calendarComponentRef.current && this.calendarComponentRef.current.getApi().changeView(initialView); // 更改视图类型
      nextProps.fetchExternal();
      this.getEventsFn();
    }
    if (
      viewId !== this.props.base.viewId ||
      getAdvanceSetting(currentView).begindate !== getAdvanceSetting(preView).begindate ||
      getAdvanceSetting(currentView).colorid !== getAdvanceSetting(preView).colorid
    ) {
      // 切换视图，或更改开始时间字段 重新更新排期数据
      nextProps.refreshEventList();
      nextProps.fetchExternal();
      this.setState({
        isSearch: false,
      });
    }
    if (
      !_.isEqual(initialView, this.props.calendarview.calendarData.initialView) &&
      this.calendarComponentRef.current
    ) {
      this.calendarComponentRef.current.getApi().changeView(initialView); // 更改视图类型
    }
    if (
      (chatVisible !== this.props.chatVisible || sheetListVisible !== this.props.sheetListVisible) &&
      this.calendarComponentRef.current
    ) {
      setTimeout(() => {
        $('.boxCalendar,.calendarCon,.fc-daygrid-body,.fc-scrollgrid-sync-table,.fc-col-header ').width('100%');
      }, 500);
    }
  }

  componentDidUpdate() {
    if (this.calendarComponentRef.current) {
      let view = this.calendarComponentRef.current.getApi().view;
      window.localStorage.setItem('CalendarViewType', view.type);
    }
  }

  getCurrentView = props => {
    const { views = [], base = {} } = props;
    const { viewId } = base;
    return views.find(o => o.viewId === viewId) || {};
  };

  renderLine = () => {
    if ($('.fc-day-today').length > 0) {
      if ($('.linBox').length > 0) {
        return;
      }
      let data = new Date();
      let hourH = 18 * 2;
      let h = parseFloat(data.getHours() * hourH + parseFloat((data.getMinutes() / 60).toFixed(2)) * hourH) - 3 + 'px';
      let div =
        '<div class="linBox" style="text-align:right;width: 100%;top:' +
        h +
        ';position: absolute;z-index: 100000;left:43px;">';
      div += '<div class="rect"></div><div class="rectLine"></div>';
      div += '</div>';
      $('.fc-timegrid-body').append(div);
    } else {
      $('.fc-timegrid-body .linBox').remove();
    }
  };

  dbClickDay = () => {
    if (clickData && clickData.startT && clickData.endT) {
      this.selectFn(clickData.startT, clickData.endT);
    }
  };

  calendarActionOff = () => {
    document.querySelector('.fc-view-harness-active').removeEventListener('dblclick', this.dbClickDay);
    $('.fc-toolbar-chunk').off('click');
  };

  calendarActionFn = () => {
    if (!this.isSafari()) {
      document.querySelector('.fc-view-harness-active').addEventListener('dblclick', this.dbClickDay, true);
    }
    if (browserIsMobile()) {
      $('.fc-toolbar-chunk').on('click', () => {
        this.getEventsFn();
      });
    } else {
      $('.fc-toolbar-chunk')
        .last()
        .on('click', () => {
          this.getEventsFn();
        });
    }
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
      this.renderLine();
    }, 200);
  };

  getFormatData = nextProps => {
    const { calendarview = {} } = nextProps;
    const { calendarFormatData = [] } = calendarview;
    this.setState({
      calendarFormatData,
    });
  };

  updateData = (newOldControl, rowId, cb) => {
    const { base, updataEditable } = this.props;
    const { appId, worksheetId, viewId } = base;
    updataEditable(false);
    updateWorksheetRow({
      rowId,
      appId,
      worksheetId,
      viewId,
      newOldControl,
    }).then(({ data, resultCode }) => {
      if (data && resultCode === 1) {
        this.getEventsFn();
        if (cb) {
          cb(data);
        }
      }
    });
  };

  addRecordInfo = defaultFormData => {
    const { base = {} } = this.props;
    const { worksheetId } = base;
    addRecord({
      worksheetId: worksheetId,
      defaultFormData,
      defaultFormDataEditable: true,
      directAdd: true,
      onAdd: record => {
        $('.fc-highlight').remove();
        this.getEventsFn();
        this.props.updateCalendarEventIsAdd(true);
      },
    });
  };

  // 显示农历
  getLunar = item => {
    const { unlunar } = getAdvanceSetting(this.getCurrentView(this.props)); // 默认显示农历
    if (unlunar === '1') {
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
    const { calendarview = {} } = this.props;
    const { calendarData = {} } = calendarview;
    const { startFormat, endFormat, startData, endData } = calendarData;
    const { begindate = '', enddate = '' } = getAdvanceSetting(this.getCurrentView(this.props));
    let dateStr = info.dateStr;
    let startTime;
    const { rowId, data } = info;
    if (info.allDay) {
      // YYYY-MM-DD
      let str = data.start
        ? `${dateStr} ${moment(data.start).format('YYYY-MM-DD HH:mm').substring(11)}`
        : `${dateStr} 08:00`;
      startTime = isTimeStyle(startData) ? str : dateStr;
    } else {
      // 'YYYY-MM-DD HH:mm'
      startTime = moment(dateStr).format(startFormat);
    }
    let control = [
      {
        controlId: begindate,
        controlName: startData.controlName,
        type: startData.type,
        value: startTime,
      },
    ];
    if (data.end) {
      // 开始时间与拖拽时间的时间差
      let l = moment(startTime).valueOf() - moment(data.start).valueOf();
      control.push({
        controlId: enddate,
        controlName: endData.controlName,
        type: endData.type,
        value: moment(moment(data.end).valueOf() + l).format(endFormat),
      });
    }
    this.updateData(control, rowId, data => {
      this.props.updateEventData(rowId, data, startTime);
    });
  };

  changeEndStr = (end, allDay) => {
    const { calendarview = {} } = this.props;
    const { calendarData = {} } = calendarview;
    const { endFormat } = calendarData;

    // 日期字段，结束时间按前一天的23:59:59处理（即减去一天）
    // return moment(endData.type === 16 ? end : moment(end).subtract(1, 'day')).format(endFormat);
    if (!allDay) {
      return moment(end).format(endFormat);
    } else {
      return `${moment(end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`;
    }
  };

  showTip = (event, flag) => {
    let my_tips = $('#mytips');
    if (flag) {
      my_tips.css({
        left: event.clientX + 10,
        top: event.clientY + 10,
      });
      my_tips.show();
    } else {
      my_tips.hide();
    }
  };

  selectFn = (startT, endT) => {
    const { begindate = '', enddate = '' } = getAdvanceSetting(this.getCurrentView(this.props));
    this.addRecordInfo({
      [begindate]: startT,
      [enddate]: endT,
    });
    clickData = null;
  };

  isSafari = () => {
    let ua = window.navigator.userAgent;
    return ua.indexOf('Safari') != -1 && ua.indexOf('Version') != -1;
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

  getRows = (start, end) => {
    const { calendarview = {} } = this.props;
    const { calendarFormatData = [] } = calendarview;
    let list = calendarFormatData;
    let rows = [];
    list = list
      .filter(o => !!o.start)
      .sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });
    list.map(o => {
      if (
        (moment(o.start).isSameOrBefore(start, 'day') && moment(o.end).isSameOrAfter(end, 'day')) ||
        moment(o.start).isSame(start, 'day')
      ) {
        rows.push(o.extendedProps);
      }
    });
    return rows;
  };

  // 获取点击日期当天数据
  getMoreClickData = date => {
    let { calendarFormatData } = this.state;
    let tempData = [];
    calendarFormatData.forEach(item => {
      const { start, end } = item;
      if (start && end && moment(date).isBetween(moment(start), moment(end).subtract(1, 'days'))) {
        tempData.push(item);
      } else if (
        start &&
        moment(moment(date).format('YYYY-MM-DD')).isSame(moment(moment(start).format('YYYY-MM-DD')))
      ) {
        tempData.push(item);
      }
    });
    let currentDate = moment(date).format('YYYY.MM.DD');
    this.props.changeMobileCurrentDate(currentDate);
    this.props.changeMobileCurrentData(tempData);
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
      mobileCalendarSetting = {},
    } = this.props;
    const { calendarData = {}, editable } = calendarview;
    const { appId, worksheetId, viewId } = base;
    const currentView = this.getCurrentView(this.props);
    const {
      begindate = '',
      enddate = '',
      colorid = '',
      hour24 = '0',
      calendarType = '0',
    } = getAdvanceSetting(currentView);
    const { recordInfoVisible, recordId, isLoading, rows = [], showPrevNext = false } = this.state;
    const { calenderEventList } = calendarview;
    const typeEvent = this.props.getInitType();
    const eventData = calenderEventList[`${typeEvent}Dt`] || [];
    const { startFormat, endFormat, startData, endData, unweekday = '', btnList, initialView } = calendarData;
    const { height, calendarFormatData } = this.state;
    const isDelete = begindate && (!startData || !startData.controlId);
    let isHaveSelectControl = !begindate || isDelete; // 是否选中了开始时间 //开始时间字段已删除
    let mobileInitialView =
      calendarType === '0'
        ? 'dayGridMonth'
        : calendarType === '1'
        ? isTimeStyle(startData)
          ? 'timeGridWeek'
          : 'dayGridWeek'
        : calendarType === '2'
        ? isTimeStyle(startData)
          ? 'timeGridDay'
          : 'dayGridDay'
        : '';
    if (isHaveSelectControl) {
      return (
        <Wrap>
          <SelectField
            isCharge={isCharge}
            context={
              <SelectFieldForStartOrEnd
                {...this.props}
                saveView={(data, viewNew) => {
                  let viewData = {};
                  const { moreSort } = currentView;
                  // 第一次创建Calendar时，配置排序数据
                  if (!moreSort) {
                    const { begindate = '' } = getAdvanceSetting(viewNew);
                    viewData = {
                      sortCid: begindate,
                      editAttrs: ['moreSort', 'sortCid', 'sortType', 'advancedSetting'],
                      moreSort: [
                        { controlId: begindate, isAsc: true },
                        { controlId: 'ctime', isAsc: false },
                      ],
                      sortType: 2,
                    };
                  }
                  this.props.saveView(data, { ...viewNew, ...viewData });
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
    return (
      <div className="boxCalendar">
        {this.state.showExternal && (
          <External
            showExternal={this.state.showExternal}
            recordInfoVisible={this.state.recordInfoVisible}
            showRecordInfo={(rowid, data, eventData) => {
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
            }}
            tabList={tabList}
          />
        )}
        <div className="calendarCon">
          {!browserIsMobile() && (
            <div
              className={cx('scheduleBtn Hand', { show: this.state.showExternal })}
              onClick={() => {
                if (!this.state.showExternal) {
                  window.localStorage.setItem('CalendarShowExternal', 1);
                } else {
                  window.localStorage.removeItem('CalendarShowExternal');
                }
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
          )}
          {!isLoading ? (
            <FullCalendar
              dragScroll={true}
              themeSystem="bootstrap"
              height={height}
              ref={this.calendarComponentRef}
              initialView={!browserIsMobile() ? initialView : mobileInitialView} // 选中的日历模式
              headerToolbar={{
                right: browserIsMobile() ? 'today' : btnList,
                center: browserIsMobile() ? 'prev,title next' : 'title',
                left: '',
              }}
              views={{
                dayGridMonth: {
                  titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
                  // dayMaxEventRows: 5,
                },
                timeGridWeek: {
                  titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
                },
                timeGridDay: {
                  titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
                },
                dayGridWeek: {
                  titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
                },
                dayGridDay: {
                  titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
                },
              }}
              dayCellContent={item => {
                return (
                  <React.Fragment>
                    {item.view.type === 'dayGridMonth' && this.getLunar(item)}
                    <div className="num">{item.dayNumberText.replace('日', '')}</div>
                  </React.Fragment>
                );
              }}
              dayCellDidMount={item => {
                $(item.el).on({
                  mousemove: event => {
                    this.showTip(event, true);
                  },
                  mouseout: event => {
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
                let st = item.text.indexOf('/') >= 0 ? item.text.split('/')[1] : item.text;
                let index = st.indexOf('周');
                if (index >= 0) {
                  st = st.slice(0, index) + ' ' + _l(st.slice(index));
                } else if (st.indexOf('星期') >= 0) {
                  index = st.indexOf('星期');
                  st = st.slice(0, index) + ' ' + _l(st.slice(index));
                }
                return (
                  <React.Fragment>
                    {item.view.type !== 'dayGridMonth' && !browserIsMobile() && this.getLunar(item)}
                    <div className="num">{st}</div>
                  </React.Fragment>
                );
              }}
              dayHeaderDidMount={() => {
                $('.fc-col-header-cell').on('click', () => {
                  clickData = null;
                });
              }}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale="zh-cn"
              buttonText={{
                today: _l('今天'),
                month: _l('月'),
                week: _l('周'),
                day: _l('天'),
              }}
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
              editable={
                ['ctime', 'utime'].includes(begindate) || ['ctime', 'utime'].includes(enddate) ? false : editable
              }
              firstDay={1} // 周一至周六为1～6，周日为0，喜欢周几开始就填几
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false,
              }}
              timeZone="local"
              events={calendarFormatData}
              viewDidMount={info => {
                this.calendarActionFn();
                this.getEventsFn();
              }}
              viewWillUnmount={info => {
                this.calendarActionOff();
              }}
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
              eventClick={eventInfo => {
                // 点击任务 获得任务id或其他相关内容
                const { extendedProps } = eventInfo.event._def;
                this.setState({
                  recordId: extendedProps.rowid,
                  recordInfoVisible: true,
                  rows: this.getRows(eventInfo.event.start, eventInfo.event.start),
                  showPrevNext: true,
                });
              }}
              eventDidMount={info => {
                $(info.el.offsetParent).attr('title', info.event._def.title);
                let time = info.event._def.extendedProps[begindate] || '';
                let d = $(info.el.offsetParent).find('.fc-event-time');
                if (!info.event.allDay && info.view.type !== 'dayGridMonth') {
                  if (!browserIsMobile()) {
                    d.html(moment(time).format('HH:mm'));
                  } else {
                    d.html(``);
                  }
                } else {
                  if (hour24 === '0') {
                    //12小时
                    let hour = new Date(time.replace(/\-/g, '/')).getHours();
                    let mm = new Date(time.replace(/\-/g, '/')).getMinutes();
                    let h = hour % 12 <= 0 ? 12 : hour % 12;
                    if (!browserIsMobile()) {
                      d.html(`${h}:${mm < 10 ? '0' + mm : mm}${hour >= 12 ? 'p' : 'a'}`);
                    } else {
                      d.html(``);
                    }
                  } else {
                    //24小时
                    if (!browserIsMobile()) {
                      d.html(moment(time).format('HH:mm'));
                    } else {
                      d.html(``);
                    }
                  }
                }
                if (info.event.allDay) {
                  $(info.el).find('.fc-event-title').css({
                    'font-weight': 'bold',
                  });
                }
              }}
              eventDrop={info => {
                // 日历上 记录的拖拽
                let control = [
                  {
                    controlId: begindate,
                    controlName: startData.controlName,
                    type: startData.type,
                    value: moment(info.event.start).format(startFormat),
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
                    : this.changeEndStr(info.event.end, info.event.allDay);
                  control.push({
                    controlId: enddate,
                    controlName: endData.controlName,
                    type: endData.type,
                    value: end,
                  });
                }
                this.updateData(control, info.event.extendedProps.rowid, data => {
                  this.props.updateEventData(info.event._def.extendedProps.rowid, data, info.event.start);
                });
              }}
              eventResize={info => {
                if (!enddate || !endData.controlId) {
                  alert(_l('请配置结束控件'));
                  this.getEventsFn();
                  return;
                }
                this.updateData(
                  [
                    {
                      controlId: enddate,
                      controlName: endData.controlName,
                      type: endData.type,
                      value: this.changeEndStr(info.event.end, info.event.allDay),
                    },
                  ],
                  info.event.extendedProps.rowid,
                );
              }}
              dayMaxEventRows={true}
              moreLinkContent={info => {
                return `+${info.num}`;
              }}
              moreLinkClick={info => {
                if (browserIsMobile()) {
                  this.getMoreClickData(info.date);
                  this.props.mobileIsShowMoreClick(true);
                  return;
                }
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
                let startT = moment(info.start).format(startFormat);
                let endT = !info.allDay
                  ? moment(info.end).format(endFormat)
                  : `${moment(info.end).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`;
                // isSafari 且 双击
                if (this.isSafari() && this.dbClickFn()) {
                  this.selectFn(startT, endT);
                  return;
                }
                clickData = {
                  startT,
                  endT,
                };
                // 全天事件
                if (info.allDay) {
                  // 且 多天 即非一格
                  if (moment(info.end).diff(moment(info.start), 'day') > 1) {
                    // 全天事件 框选多天
                    this.selectFn(startT, endT);
                  }
                } else {
                  // 30分钟以上 即非一格
                  if (moment(info.end).diff(moment(info.start), 'minute') > 30) {
                    this.selectFn(startT, endT);
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
                let data = eventData.find(o => o.rowid === rowId) || {};
                this.changeEventFn({ ...info, data, rowId });
              }}
              eventMouseEnter={item => {
                this.showTip(null, false);
                let colorHover = getHoverColor(item.event.backgroundColor);
                if (!item.event.allDay && item.view.type === 'dayGridMonth') {
                  $(item.el).find('.fc-daygrid-event-dot').css({
                    'border-color': colorHover,
                  });
                } else {
                  $(item.el).css({
                    'background-color': colorHover,
                    'border-color': colorHover,
                  });
                  $(item.el)
                    .find('.fc-event-title,.fc-event-time')
                    .css({
                      color: !isLightColor(colorHover) ? '#fff' : '#333',
                    });
                }
              }}
              eventMouseLeave={item => {
                if (!item.event.allDay && item.view.type === 'dayGridMonth') {
                  $(item.el).find('.fc-daygrid-event-dot').css({
                    'border-color': item.event.backgroundColor,
                  });
                } else {
                  $(item.el).css({
                    'background-color': item.event.backgroundColor,
                    'border-color': item.event.backgroundColor,
                  });
                  $(item.el)
                    .find('.fc-event-title,.fc-event-time')
                    .css({
                      color: !isLightColor(item.event.backgroundColor) ? '#fff' : '#333',
                    });
                }
              }}
              {...mobileCalendarSetting}
            />
          ) : (
            <LoadDiv />
          )}
        </div>
        {/* 表单信息 */}
        {recordInfoVisible && (
          <RecordInfoWrapper
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
            updateSuccess={(ids, updated, data) => {
              let attribute = controls.find(o => o.attribute === 1);
              // 更改了 开始时间/结束时间/标题字段/颜色 =>更新日历视图数据
              if (
                updated[begindate] ||
                (colorid && updated[colorid]) ||
                (enddate && updated[enddate]) ||
                (attribute && updated[attribute.controlId])
              ) {
                this.getEventsFn();
                this.props.refreshEventList();
                this.props.fetchExternal();
              }
              this.setState({ recordInfoVisible: false });
            }}
            onDeleteSuccess={() => {
              // 删除行数据后重新加载页面
              this.getEventsFn();
              this.props.refreshEventList();
              this.props.fetchExternal();
              this.setState({
                rows: [],
                showPrevNext: false,
              });
              this.setState({ recordInfoVisible: false });
            }}
            handleAddSheetRow={data => {
              this.getEventsFn();
              this.props.refreshEventList();
              this.props.fetchExternal();
              this.setState({ recordInfoVisible: false });
            }}
          />
        )}
        {!browserIsMobile() && <div id="mytips">{_l('双击创建记录')}</div>}
        <CurrentDateInfo visible={this.props.mobileMoreClickVisible} />
      </div>
    );
  }
}

export default RecordCalendar;
