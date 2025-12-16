import React, { memo } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { isLightColor } from 'src/utils/control';

// import { isTimeStyle } from '../../util';

const EventContentWrapper = styled.div`
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${props =>
    props.timeText
      ? `border-left: 2px solid ${props.event.backgroundColor};`
      : `
        background-color: ${props.event.backgroundColor};
        color: ${isLightColor(props.event.backgroundColor) ? 'var(--color-text-primary)' : 'var(--color-background-primary)'};
        `}
  .timeText {
    margin-right: 10px;
    font-weight: 400;
  }
  .mark {
    margin-left: 10px;
    opacity: 0.4;
  }
`;

const EventContent = props => {
  const { event = {}, timeText } = props.eventArg;
  const extendedProps = _.get(event, 'extendedProps', {});
  const { mark = '' } = extendedProps;
  // const { mark = '', startData } = extendedProps;
  // const showTimeText = isTimeStyle(startData) && !event.allDay;

  return (
    <EventContentWrapper timeText={timeText} mark={mark} event={event}>
      {/* {timeText && showTimeText && <span className="timeText">{timeText}</span>} */}
      {event.title}
      {mark && <span className="mark">{mark}</span>}
    </EventContentWrapper>
  );
};

export default memo(EventContent);
