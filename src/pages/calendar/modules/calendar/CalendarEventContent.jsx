import React from 'react';
import classNames from 'classnames';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getEventCategoryColorClass } from './eventData';

export default function CalendarEventContent({ event, timeText, showCategoryDot, showMemberAvatar }) {
  const { head, isOtherCalendar, isTask } = event.extendedProps;
  const displayTime = isTask && event.end ? moment(event.end).format('HH:mm') : timeText;
  const title = `${displayTime ? `${displayTime} ` : ''}${event.title}`;
  const categoryColorClassName = getEventCategoryColorClass(event);

  return (
    <Tooltip title={title} mouseEnterDelay={0.4}>
      <span className="reactCalendarEventContent">
        {isTask && <Icon icon="calendartask" className="reactCalendarEventIcon" />}
        {!isTask && showMemberAvatar && head && <img className="reactCalendarEventAvatar" src={head} alt="" />}
        {!isTask && showCategoryDot && <span className={`reactCalendarEventColorDot ${categoryColorClassName}`} />}
        <span
          className={classNames('reactCalendarEventTitle', {
            reactCalendarEventTitleOther: showCategoryDot && isOtherCalendar,
          })}
        >
          {event.title}
        </span>
      </span>
    </Tooltip>
  );
}
