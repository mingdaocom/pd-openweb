import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import classNames from 'classnames';
import moment from 'moment';
import calendarAjax from 'src/api/calendar';
import createCalendar from 'src/components/createCalendar/load';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import afterRefreshOp from '../calendarDetail/lib/afterRefreshOp';
import recurCalendarUpdate from '../calendarDetail/lib/recurCalendarUpdateDialog';
import CalendarEventContent from './CalendarEventContent';
import CalendarList from './CalendarList';
import { CALENDAR_SETTINGS_KEY, loadCalendarSettings } from './calendarPreferences';
import CalendarSettings from './CalendarSettings';
import CalendarToolbar from './CalendarToolbar';
import { getCategoryIds, getEventTimeDelta, isOtherCalendarEvent, normalizeCalendarEvent } from './eventData';
import { getCalendarLocale, getCalendarTitle, LEGACY_VIEW_TYPES, VIEW_TYPES } from './viewConfig';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import './calendar.less';

const DOUBLE_CLICK_INTERVAL = 500;
const CREATE_HINT_DELAY = 250;
const CREATE_HINT_OFFSET = 15;
const CREATE_HINT_WIDTH = 90;
const MORE_POPOVER_PADDING = 10;

const fitMorePopoverWithinView = calendarElement => {
  const popover = calendarElement?.querySelector('.fc-more-popover');
  const viewHarness = popover?.parentElement;
  const offsetParent = popover?.offsetParent;

  if (!popover || !viewHarness || !offsetParent) return;

  // FullCalendar 5 只限制浮层的顶部和左右边界，底行浮层需在被裁剪的日历区域内重新定位。
  popover.style.maxHeight = '';

  const viewRect = viewHarness.getBoundingClientRect();
  const topBoundary = Math.max(viewRect.top, 0) + MORE_POPOVER_PADDING;
  const bottomBoundary = Math.min(viewRect.bottom, document.documentElement.clientHeight) - MORE_POPOVER_PADDING;
  const availableHeight = bottomBoundary - topBoundary;

  if (availableHeight <= 0) return;

  const dateCell = popover.dataset.date
    ? calendarElement.querySelector(`.fc-daygrid-day[data-date="${popover.dataset.date}"]`)
    : null;
  const preferredTop = dateCell?.getBoundingClientRect().top ?? popover.getBoundingClientRect().top;

  popover.style.maxHeight = `${availableHeight}px`;

  const popoverHeight = popover.getBoundingClientRect().height;
  const nextTop = Math.max(topBoundary, Math.min(preferredTop, bottomBoundary - popoverHeight));
  const offsetParentTop = offsetParent.getBoundingClientRect().top;

  popover.style.top = `${nextTop - offsetParentTop}px`;
};

export default function CalendarView({
  filters,
  initialDate,
  initialView,
  onLoadingChange,
  onOpenDetail,
  onOpenTask,
  onPositionChange,
  refreshToken,
}) {
  const calendarRef = useRef(null);
  const calendarContainerRef = useRef(null);
  const pendingEventIdsRef = useRef(new Set());
  const selectedRangeRef = useRef(null);
  const lastDateClickRef = useRef(null);
  const createHintTimerRef = useRef(null);
  const morePopoverFrameRef = useRef(null);
  const [view, setView] = useState(initialView);
  const [settings, setSettings] = useState(loadCalendarSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const calendarViews = useMemo(() => ({ timeGridWeek: { weekends: settings.weekDays === 7 } }), [settings.weekDays]);
  const [listRefreshToken, setListRefreshToken] = useState(0);
  const [title, setTitle] = useState(() =>
    getCalendarTitle(VIEW_TYPES[initialView], initialDate, undefined, settings.firstDay),
  );
  const [createHintPosition, setCreateHintPosition] = useState(null);
  const calendarLocale = useMemo(() => getCalendarLocale(), []);
  const showMemberAvatar =
    filters.memberIds.length > 1 ||
    (filters.memberIds.length === 1 && filters.memberIds[0] !== md.global.Account.accountId);

  const hideCreateHint = useCallback(() => {
    clearTimeout(createHintTimerRef.current);
    createHintTimerRef.current = null;
    setCreateHintPosition(null);
  }, []);

  const scheduleMorePopoverLayout = useCallback(() => {
    cancelAnimationFrame(morePopoverFrameRef.current);
    morePopoverFrameRef.current = requestAnimationFrame(() => {
      morePopoverFrameRef.current = null;
      fitMorePopoverWithinView(calendarContainerRef.current);
    });
  }, []);

  useEffect(
    () => () => {
      clearTimeout(createHintTimerRef.current);
      cancelAnimationFrame(morePopoverFrameRef.current);
    },
    [],
  );

  const handleCalendarMouseMove = useCallback(
    event => {
      hideCreateHint();

      const target = event.target;
      const isCalendarBody = target.closest?.('.fc-view tbody');
      const isBlockedTarget = target.closest?.(
        '.fc-event, .fc-more-link, .fc-popover, .fc-timegrid-axis, .fc-timegrid-slot-label',
      );

      if (!isCalendarBody || isBlockedTarget || event.buttons & 1) return;

      const { clientX, clientY } = event;
      createHintTimerRef.current = setTimeout(() => {
        const showOnLeft = clientX + CREATE_HINT_OFFSET + CREATE_HINT_WIDTH > window.innerWidth;

        setCreateHintPosition({
          left: clientX + (showOnLeft ? -CREATE_HINT_OFFSET - CREATE_HINT_WIDTH : CREATE_HINT_OFFSET),
          top: clientY + CREATE_HINT_OFFSET,
        });
      }, CREATE_HINT_DELAY);
    },
    [hideCreateHint],
  );

  const refresh = useCallback(() => {
    if (view === 'list') {
      setListRefreshToken(current => current + 1);
    } else {
      calendarRef.current?.getApi().refetchEvents();
    }
  }, [view]);

  const handleViewChange = nextView => {
    const today = new Date();
    hideCreateHint();
    setView(nextView);
    safeLocalStorageSetItem('lastView', nextView);
    onPositionChange({ view: nextView, date: today });
    if (nextView === 'list') {
      setTitle(getCalendarTitle('list'));
    }
  };

  const fetchEvents = useCallback(
    (info, successCallback, failureCallback) => {
      onLoadingChange(true);
      calendarAjax
        .getCalendars({
          startDate: info.startStr,
          endDate: info.endStr,
          filterTaskType: filters.filterTaskType,
          memberIDs: filters.memberIds.join(','),
          isWorkCalendar: filters.isWorkCalendar,
          isTaskCalendar: filters.isTaskCalendar,
          categoryIDs: getCategoryIds(filters.categoryIds),
        })
        .then(source => {
          if (source.code !== 1) throw new Error(source.msg || _l('日程加载失败'));

          successCallback(
            (source.data?.calendars || []).map(calendar => {
              const isOtherCalendar = isOtherCalendarEvent(calendar);
              const normalizedCalendar = normalizeCalendarEvent(calendar);

              return isOtherCalendar ? { ...normalizedCalendar, isOtherCalendar } : normalizedCalendar;
            }),
          );
        })
        .catch(error => {
          console.error(error);
          failureCallback(error);
          alertIfNotUnauthorized(error, _l('日程加载失败'), 3);
        })
        .finally(() => onLoadingChange(false));
    },
    [filters, onLoadingChange],
  );

  // 筛选和外部刷新统一更新事件源，由 FullCalendar 加载一次。
  const eventSources = useMemo(() => [{ id: String(refreshToken), events: fetchEvents }], [fetchEvents, refreshToken]);

  const handleDateClick = info => {
    const currentClick = {
      key: `${info.allDay ? 'allDay' : 'time'}-${info.dateStr}`,
      time: info.jsEvent.timeStamp,
    };
    const lastClick = lastDateClickRef.current;
    lastDateClickRef.current = currentClick;
    const clickInterval = currentClick.time - (lastClick?.time || 0);
    const isSameDate = lastClick?.key === currentClick.key;
    const isFirefoxDoubleClick = isSameDate && clickInterval >= 0 && clickInterval <= DOUBLE_CLICK_INTERVAL;

    // FullCalendar 5 透传的是 mouseup，Firefox 不会可靠地通过 detail 提供双击次数
    if (!isSameDate || (info.jsEvent.detail !== 2 && !isFirefoxDoubleClick)) return;

    lastDateClickRef.current = null;
    hideCreateHint();

    const start = moment(info.date);
    const settings = info.allDay
      ? start.isSame(moment(), 'day')
        ? {}
        : {
            Start: start.clone().hour(10).format('YYYY-MM-DD HH:mm:ss'),
            End: start.clone().hour(11).format('YYYY-MM-DD HH:mm:ss'),
            AllDay: true,
          }
      : {
          Start: start.format(),
          End: start.clone().add(30, 'minutes').format(),
          AllDay: false,
        };
    createCalendar({ ...settings, callback: refresh });
  };

  const handleSelect = info => {
    const duration = moment(info.end).diff(moment(info.start), 'minutes');

    if ((info.allDay && duration <= 24 * 60) || (!info.allDay && duration <= 30)) {
      selectedRangeRef.current = { start: info.start, end: info.end, allDay: info.allDay };
      return;
    }

    selectedRangeRef.current = null;
    createCalendar({
      Start: moment(info.start).format(),
      End: moment(info.end)
        .subtract(info.allDay ? 1 : 0, 'day')
        .format(),
      AllDay: info.allDay,
      callback: refresh,
    });
  };

  const openSelectedRange = () => {
    const selectedRange = selectedRangeRef.current;

    if (!selectedRange) return;

    calendarRef.current?.getApi().unselect();
    createCalendar({
      Start: moment(selectedRange.start).format(),
      End: moment(selectedRange.end)
        .subtract(selectedRange.allDay ? 1 : 0, 'day')
        .format(),
      AllDay: selectedRange.allDay,
      callback: refresh,
    });
  };

  const handleSelectedRangeClick = event => {
    if (event.detail !== 2 || !event.target.closest?.('.fc-event-mirror')) return;

    event.preventDefault();
    event.stopPropagation();
    openSelectedRange();
  };

  const updateEventTime = (info, isResize) => {
    const { event, revert } = info;
    const delta = getEventTimeDelta(info, isResize);
    const eventData = event.extendedProps;

    if (eventData.isTask) {
      alert(_l('任务不可更改'), 3);
      revert();
      return;
    }

    if (!eventData.canEdit) {
      alert(_l('您没有权限修改该日程'), 3);
      revert();
      return;
    }

    if (pendingEventIdsRef.current.has(event.id)) {
      revert();
      return;
    }

    pendingEventIdsRef.current.add(event.id);
    const releasePending = () => pendingEventIdsRef.current.delete(event.id);

    const cancelChange = () => {
      releasePending();
      revert();
    };

    const saveEventTime = (reInvite, directRun) => {
      recurCalendarUpdate(
        {
          operatorTitle: _l('您确定更改日程信息吗?'),
          recurTitle: _l('您确定编辑重复日程吗?'),
          recurCalendarUpdateFun: isAllCalendar => {
            const isAllDay = event.allDay || eventData.isAllDay;
            let start = isAllCalendar ? eventData.oldStartTime : event.start;
            let end = isAllCalendar ? eventData.oldEndTime : event.end || event.start;

            if (isAllDay && !isAllCalendar) end = moment(end).subtract(1, 'day');

            calendarAjax
              .editCalendarTime({
                calendarID: event.id,
                start: moment(start).toISOString(),
                end: moment(end).toISOString(),
                dayDelta: delta.days || 0,
                minuteDelta: (delta.milliseconds || 0) / 60000,
                isAll: isAllDay,
                isResize,
                reType: reInvite,
                recurTime: eventData.recurTime ? moment(eventData.recurTime).toISOString() : '',
                isAllCalendar,
              })
              .then(resource => {
                if (resource.code !== 1) throw new Error(resource.msg);
                alert(_l('操作成功'));
                refresh();
              })
              .catch(error => {
                console.error(error);
                revert();
                alertIfNotUnauthorized(error, _l('操作失败'), 3);
              })
              .finally(releasePending);
          },
        },
        { originRecur: eventData.isRecur, isChildCalendar: eventData.isChildCalendar },
        { directRun, callback: cancelChange },
      );
    };

    if (eventData.hasMember) {
      afterRefreshOp((reInvite, directRun) => saveEventTime(reInvite, directRun), cancelChange);
    } else {
      saveEventTime(false, false);
    }
  };

  return (
    <div className="reactCalendarRoot">
      <CalendarToolbar
        calendarRef={calendarRef}
        title={title}
        view={view}
        onCreate={() => createCalendar({ callback: refresh })}
        onViewChange={handleViewChange}
        onOpenSettings={() => {
          hideCreateHint();
          setSettingsOpen(true);
        }}
      />
      {settingsOpen && (
        <CalendarSettings
          settings={settings}
          showWeekDays={view !== 'month'}
          onClose={() => setSettingsOpen(false)}
          onSave={nextSettings => {
            safeLocalStorageSetItem(CALENDAR_SETTINGS_KEY, JSON.stringify(nextSettings));
            setSettings({ ...nextSettings });
            setSettingsOpen(false);
          }}
        />
      )}
      {view === 'list' ? (
        <CalendarList
          filters={filters}
          refreshToken={`${refreshToken}-${listRefreshToken}`}
          onOpenDetail={onOpenDetail}
          onOpenTask={onOpenTask}
          onLoadingChange={onLoadingChange}
        />
      ) : (
        <div
          ref={calendarContainerRef}
          className={classNames('reactFullCalendar', { reactFullCalendarWeek: view === 'agendaWeek' })}
          onClickCapture={handleSelectedRangeClick}
          onMouseDownCapture={hideCreateHint}
          onMouseLeave={hideCreateHint}
          onMouseMove={handleCalendarMouseMove}
          onScrollCapture={hideCreateHint}
        >
          {/* 按视图重新挂载，一次性应用目标日期和事件源，避免 changeView 使用旧视图闭包请求。 */}
          <FullCalendar
            key={view}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialDate={initialDate}
            initialView={VIEW_TYPES[view] || VIEW_TYPES.agendaDay}
            headerToolbar={false}
            locale={calendarLocale}
            firstDay={settings.firstDay}
            views={calendarViews}
            height="100%"
            expandRows={view === 'month'}
            nowIndicator
            selectable
            selectMirror
            editable
            dayMaxEvents
            moreLinkClick={scheduleMorePopoverLayout}
            eventResizableFromStart
            allDayText={_l('全天')}
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            scrollTime={moment().subtract(170, 'minutes').format('HH:mm:ss')}
            eventSources={eventSources}
            datesSet={info => {
              setTitle(
                getCalendarTitle(info.view.type, info.view.currentStart, info.view.currentEnd, settings.firstDay),
              );
              const legacyView = LEGACY_VIEW_TYPES[info.view.type];

              if (legacyView && legacyView !== view) {
                setView(legacyView);
                onPositionChange({ view: legacyView });
              }

              onPositionChange({ date: info.view.currentStart });
            }}
            dateClick={handleDateClick}
            select={handleSelect}
            unselect={() => {
              selectedRangeRef.current = null;
            }}
            unselectCancel=".fc-event-mirror"
            eventClick={({ el, event }) => {
              if (el.classList.contains('fc-event-mirror')) return;

              const eventData = event.extendedProps;

              if (eventData.isTask) {
                onOpenTask(eventData.eventID || event.id);
              } else if (!eventData.canLook) {
                alert(_l('该日程为他人的私密日程，无法查看'), 3);
              } else {
                onOpenDetail({
                  calendarId: event.id,
                  recurTime: eventData.recurTime ? moment(eventData.recurTime).toISOString() : '',
                });
              }
            }}
            eventContent={({ event, isMirror, timeText }) =>
              isMirror && !event.id ? (
                <span className="reactCalendarSelectionTime">{timeText}</span>
              ) : (
                <CalendarEventContent
                  event={event}
                  timeText={timeText}
                  showCategoryDot={view === 'month'}
                  showMemberAvatar={showMemberAvatar}
                />
              )
            }
            eventDrop={info => updateEventTime(info, false)}
            eventResize={info => updateEventTime(info, true)}
          />
          {createHintPosition && (
            <div
              className="reactCalendarCreateHint flexRow alignItemsCenter justifyContentCenter"
              role="tooltip"
              style={createHintPosition}
            >
              {_l('双击创建日程')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
