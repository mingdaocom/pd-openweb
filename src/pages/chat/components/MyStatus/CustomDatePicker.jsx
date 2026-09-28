import React, { useState } from 'react';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { DatePicker, Select } from 'ming-ui/antd-components';
import { dateOptions } from './config';

const { RangePicker } = DatePicker;

const range = (start, end) => {
  const result = [];

  for (let i = start; i < end; i++) {
    result.push(i);
  }

  return result;
};

export default function CustomDatePicker(props) {
  const { beginTime, endTime, changeDate = () => {} } = props;
  const [fixedValue, setFixedValue] = useState(props.durationOption || 10);
  const [{ startDate, endDate }, setDateInfo] = useState({
    startDate: beginTime ? moment(beginTime) : null,
    endDate: endTime ? moment(endTime) : null,
  });

  const onOk = date => {
    if (date && date.length && date[0] && date[1]) {
      // 验证结束时间必须大于开始时间
      if (date[1].isAfter(date[0])) {
        setDateInfo({
          startDate: date[0],
          endDate: date[1],
        });
        changeDate({ startDate: date[0], endDate: date[1] });
      }
    }
  };

  // 处理时间选择
  const handleTimeSelect = value => {
    if (value === fixedValue) return;

    setFixedValue(value);
    setDateInfo({ startDate: null, endDate: null });
    changeDate({ fixedValue: value });
  };

  return (
    <React.Fragment>
      <Select
        className="w100"
        value={fixedValue}
        onSelect={handleTimeSelect}
        options={dateOptions}
        suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
      />
      {fixedValue === 1000 && (
        <RangePicker
          className="w100 mTop8"
          disabledDate={date => moment().isAfter(date, 'day')}
          disabledTime={(date, type) => {
            if (!date) return {};
            const isToday = moment().isSame(date, 'day');

            if (type === 'start') {
              return {
                disabledHours: () => (isToday ? range(0, moment().get('hour')) : []),
                disabledMinutes: () => (isToday ? range(0, moment().get('minute')) : []),
              };
            }

            return { disabledHours: () => [], disabledMinutes: () => [] };
          }}
          value={[startDate, endDate]}
          showTime={{
            hideDisabledOptions: true,
            format: 'HH:mm',
            defaultValue: [moment('00:00:00', 'HH:mm'), moment('23:59:59', 'HH:mm:ss')],
          }}
          format="YYYY-MM-DD HH:mm"
          onChange={date => {
            const [start, end] = date || [];

            if (start && end && end.isBefore(start)) {
              setDateInfo({ startDate: start, endDate: null });
            } else {
              setDateInfo({ startDate: start, endDate: end });
            }

            if (!start && !end) {
              changeDate({ startDate: null, endDate: null });
            }
          }}
          onOk={onOk}
        />
      )}
    </React.Fragment>
  );
}
