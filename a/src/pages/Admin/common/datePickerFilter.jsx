import React, { useRef } from 'react';
import { string } from 'prop-types';
import { DatePicker } from 'ming-ui';
import Config from '../config';
import { DatePickerFilterWrap } from './styled';
import moment from 'moment';

export default function datePickerFilter(props) {
  const { updateData } = props;
  const $ref = useRef(null);
  const formatDate = date => date.format('YYYY-MM-DD');
  const getDateFilter = id => {
    const today = formatDate(moment());
    const beginOfCurrentMonth = moment().startOf('M');
    switch (id) {
      case 'today':
        return { startDate: today, endDate: today };
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
  const handleClick = id => {
    const data = getDateFilter(id);
    updateData(data);
  };
  return (
    <DatePickerFilterWrap ref={$ref}>
      {Config.DATE_FILTER.map(({ id, text }) =>
        id === 'custom' ? (
          <DatePicker.RangePicker
            offset={{ left: -533, top: -185 }}
            popupParentNode={() => $ref.current}
            onOk={([start, end]) => {
              updateData({ startDate: formatDate(start), endDate: formatDate(end) });
            }}
            onClear={() => updateData({ startDate: '', endDate: '' })}
            onSelect={() => {}}
          >
            <li>{text}</li>
          </DatePicker.RangePicker>
        ) : (
          <li key={id} onClick={() => handleClick(id)}>
            {text}
          </li>
        ),
      )}
    </DatePickerFilterWrap>
  );
}
