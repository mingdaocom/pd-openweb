import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';

const TimeZone = styled.div`
  font-family: Arial Narrow;
  font-size: 12px;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4px;
  display: flex;
  align-items: center;
  padding-left: 4px;
  border-left: 1px solid var(--color-border-tertiary);
  color: var(--color-text-tertiary);
  background: var(--color-background-primary);
`;

const getTimeZoneText = timeZone => {
  const isInteger = Number.isInteger(timeZone / 60);
  const utcTag = isInteger ? 'UTC' : '';
  const symbol = timeZone > 0 ? '+' : timeZone < 0 ? '-' : '';
  const num = timeZone
    ? isInteger
      ? Math.abs(timeZone / 60)
      : String(Math.floor(Math.abs(timeZone / 60))).padStart(2, '0')
    : '';
  const extra = !isInteger ? Math.abs(timeZone) % 60 : '';

  return utcTag + symbol + num + extra;
};

/** 应用时区与当前用户时区不一致时才需要展示时区标记 */
export function shouldShowTimeZoneTag(appId) {
  const appTimeZone = window[`timeZone_${appId}`];

  if (_.isUndefined(appTimeZone)) return false;

  const toOffset = timeZone => (timeZone === 1 ? moment().utcOffset() : timeZone);

  return toOffset(md.global.Account.timeZone) !== toOffset(appTimeZone);
}

export default function TimeZoneTag(props) {
  const { appId, position = {}, displayFixedValue } = props;

  const appTimeZone = window[`timeZone_${appId}`];

  if (!shouldShowTimeZoneTag(appId)) {
    return '';
  }

  return (
    <TimeZone className="timeZoneTag" style={position}>
      {getTimeZoneText(displayFixedValue ? md.global.Config.DefaultTimeZone : appTimeZone)}
    </TimeZone>
  );
}
