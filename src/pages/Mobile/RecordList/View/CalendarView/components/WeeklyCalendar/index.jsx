import React, { forwardRef, Fragment, memo, useEffect, useImperativeHandle } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import { LoadDiv, ScrollView } from 'ming-ui';
import RecordCard from 'mobile/RecordList/RecordCard';
import { getFormateView, WEEK_DAYS } from '../../util';
import EmptyStatus from '../EmptyStatus';
import {
  calcDateByWeekAndIndex,
  calcDayIndex,
  FORMAT,
  formatDateWithWeekday,
  getCurrentWeekDates,
  getWeekTitle,
} from './util';
import './index.less';

const WeeklyCalendar = forwardRef((props, ref) => {
  const {
    weekBegin = 1,
    setCalendarTitle = () => {},
    updateShowTodayBtn = () => {},
    initCalendarViewData = () => {},
    base,
    view,
    controls,
    worksheetInfo,
    calendarView,
    openRecord,
    weekOneOfDate,
    changeMonthDay,
  } = props;
  const todayStr = moment().format(FORMAT);
  const { calendarFormatData, loading } = calendarView;

  const [{ weekDates, selectedDate, selectedDayIndex, delayRender }, setState] = useSetState({
    weekDates: [],
    selectedDate: null,
    selectedDayIndex: null,
    delayRender: true,
  });

  const updateSelectDate = dateStr => {
    if (dateStr === selectedDate) return;

    updateShowTodayBtn(dateStr !== todayStr);
    setState({ selectedDate: dateStr, selectedDayIndex: calcDayIndex(dateStr, weekBegin) });
    getOneDayCalendarData(dateStr);
  };

  const loadWeek = baseDate => {
    changeMonthDay(baseDate.format('YYYY-MM-DD'));
    const dates = getCurrentWeekDates(baseDate, weekBegin);
    setState({ weekDates: dates });
    setCalendarTitle(getWeekTitle(dates));

    const isForceToday = baseDate.isSame(moment(), 'day');
    if (isForceToday) {
      updateSelectDate(todayStr);
      return;
    }
    // 其他周，选中对应的日期
    const newSelectedDate = calcDateByWeekAndIndex(dates[0], selectedDayIndex);
    updateSelectDate(newSelectedDate);
  };

  // direction: -1 上一周, 1 下一周
  const shiftWeek = direction => {
    const targetDate = moment(weekDates[0]).add(direction * 7, 'days');
    loadWeek(targetDate);
  };

  // 回到今天
  const goToday = () => {
    loadWeek(moment());
  };

  // 获取当前选中日期的数据
  const getOneDayCalendarData = (dateStr, isSilent = false) => {
    // 计算当天零点时间和第二天零点时间
    const beginTime = moment(dateStr).startOf('day').format('YYYY-MM-DD HH:mm:ss');
    // 当天 23:59:59
    const endTime = moment(dateStr).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    initCalendarViewData({
      beginTime,
      endTime,
      isSilent,
    });
  };

  // 刷新
  const refreshOneDayCalendarData = () => {
    getOneDayCalendarData(selectedDate, true);
  };

  useEffect(() => {
    loadWeek(weekOneOfDate);
  }, [weekBegin]);

  useEffect(() => {
    setTimeout(() => {
      setState({ delayRender: false });
    }, 800);
  }, []);

  useImperativeHandle(ref, () => ({
    shiftWeek,
    goToday,
    refreshOneDayCalendarData,
  }));

  return (
    <div className="weeklyCalendarContainer">
      <div className="weeklyCalendarHeader">
        {weekDates.length > 0 &&
          weekDates.map(date => {
            const dateStr = date.format(FORMAT);
            return (
              <div className="weeklyCalendarItem" key={dateStr} onClick={() => updateSelectDate(dateStr)}>
                <div
                  className={cx('weeklyCalendarDate', {
                    isToday: dateStr === todayStr,
                    isSelected: dateStr === selectedDate,
                  })}
                >
                  {date.date() || ''}
                </div>
                <div className="weeklyCalendarWeek">{WEEK_DAYS[date.day()] || ''}</div>
              </div>
            );
          })}
      </div>
      <ScrollView className="weeklyCalendarContent">
        {loading || delayRender ? (
          <div className="weeklyCalendarLoading">
            <LoadDiv />
          </div>
        ) : (
          <Fragment>
            <div className="selectedDate">{formatDateWithWeekday(selectedDate)}</div>
            {calendarFormatData.length > 0 ? (
              <div className="weeklyCalendarContentList">
                {calendarFormatData.map(item => (
                  <RecordCard
                    key={`${item.originalProps.rowid}-${item.mark}`}
                    data={item.originalProps}
                    view={getFormateView(view, item)}
                    appId={base.appId}
                    projectId={worksheetInfo.projectId}
                    controls={controls}
                    mark={item.mark}
                    onClick={() => openRecord(item.originalProps)}
                  />
                ))}
              </div>
            ) : (
              <div className="weeklyCalendarEmpty">
                <EmptyStatus />
              </div>
            )}
          </Fragment>
        )}
      </ScrollView>
    </div>
  );
});

export default memo(WeeklyCalendar);
