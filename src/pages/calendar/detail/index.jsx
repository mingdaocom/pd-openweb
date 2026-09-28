import React, { useEffect } from 'react';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { CalendarDetailContainer } from '../modules/calendarDetail';
import { getParamsFromUrl } from '../modules/calendarDetail/common';
import './style.less';

export default function CalendarDetailEntrypoint() {
  const { calendarId, recurTime = '' } = getParamsFromUrl();

  useEffect(() => {
    document.documentElement.classList.add('AppCalendar', 'AppCalendarDetail');
    return () => document.documentElement.classList.remove('AppCalendar', 'AppCalendarDetail');
  }, []);

  return (
    <div className="borderContainer Relative flexColumn">
      <div className="detail flex">
        <CalendarDetailContainer
          isDetailPage
          calendarId={calendarId}
          recurTime={recurTime}
          onExit={() => {
            window.location.href = pathCompletion('/apps/calendar/home');
          }}
        />
      </div>
    </div>
  );
}
