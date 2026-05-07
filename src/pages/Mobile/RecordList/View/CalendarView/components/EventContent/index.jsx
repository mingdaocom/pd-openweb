import React, { memo, useEffect, useRef } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { RECORD_COLOR_SHOW_TYPE } from 'worksheet/constants/enum';

const EventContentWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 4px;
  height: 16px;
  line-height: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .mark {
    margin-left: 6px;
    opacity: 0.4;
  }
`;

const EventContent = props => {
  const { eventArg, colortype } = props;
  const { event = {} } = eventArg;
  const extendedProps = _.get(event, 'extendedProps', {});
  const { stringColor, backgroundColor, textColor, borderColor, recordColor, mark = '' } = extendedProps;

  const ref = useRef(null);

  const style = {
    backgroundColor: colortype !== RECORD_COLOR_SHOW_TYPE.LINE || !recordColor ? backgroundColor : 'transparent',
    color: textColor,
    borderLeft:
      [RECORD_COLOR_SHOW_TYPE.LINE, RECORD_COLOR_SHOW_TYPE.LINE_BG].includes(colortype) && recordColor
        ? `2px solid ${stringColor}`
        : 'none',
  };

  const borderStyle = {
    borderColor,
  };

  // 👇 核心逻辑
  useEffect(() => {
    if (!ref.current) return;

    const parentA = ref.current.closest('a.fc-event');

    if (parentA) {
      Object.assign(parentA.style, borderStyle);
    }
  }, [style]);

  return (
    <EventContentWrapper ref={ref} style={style}>
      {event.title}
      {mark && <span className="mark">{mark}</span>}
    </EventContentWrapper>
  );
};

export default memo(EventContent);
