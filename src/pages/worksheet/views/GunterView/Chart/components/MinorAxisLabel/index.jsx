import React, { Fragment } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { PERIOD_TYPE } from 'worksheet/views/GunterView/config';

const AxisLabel = styled.div`
  color: #151515;
  font-size: 12px;
  text-align: center;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-left: -3px;
    position: absolute;
    bottom: 0;
    background-color: #f44336;
  }
`;

const formatDate = (date, type) => {
  const [, month, day] = date.split('-');
  if (type === PERIOD_TYPE.day) {
    return day;
  }
  if (type === PERIOD_TYPE.week) {
    const time = moment(date);
    const week = time.isoWeek();
    return (
      <Fragment>
        {week}
        {_l('周%05034')}
      </Fragment>
    );
  }
  if (type === PERIOD_TYPE.month) {
    return _l('%0月', month);
  }
  if (type === PERIOD_TYPE.quarter) {
    return `Q${moment(date).quarter()}`;
  }
  if (type === PERIOD_TYPE.year) {
    return month == '01' ? _l('上半年') : _l('下半年');
  }
  return date;
};

const MinorAxisLabel = props => {
  const { index, item, periodType } = props;
  const title = formatDate(item.time, periodType);
  return (
    <AxisLabel
      key={index}
      className="axis-label"
      title={periodType === PERIOD_TYPE.week ? title : null}
      style={{ width: item.width }}
    >
      <span>{title}</span>
      {item.isToday && <div className="dot" style={{ left: item.left }}></div>}
    </AxisLabel>
  );
};

export default MinorAxisLabel;
