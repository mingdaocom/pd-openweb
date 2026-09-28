import React, { useState } from 'react';
import moment from 'moment';
import { DatePicker, Menu } from 'ming-ui/antd-components';

const RANGE_PICKER_TRIGGER_STYLE = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
};
const DATE_FILTER_MENU_STYLE = { minWidth: 120 };

const DATE_FILTER = [
  { id: 'today', text: _l('今天') },
  { id: 'currentWeek', text: _l('最近七天') },
  { id: 'currentMonth', text: _l('本月') },
  { id: 'prevMonth', text: _l('上月') },
  { id: 'currentYear', text: _l('今年') },
  { id: 'custom', text: _l('自定义日期') },
];

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
    case 'currentYear':
      return { startDate: formatDate(moment().startOf('year')), endDate: today };
  }
};

export default function DatePickerFilter(props) {
  const { updateData } = props;
  const [dateBounds, setDateBounds] = useState(null);

  const handleClick = id => {
    const data = getDateFilter(id);
    updateData(data);
  };

  const handleRangeChange = range => {
    if (range && (range.length !== 2 || range.some(date => !date))) return;

    setDateBounds(null);
    updateData(
      range ? { startDate: formatDate(range[0]), endDate: formatDate(range[1]) } : getDateFilter('currentMonth'),
    );
  };

  const items = DATE_FILTER.map(({ id, text }) => {
    if (id !== 'custom') {
      return { key: id, label: text, onClick: () => handleClick(id) };
    }

    return {
      key: id,
      label: (
        <div
          className="Relative"
          onClick={event => {
            event.stopPropagation();
            const maxDate = moment().endOf('day');

            setDateBounds({ maxDate, minDate: maxDate.clone().subtract(1, 'year').startOf('day') });
          }}
        >
          {text}
          {dateBounds && (
            <DatePicker.RangePicker
              disabledDate={current =>
                current && (current.isBefore(dateBounds.minDate, 'day') || current.isAfter(dateBounds.maxDate, 'day'))
              }
              format="YYYY-MM-DD"
              open
              placement="bottomRight"
              style={RANGE_PICKER_TRIGGER_STYLE}
              onChange={handleRangeChange}
              onOpenChange={open => {
                if (!open) {
                  setDateBounds(null);
                }
              }}
            />
          )}
        </div>
      ),
    };
  });

  return <Menu selectable={false} items={items} style={DATE_FILTER_MENU_STYLE} />;
}
