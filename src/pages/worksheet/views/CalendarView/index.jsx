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
import addRecord from 'worksheet/common/newRecord/addRecord';
import moment from 'moment';
import LunarCalendar from 'lunar-calendar';
import SelectFieldForStartOrEnd from '../components/SelectFieldForStartOrEnd';
import worksheetAjax from 'src/api/worksheet';
import External from './External';
import * as Actions from 'src/pages/worksheet/redux/actions/calendarview';
import { saveView, updateWorksheetControls } from 'src/pages/worksheet/redux/actions';
import {
  getHoverColor,
  isTimeStyle,
  isEmojiCharacter,
  getShowExternalData,
  getCalendartypeData,
  isIllegalFormat,
} from './util';
import { isLightColor } from 'src/util';
import { isOpenPermit } from 'src/pages/FormSet/util';
import { permitList } from 'src/pages/FormSet/config';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import CurrentDateInfo from 'mobile/RecordList/View/CalendarView/components/CurrentDateInfo';
import Trigger from 'rc-trigger';
import autoSize from 'ming-ui/decorators/autoSize';
import styled from 'styled-components';
import { controlState } from 'src/components/newCustomFields/tools/utils';
const Wrap = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
`;
const WrapChoose = styled.div`
  width: 200px;
  background: #ffffff;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
  opacity: 1;
  border-radius: 2px;
  padding: 6px 0;
  .setLi {
    height: 36px;
    line-height: 36px;
    padding: 0 16px;
    &:hover {
      background: #f5f5f5;
    }
  }
`;
const WrapNum = styled.div`
   {
    position: relative;
    width: 20px;
    text-align: center;
    line-height: 20px;
    .txt {
      display: block;
    }
    .add {
      position: absolute;
      left: 50%;
      top: 50%;
      opacity: 0;
      transform: translate(-50%, -50%);
    }
    &.canAdd {
      &:hover {
        .add {
          line-height: 20px;
          opacity: 1;
        }
        .txt {
          opacity: 0;
        }
      }
    }
  }
`;

import { getTimeControls } from './util';
import _ from 'lodash';

let tabList = [
  { key: 'eventAll', txt: _l('全部') },
  { key: 'eventScheduled', txt: _l('已排期') },
  { key: 'eventNoScheduled', txt: _l('未排期') },
];
let time;
let clickData = null;
@autoSize
class RecordCalendar extends Component {
  constructor(props) {
    super(props);
    this.calendarComponentRef = React.createRef();
    const { allowAdd } = props.worksheetInfo;
    this.state = {
      showExternal: false,
      recordInfoVisible: false,
      scrollType: null,
      unselectAuto: false,
      isSearch: false,
      isLoading: false,
      height: props.height,
      canNew: isOpenPermit(permitList.createButtonSwitch, props.sheetSwitchPermit) && allowAdd,
      calendarFormatData: [],
      showChoose: false,
      selectTimeInfo: {},
      changeData: null,
      popupVisible: '',
      addDataList: [],
      random: parseInt(Math.random() * 1000000000000),
    };
  }
  componentDidMount() {
    this.getFormatData(this.props);
    this.props.getCalendarData();
    this.props.fetchExternal();
    this.getEventsFn();
  }

  componentWillReceiveProps(nextProps) {
    const { base, calendarview = {}, height } = nextProps;
    const { calendarData = {}, calendarFormatData } = calendarview;
    const { viewId } = base;
    const currentView = this.getCurrentView(nextProps);
    const preView = this.getCurrentView(this.props);
    const { initialView } = calendarData;
    if (nextProps.height !== this.props.height) {
      $('.boxCalendar,.calendarCon,.fc-daygrid-body,.fc-scrollgrid-sync-table,.fc-col-header ').width('100%');
      this.setState({
        height: height,
      });
    }
    if (!_.isEqual(calendarFormatData, (this.props.calendarview || {}).calendarFormatData)) {
      this.getFormatData(nextProps);
    }
    if (viewId !== this.props.base.viewId || !_.isEqual(currentView, preView)) {
      nextProps.getCalendarData();
      this.calendarComponentRef.current &&
        this.calendarComponentRef.current.getApi().changeView(browserIsMobile() ? 'dayGridMonth' : initialView); // 更改视图类型
      nextProps.fetchExternal();
      this.getEventsFn();
    }
    if (
      viewId !== this.props.base.viewId ||
      getAdvanceSetting(currentView).begindate !== getAdvanceSetting(preView).begindate ||
      getAdvanceSetting(currentView).colorid !== getAdvanceSetting(preView).colorid ||
      getAdvanceSetting(currentView).calendarcids !== getAdvanceSetting(preView).calendarcids
    ) {
      // 切换视图，或更改开始时间字段 重新更新排期数据
      nextProps.refreshEventList();
      nextProps.fetchExternal();
      this.setState({
        isSearch: false,
      });
    }
    if (
      !browserIsMobile() &&
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

  browserIsMobile = () => {
    return browserIsMobile() || !_.isEmpty(this.props.mobileCalendarSetting);
  };

  getCurrentView = props => {
    const { views = [], base = {} } = props;
    const { viewId } = base;
    return views.find(o => o.viewId === viewId) || {};
  };

  renderLine = () => {
    const { random } = this.state;
    if ($('.fc-day-today').length > 0) {
      if ($(`.boxCalendar_${random} .fc-timegrid-body .linBox`).length > 0) {
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
      $(`.boxCalendar_${random} .fc-timegrid-body`).append(div);
    } else {
      $(`.boxCalendar_${random} .fc-timegrid-body .linBox`).remove();
    }
  };

  dbClickDay = () => {
    if (clickData) {
      this.selectFn(clickData);
    }
  };

  calendarActionOff = () => {
    const { random } = this.state;
    document
      .querySelector(`.boxCalendar_${random} .fc-view-harness-active`)
      .removeEventListener('dblclick', this.dbClickDay);
    $(`.boxCalendar_${random} .fc-toolbar-chunk`).off('click');
  };

  calendarActionFn = () => {
    const { random } = this.state;
    if (!this.isSafari()) {
      document
        .querySelector(`.boxCalendar_${random} .fc-view-harness-active`)
        .addEventListener('dblclick', this.dbClickDay, true);
    }
    if (this.browserIsMobile()) {
      $(`.boxCalendar_${random} .fc-toolbar-chunk`).on('click', () => {
        this.getEventsFn();
      });
    } else {
      $(`.boxCalendar_${random} .fc-toolbar-chunk`)
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
        clickData = null;
        this.setState({
          changeData: null,
        });
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
        value: startTime,
      },
    ];
    if (endData && calendar.end) {
      // 开始时间与拖拽时间的时间差
      let l = moment(startTime).valueOf() - moment(calendar.start).valueOf();
      control.push({
        controlId: endData.controlId,
        controlName: endData.controlName,
        type: endData.type,
        value: moment(moment(calendar.end).valueOf() + l).format(_.get(info, ['data', 'endFormat'])),
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
    if (!this.state.canNew) {
      return;
    }
    if ($('.customPageContent').length) {
      return;
    }
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

  selectFn = info => {
    this.setState({
      selectTimeInfo: info,
    });
    let endDivStr = info.endStr;
    if (!info.allDay) {
      endDivStr = moment(info.endStr).format('YYYY-MM-DD');
    } else {
      endDivStr = moment(endDivStr).subtract(1, 'day').format('YYYY-MM-DD');
    }
    this.showChooseTrigger(endDivStr, info.view.type);
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

  useViewInfoUpdate = (o, item) => {
    const { selectTimeInfo = {}, changeData } = this.state;
    if (!controlState(o.startData).editable) {
      return alert(_l('当前日期字段不可编辑'), 3);
    }
    if (changeData && changeData.rowid) {
      this.changeEventFn({
        ...item,
        ...selectTimeInfo,
        ...changeData,
        rowId: changeData.rowid,
        data: o,
        calendar: {
          start: changeData[o.begin],
          end: changeData[o.end],
        },
      });
    } else {
      let startT = moment(selectTimeInfo.startStr ? selectTimeInfo.startStr : item.date).format(o.startFormat);
      let endT = selectTimeInfo.endStr
        ? !selectTimeInfo.allDay
          ? moment(selectTimeInfo.endStr).format(o.endFormat)
          : `${moment(selectTimeInfo.endStr).subtract(1, 'day').format('YYYY-MM-DD')} 23:59:59`
        : '';
      let data = selectTimeInfo.startStr
        ? {
            [o.begin]: startT,
            [o.end]: endT,
          }
        : {
            [o.begin]: startT,
          };
      this.addRecordInfo(data);
      this.setState({
        selectTimeInfo: {},
      });
    }
  };

  renderPopup = item => {
    const { calendarview = {} } = this.props;
    const { calendarData = {} } = calendarview;
    const { calendarInfo = [] } = calendarData;
    return (
      <WrapChoose>
        {calendarInfo.map(o => {
          return (
            <div
              className="setLi Hand WordBreak overflow_ellipsis"
              onClick={() => {
                this.setState({
                  popupVisible: '',
                });
                this.useViewInfoUpdate(o, item);
              }}
            >
              {_l('使用%0', o.mark || o.startData.controlName)}
            </div>
          );
        })}
      </WrapChoose>
    );
  };

  renderCalendarIds = (item, calendarInfo, isHide) => {
    if (!this.state.canNew) {
      return;
    }
    const { popupVisible, random } = this.state;
    let date = moment(item.date).format('YYYY-MM-DD');
    return (
      <Trigger
        popupVisible={popupVisible === `${date}`}
        action={['click']}
        popup={this.renderPopup(item)}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={visible => {
          if (browserIsMobile()) return;
          if (visible) {
            if (calendarInfo.length <= 1) {
              this.useViewInfoUpdate(calendarInfo[0], item);
            } else {
              this.setState({
                popupVisible: `${date}`,
              });
            }
          } else {
            this.setState({
              popupVisible: '',
            });
          }
        }}
        popupAlign={{
          points: ['tc', 'bc'],
          offset: [0, 12],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        <span
          className={cx('add', { isTop: item.view.type !== 'dayGridMonth', Alpha0: isHide })}
          data-date={`${date}-${random}`}
        >
          +
        </span>
      </Trigger>
    );
  };

  showChooseTrigger = (data, type) => {
    const { random } = this.state;
    let date = moment(data).format('YYYY-MM-DD');
    $(`span[data-date=${date}-${random}]`)[0].click();
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
    const { calendarData = {}, editable, calenderEventList = {} } = calendarview;
    const { eventScheduled = [] } = calenderEventList;
    const { appId, worksheetId, viewId } = base;
    const currentView = this.getCurrentView(this.props);
    let {
      begindate = '',
      enddate = '',
      colorid = '',
      hour24 = '0',
      calendarType = '0',
      calendarcids = '[]',
      weekbegin,
      showall = '0',
    } = getAdvanceSetting(currentView);
    try {
      calendarcids = JSON.parse(calendarcids);
    } catch (error) {
      calendarcids = [];
    }
    if (calendarcids.length <= 0) {
      calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
    }
    const { recordInfoVisible, recordId, isLoading, rows = [], showPrevNext = false, random } = this.state;
    const typeEvent = this.props.getInitType();
    const eventData = calenderEventList[`${typeEvent}Dt`] || [];
    const { startFormat, endFormat, calendarInfo = [], unweekday = '', btnList, initialView } = calendarData;
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
      <div className={`boxCalendar boxCalendar_${random}`}>
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
          {!this.browserIsMobile() && (
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
          )}
          {!isLoading ? (
            <FullCalendar
              dragScroll={true}
              themeSystem="bootstrap"
              height={height}
              ref={this.calendarComponentRef}
              initialView={!this.browserIsMobile() ? initialView : 'dayGridMonth'} // 选中的日历模式
              headerToolbar={{
                right: this.browserIsMobile() ? 'today' : btnList,
                center: this.browserIsMobile() ? 'prev,title next' : 'title',
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
                    <WrapNum className={cx('num Hand', { canAdd: this.state.canNew })}>
                      <span className="txt">{item.dayNumberText.replace('日', '')}</span>
                      {!['timeGridDay', 'timeGridWeek'].includes(item.view.type) &&
                        this.renderCalendarIds(item, calendarInfo)}
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
                    {item.view.type !== 'dayGridMonth' && !this.browserIsMobile() && this.getLunar(item)}
                    <div className="num">
                      {st}
                      {['timeGridDay', 'timeGridWeek'].includes(item.view.type) &&
                        this.renderCalendarIds(item, calendarInfo, true)}
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
                true
                // ['ctime', 'utime'].includes(begindate) || ['ctime', 'utime'].includes(enddate) ? false : editable
              }
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
                let startData = _.get(info, ['event', 'extendedProps', 'startData']) || {};
                $(info.el.offsetParent).attr('title', info.event._def.title);
                if (!_.get(info, ['event', 'extendedProps', 'editable'])) {
                  $(info.el).css({ cursor: 'not-allowed' });
                }
                let time = info.event._def.extendedProps[info.event._def.extendedProps.begin] || '';
                let d = $(info.el.offsetParent).find('.fc-event-time');
                if (!isTimeStyle(startData)) {
                  //日期视图 不显示时间
                  d.html(``);
                } else {
                  if (!info.event.allDay && info.view.type !== 'dayGridMonth') {
                    if (!this.browserIsMobile()) {
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
                      if (!this.browserIsMobile()) {
                        d.html(`${h}:${mm < 10 ? '0' + mm : mm}${hour >= 12 ? 'p' : 'a'}`);
                      } else {
                        d.html(``);
                      }
                    } else {
                      //24小时
                      if (!this.browserIsMobile()) {
                        d.html(moment(time).format('HH:mm'));
                      } else {
                        d.html(``);
                      }
                    }
                  }
                }
                let mark = _.get(info, ['event', 'extendedProps', 'mark']);
                let title = _.get(info, ['event', 'title']);
                mark &&
                  $(info.el)
                    .find('.fc-event-title')
                    .html(
                      `<span class="titleTxt">${title}</span><span class="mLeft10 Normal markTxt ${
                        isEmojiCharacter(mark) ? '' : 'Alpha4'
                      }">${mark}</span>`,
                    );
                if (info.event.allDay) {
                  $(info.el).find('.fc-event-title').css({
                    'font-weight': 'bold',
                  });
                }
              }}
              eventDrop={info => {
                let endData = _.get(info, ['event', 'extendedProps', 'endData']) || {};
                let startData = _.get(info, ['event', 'extendedProps', 'startData']) || {};
                // 日历上 记录的拖拽
                let control = [
                  {
                    controlId: startData.controlId,
                    controlName: startData.controlName,
                    type: startData.type,
                    value: moment(info.event.start).format(startData.startFormat),
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
                    controlId: endData.controlId,
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
                      value: this.changeEndStr(info.event.end, info.event.allDay),
                    },
                  ],
                  info.event.extendedProps.rowid,
                );
              }}
              dayMaxEventRows={showall === '0'}
              moreLinkContent={info => {
                return `+${info.num}`;
              }}
              moreLinkClick={info => {
                if (this.browserIsMobile()) {
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
                // isSafari 且 双击
                if (this.isSafari() && this.dbClickFn()) {
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
                  this.setState({
                    selectTimeInfo: info,
                    changeData: eventData.find(o => o.rowid === rowId) || {},
                  });
                  this.showChooseTrigger(info.dateStr, info.view.type);
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
                let { startData } = calendarInfo[0] || {};
                if (
                  (!isTimeStyle(startData) && !item.event.allDay) ||
                  (!item.event.allDay && item.view.type === 'dayGridMonth')
                ) {
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
              // eventMaxStack={1}  //日 时间视图事件 最大显示数
              // slotEventOverlap={false} //日 时间视图事件显示方式 并列
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
            hideRows={() => {
              this.getEventsFn();
              this.props.refreshEventList();
              this.props.fetchExternal();
              this.setState({
                rows: [],
                showPrevNext: false,
              });
            }}
            handleAddSheetRow={data => {
              this.getEventsFn();
              this.props.refreshEventList();
              this.props.fetchExternal();
              this.setState({ recordInfoVisible: false });
            }}
          />
        )}
        {!this.browserIsMobile() && this.state.canNew && <div id="mytips">{_l('双击创建记录')}</div>}
        <CurrentDateInfo visible={this.props.mobileMoreClickVisible} />
      </div>
    );
  }
}
export default connect(
  state => ({
    ...state.sheet,
    sheetSwitchPermit: state.sheet.sheetSwitchPermit || [],
    worksheetInfo: state.sheet.worksheetInfo,
    mobileMoreClickVisible: state.sheet.calendarview.mobileMoreClickVisible,
  }),
  dispatch => bindActionCreators({ ...Actions, saveView, updateWorksheetControls }, dispatch),
)(RecordCalendar);
