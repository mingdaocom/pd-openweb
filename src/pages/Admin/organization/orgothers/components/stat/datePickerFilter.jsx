import React, { useRef } from 'react';
import { DatePicker } from 'ming-ui';
import { DatePickerFilterWrap } from 'src/pages/Admin/common/styled';
import moment from 'moment';

const DATE_FILTER = [
  { id: 'today', text: _l('今天') },
  { id: 'currentWeek', text: _l('最近七天') },
  { id: 'currentMonth', text: _l('本月') },
  { id: 'prevMonth', text: _l('上月') },
  { id: 'currentYear', text: _l('今年') },
  { id: 'custom', text: _l('自定义日期') },
];

export default function datePickerFilter(props) {
  const { updateData } = props;
  const $ref = useRef(null);
  const formatDate = date => date.format('YYYY-MM-DD');
  let _endDate = formatDate(moment());
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
        return { startDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'M')), endDate: formatDate(moment(beginOfCurrentMonth).subtract(1, 'day')) };
      case 'currentYear':
        return { startDate: formatDate(moment().startOf('year')) , endDate: today };
    }
  };
  const handleClick = id => {
    const data = getDateFilter(id);
    updateData(data);
  };
  return (
    <DatePickerFilterWrap ref={$ref}>
      {DATE_FILTER.map(({ id, text }) =>
        id === 'custom' ? (
          <DatePicker.RangePicker
            offset={{ left: -533, top:  -220}}
            popupParentNode={() => $ref.current}
            max={moment(_endDate)}
            min={moment(_endDate).subtract(1, 'year')}
            onOk={([start, end]) => {
              updateData({ startDate: formatDate(start), endDate: formatDate(end) });
            }}
            onClear={() => {
              const data = getDateFilter('currentMonth');
              updateData(data);
            }}
            onSelect={(selectedValue) => {
              if(selectedValue&&selectedValue[1]) {
                _endDate = formatDate(moment(selectedValue[1]))
              }
            }}
          >
            <li>{text}</li>
          </DatePicker.RangePicker>
        ) : (
          <li key={id} onClick={() => handleClick(id)}>
            {text}
          </li>
        )
      )}
    </DatePickerFilterWrap>
  );
}
