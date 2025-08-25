import React, { useRef } from 'react';
import moment from 'moment';
import { DatePicker } from 'ming-ui';
import Config from '../config';
import { DatePickerFilterWrap } from './styled';

export default props => {
  const { updateData, dataConfig, ...rest } = props;
  const $ref = useRef(null);
  const formatDate = date => date.format('YYYY-MM-DD');
  const getDateFilter = (id, pastDays) => {
    const today = formatDate(moment());
    const yesterday = formatDate(moment().subtract(1, 'day'));
    const beginOfCurrentMonth = moment().startOf('M');
    switch (id) {
      case 'today':
        return { startDate: today, endDate: today };
      case 'yesterday':
      case 'pastSevenDays':
      case 'pastThirtyDays':
        return {
          startDate: formatDate(moment().subtract(pastDays, 'day')),
          endDate: id === 'yesterday' ? yesterday : today,
        };
      case 'currentWeek':
        return { startDate: formatDate(moment().subtract(7, 'd')), endDate: today };
      case 'currentMonth':
        return { startDate: formatDate(beginOfCurrentMonth), endDate: today };
      case 'prevMonth':
        return {
          startDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'M')),
          endDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'day')),
        };
    }
  };
  const handleClick = (id, pastDays) => {
    const data = getDateFilter(id, pastDays);
    updateData({ ...data, dateItem: id });
  };
  return (
    <DatePickerFilterWrap ref={$ref}>
      {(dataConfig || Config.DATE_FILTER).map(({ id, text, pastDays }) =>
        id === 'custom' ? (
          <DatePicker.RangePicker
            offset={{ left: -533, top: -185 }}
            popupParentNode={() => $ref.current}
            onOk={([start, end]) => {
              updateData({ startDate: formatDate(start), endDate: formatDate(end), dateItem: id });
            }}
            onClear={() => updateData({ startDate: '', endDate: '' })}
            onSelect={() => {}}
            {...rest}
          >
            <li>{text}</li>
          </DatePicker.RangePicker>
        ) : (
          <li key={id} onClick={() => handleClick(id, pastDays)}>
            {text}
          </li>
        ),
      )}
    </DatePickerFilterWrap>
  );
};
