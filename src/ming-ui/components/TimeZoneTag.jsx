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
  border-left: 1px solid #ccc;
  color: #9e9e9e;
  background: #fff;
`;

export default function TimeZoneTag(props) {
  const { appId, position = {}, displayFixedValue } = props;

  const appTimeZone = window[`timeZone_${appId}`];

  const isBusinessRule = /\/worksheet\/formSet\/edit\/(\w{24})\/display/.test(location.pathname); //是业务规则页

  if (
    _.isUndefined(appTimeZone) ||
    (md.global.Account.timeZone === 1 ? moment().utcOffset() : md.global.Account.timeZone) ===
      (appTimeZone === 1 ? moment().utcOffset() : appTimeZone)
  ) {
    return '';
  }

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

  return (
    <TimeZone className="timeZoneTag" style={position}>
      {getTimeZoneText(displayFixedValue || isBusinessRule ? md.global.Config.DefaultTimeZone : appTimeZone)}
    </TimeZone>
  );
}
