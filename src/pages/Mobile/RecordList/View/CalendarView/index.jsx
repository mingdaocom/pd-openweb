import React, { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useSetState } from 'react-use';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import _ from 'lodash';
import LunarCalendar from 'lunar-calendar';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'mobile/RecordList/redux/actions';
import { getAdvanceSetting } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import DailySchedule from './components/DailySchedule';
import EventContent from './components/EventContent';
import IconDimension from './components/IconDimension';
import SchedulePopup from './components/SchedulePopup';
import WeeklyCalendar from './components/WeeklyCalendar';
import { filterDailyScheduleData, WEEK_DAYS } from './util';
import './index.less';

const initData = {
  calendarTitle: '',
  showTodayBtn: false,
  schedulesPopupVisible: false,
  dailyScheduleData: [],
  dateInfo: {},
  dimension: 'month',
  isNotScheduled: false,
  isChangeWeekOrMonth: false,
  weekStartMonth: null,
  monthDay: moment().format('YYYY-MM-DD'),
};

const Calendar = memo(
  forwardRef((props, ref) => {
    const {
      controls = [],
      calendarView = {},
      initCalendarViewData = () => {},
      getCalendarData = () => {},
      base,
      worksheetInfo,
      view,
      viewId,
      previewRecordId,
      updatePreviewRecordId,
      sheetSwitchPermit,
      isCharge,
      calenderNotScheduled,
      getNotScheduledEventList,
      resetCalendarNotScheduled,
      updateCalendarNotScheduled,
      deleteCalendarNotScheduled,
    } = props;
    const { calendarData = [], calendarFormatData = [] } = calendarView;
    const { unweekday = '' } = calendarData;
    const { weekbegin, showall = '0', unlunar, hour24 = '0' } = getAdvanceSetting(props.view);
    const weekBegin = weekbegin ? Number(weekbegin) % 7 : 1;

    const calendarRef = useRef(null);
    const lastRangeRef = useRef('');
    const weeklyCalendarRef = useRef(null);
    const dailyScheduleRef = useRef(null);
    const lastClickTimeRef = useRef(0);
    const clickTimerRef = useRef(null);
    const [
      {
        calendarTitle,
        showTodayBtn,
        schedulesPopupVisible,
        dailyScheduleData,
        dateInfo,
        dimension,
        isNotScheduled,
        isChangeWeekOrMonth,
        weekStartMonth, // 月视图第一天（包含前后补的周）
        monthDay, // 月内的某一天
      },
      setState,
    ] = useSetState({
      ...initData,
    });

    const getCalendarApi = () => {
      return calendarRef.current?.getApi();
    };

    const updateTodayBtnVisibility = ({ start, end }) => {
      const today = moment().startOf('day');
      const inView = today.isSameOrAfter(moment(start)) && today.isBefore(moment(end));
      setState({ showTodayBtn: !inView });
    };

    const updateShowTodayBtn = showTodayBtn => {
      setState({ showTodayBtn });
    };

    const setCalendarTitle = title => {
      setState({ calendarTitle: title });
    };

    const getEventsFn = ({ view, end, start }) => {
      if (!view) return;

      updateTodayBtnVisibility({ start, end });
      // 更新标题
      setCalendarTitle(moment(view.title, 'YYYY年MM月').format('YYYY/MM'));
      // 获取起止时间
      let beginTime = moment(start).format('YYYY-MM-DD HH:mm');
      let endTime = moment(end).format('YYYY-MM-DD HH:mm');
      let searchData = {
        beginTime,
        endTime,
      };
      initCalendarViewData(searchData);
    };

    // 显示农历
    const getLunar = item => {
      if (unlunar !== '0') {
        return '';
      }
      let data = LunarCalendar.solarToLunar(item.date.getFullYear(), item.date.getMonth() + 1, item.date.getDate());
      return data.lunarDayName;
    };

    // 上月、下月、今天
    const navigateByType = action => {
      setState({ isChangeWeekOrMonth: action !== 'today' });

      if (dimension === 'month') {
        const calendarApi = getCalendarApi();
        if (!calendarApi) return;

        switch (action) {
          case 'prev':
            calendarApi.prev();
            break;
          case 'next':
            calendarApi.next();
            break;
          case 'today':
            calendarApi.today();
            break;
        }
        return;
      }

      const _weeklyCalendarRef = weeklyCalendarRef.current;
      if (!_weeklyCalendarRef) return;
      switch (action) {
        case 'prev':
          _weeklyCalendarRef?.shiftWeek(-1);
          break;
        case 'next':
          _weeklyCalendarRef?.shiftWeek(1);
          break;
        case 'today':
          _weeklyCalendarRef?.goToday();
          break;
      }
    };

    const getMonthCalendarData = () => {
      const calendarApi = getCalendarApi();
      const { view } = calendarApi;
      getEventsFn({
        view,
        start: view.activeStart,
        end: view.activeEnd,
      });
    };

    const recordUpdateCallback = (rowid, rowData) => {
      // 未排期弹层的数据需要手动更新
      if (isNotScheduled) {
        updateCalendarNotScheduled(rowid, rowData);
        return;
      }
      refreshCalendarViewData();
    };

    const recordDeleteCallback = rowid => {
      if (isNotScheduled) {
        deleteCalendarNotScheduled(rowid);
        return;
      }
      refreshCalendarViewData();
    };

    const refreshCalendarViewData = () => {
      if (dimension === 'month') {
        getMonthCalendarData();
      } else {
        weeklyCalendarRef.current?.refreshOneDayCalendarData();
      }
      getNotScheduledEventList({ onlyGetCount: true });
    };

    const handleMoreClick = info => {
      const now = Date.now();
      // 模拟双击
      if (now - lastClickTimeRef.current < 300) {
        clearTimeout(clickTimerRef.current);
      } else {
        clickTimerRef.current = setTimeout(() => {
          const dailyScheduleData = filterDailyScheduleData(calendarFormatData, info.date);
          setState({ dailyScheduleData, schedulesPopupVisible: true, dateInfo: info });
        }, 200);
      }

      lastClickTimeRef.current = now;
    };

    const openRecord = item => {
      const { clicktype, clickcid } = view.advancedSetting || {};
      // clicktype：点击操作 空或者0：打开记录 1：打开链接 2：无
      if (clicktype === '2') return;
      if (clicktype === '1') {
        let value = item[clickcid];
        if (RegExpValidator.isURL(value)) {
          window.open(value);
        }
        return;
      }

      if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
        window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId || view.viewId}/${
          item.rowid
        }`;
        return;
      }
      handlePushState('page', 'recordDetail');
      updatePreviewRecordId(item.rowid);
    };

    const openRecordWithDailySchedule = item => {
      setState({ isNotScheduled: false });
      openRecord(item);
    };

    const openRecordWithNotScheduled = item => {
      setState({ isNotScheduled: true });
      openRecord(item);
    };

    const onQueryChange = () => {
      handleReplaceState('page', 'recordDetail', () => updatePreviewRecordId(''));
    };

    const changeCalendarDimension = () => {
      setState({ dimension: dimension === 'month' ? 'week' : 'month', showTodayBtn: false });
    };

    const changeMonthDay = day => {
      setState({ monthDay: day });
    };

    useLayoutEffect(() => {
      window.addEventListener('popstate', onQueryChange);
      lastRangeRef.current = '';
      setState({
        ...initData,
      });
      getCalendarData();
      getNotScheduledEventList({ onlyGetCount: true });
      return () => {
        window.removeEventListener('popstate', onQueryChange);
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }
      };
    }, [viewId]);

    useEffect(() => {
      if (dimension === 'month') {
        getMonthCalendarData();
      }
    }, [viewId, dimension]);

    useEffect(() => {
      if (schedulesPopupVisible) {
        const dailyScheduleData = filterDailyScheduleData(calendarFormatData, dateInfo.date);
        setState({ dailyScheduleData });
        dailyScheduleRef.current?.updateDailyScheduleData(dailyScheduleData);
      }
    }, [viewId, calendarFormatData]);

    useImperativeHandle(ref, () => ({
      refreshCalendarViewData,
      dimension,
    }));

    return (
      <div className="mobileBoxCalendar" key={`calendar-${viewId}`}>
        <IconDimension dimension={dimension} changeDimension={changeCalendarDimension} />
        <div className="customCalendarHeader">
          <div className="calendarTitle">{calendarTitle}</div>
          <div className="calendarToolbar">
            <SchedulePopup
              controls={controls}
              base={base}
              worksheetInfo={worksheetInfo}
              view={view}
              calenderNotScheduled={calenderNotScheduled}
              getNotScheduledEventList={getNotScheduledEventList}
              resetCalendarNotScheduled={resetCalendarNotScheduled}
              openRecord={openRecordWithNotScheduled}
              refreshCalendarViewData={refreshCalendarViewData}
            />
            <div className="toolbarBox">
              {showTodayBtn && (
                <div className="toolbarItem todayBtn" onClick={() => navigateByType('today')}>
                  {_l('今天')}
                </div>
              )}
              <div className="toolbarItem" onClick={() => navigateByType('prev')}>
                <Icon icon="navigate_before" />
              </div>
              <div className="toolbarItem" onClick={() => navigateByType('next')}>
                <Icon icon="navigate_next" />
              </div>
            </div>
          </div>
        </div>
        {dimension === 'month' ? (
          <div className="fullCalendarWrapper">
            <FullCalendar
              key={`calendar-${viewId}-${monthDay}`}
              ref={calendarRef}
              themeSystem="bootstrap"
              plugins={[dayGridPlugin, interactionPlugin]}
              locale="zh-cn"
              initialView="dayGridMonth"
              initialDate={monthDay}
              defaultTimedEventDuration={'00:00:01'}
              events={calendarFormatData}
              headerToolbar={{
                start: '',
                center: '',
                end: '',
              }}
              height="100%"
              firstDay={weekBegin}
              dayMaxEventRows={showall === '0'}
              moreLinkContent={info => {
                return <div className="w100">{`+${info.num}`}</div>;
              }}
              allDayText={_l('全天')}
              eventOrder={'start'}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short',
                omitZeroMinute: true,
                hour12: hour24 === '0',
              }} // 任务的时间
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
              dayCellContent={item => {
                return (
                  <React.Fragment>
                    <span className="lunar">{getLunar(item)}</span>
                    <div className="dayNumBox num">
                      <span className="txt">{item.dayNumberText.replace('日', '')}</span>
                    </div>
                  </React.Fragment>
                );
              }}
              dayHeaderContent={({ date }) => {
                return <div className="num">{WEEK_DAYS[date.getDay()]}</div>;
              }}
              // 初始化以及切换日期时触发
              datesSet={info => {
                const rangeKey = moment(info.start).format('YYYY-MM-DD') + '_' + moment(info.end).format('YYYY-MM-DD');
                // 避免重复执行业务逻辑
                if (rangeKey === lastRangeRef.current) return;
                lastRangeRef.current = rangeKey;
                // 月发生变化，记录视图的第一天和月的第一天
                setState({
                  weekStartMonth: moment(info.start),
                  monthDay: moment(info.view.currentStart).format('YYYY-MM-DD'),
                });
                // 执行数据请求
                getEventsFn(info);
              }}
              // 任务日程的背景及文字颜色
              eventContent={arg => <EventContent eventArg={arg} />}
              eventDidMount={info => {
                // 让dateClick可以穿透任务条
                info.el.style.pointerEvents = 'none';
              }}
              // 点击日期
              dateClick={handleMoreClick}
              moreLinkClick={(info, jsEvent) => {
                handleMoreClick({ ...info, dateStr: moment(info.date).format('YYYY-MM-DD') });
                // 阻止所有默认行为
                jsEvent.preventDefault();
                jsEvent.stopPropagation();
                return;
              }}
            />
          </div>
        ) : (
          <WeeklyCalendar
            ref={weeklyCalendarRef}
            weekBegin={weekBegin}
            setCalendarTitle={setCalendarTitle}
            updateShowTodayBtn={updateShowTodayBtn}
            initCalendarViewData={initCalendarViewData}
            base={base}
            view={view}
            controls={controls}
            worksheetInfo={worksheetInfo}
            calendarView={calendarView}
            openRecord={openRecordWithDailySchedule}
            weekOneOfDate={isChangeWeekOrMonth ? weekStartMonth : moment()} // 周的某一天，如果切换过月，则取的是月的第一周的第一天，否则是今天
            changeMonthDay={changeMonthDay}
          />
        )}
        {schedulesPopupVisible && (
          <DailySchedule
            ref={dailyScheduleRef}
            visible={schedulesPopupVisible}
            title={dateInfo.dateStr}
            base={base}
            dailyScheduleData={dailyScheduleData}
            worksheetInfo={worksheetInfo}
            view={view}
            controls={controls}
            onClose={() => setState({ schedulesPopupVisible: false })}
            openRecord={openRecordWithDailySchedule}
          />
        )}
        <RecordInfoModal
          className="full"
          visible={!!previewRecordId}
          enablePayment={worksheetInfo.enablePayment}
          worksheetInfo={worksheetInfo}
          appId={base.appId}
          worksheetId={base.worksheetId}
          viewId={base.viewId || view.viewId}
          rowId={previewRecordId}
          sheetSwitchPermit={sheetSwitchPermit}
          canLoadSwitchRecord={false}
          onClose={() => updatePreviewRecordId('')}
          updateRow={recordUpdateCallback}
          deleteCallback={recordDeleteCallback}
          isCharge={isCharge}
        />
      </div>
    );
  }),
);

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'base',
      'worksheetInfo',
      'calendarView',
      'previewRecordId',
      'isCharge',
      'calenderNotScheduled',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'initCalendarViewData',
          'getCalendarData',
          'updatePreviewRecordId',
          'getNotScheduledEventList',
          'resetCalendarNotScheduled',
          'updateCalendarNotScheduled',
          'deleteCalendarNotScheduled',
        ]),
      },
      dispatch,
    ),
  null,
  { forwardRef: true },
)(Calendar);
