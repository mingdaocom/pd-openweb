import React, { useRef } from 'react';
import moment from 'moment';
import { DatePicker } from 'ming-ui';
import './index.less';

const TODAY = new Date();
const CUSTOM_TIME_FORMAT = {
  hour: 'YYYY-MM-DD HH',
  minute: 'YYYY-MM-DD HH:mm',
  second: 'YYYY-MM-DD HH:mm:ss',
};

const DEFAULT_OPTIONS = [
  {
    label: _l('今天'),
    key: 'today',
    value: [moment(TODAY).startOf('day').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('昨天'),
    key: 'yesterday',
    value: [
      moment(TODAY).subtract(1, 'days').startOf('day').format(),
      moment(TODAY).subtract(1, 'days').endOf('day').format(),
    ],
  },
  {
    label: _l('前天'),
    key: 'beforeYesterday',
    value: [
      moment(TODAY).subtract(2, 'days').startOf('day').format(),
      moment(TODAY).subtract(2, 'days').endOf('day').format(),
    ],
  },
  {
    label: _l('本周'),
    key: 'tswk',
    value: [moment(TODAY).startOf('week').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('上周'),
    key: 'lswk',
    value: [
      moment(TODAY).subtract(1, 'w').startOf('week').format(),
      moment(TODAY).subtract(1, 'w').endOf('week').endOf('day').format(),
    ],
  },
  {
    label: _l('本月'),
    key: 'month',
    value: [moment(TODAY).startOf('month').format(), moment(TODAY).endOf('day').format()],
  },
  {
    label: _l('上月'),
    key: 'lastmonth',
    value: [
      moment(TODAY).subtract(1, 'months').startOf('month').format(),
      moment(TODAY).subtract(1, 'months').endOf('month').endOf('day').format(),
    ],
  },
  {
    label: _l('自定义'),
    key: 'custom',
    value: undefined,
  },
];

function getCustomRangeLabel(value, timeMode) {
  const format = CUSTOM_TIME_FORMAT[timeMode] || CUSTOM_TIME_FORMAT.minute;

  return value.map(time => moment(time).format(format)).join(' ~ ');
}

export default function DatePickSelect(props) {
  const { options = DEFAULT_OPTIONS, onChange, selectedValue, timePicker = false, timeMode = 'minute' } = props;
  const ref = useRef(null);

  return (
    <ul className="worksheet-data-pick-select">
      {options.map(item => {
        return item.key !== 'custom' ? (
          <li key={`data-pick-select-${item.key}`} onClick={() => onChange(item)}>
            {item.label}
          </li>
        ) : (
          <div key={`data-pick-select-${item.key}`} ref={ref}>
            <DatePicker.RangePicker
              offset={{ left: -533, top: 0 }}
              popupParentNode={() => ref.current}
              selectedValue={selectedValue}
              timePicker={timePicker}
              timeMode={timeMode}
              onOk={value => {
                const rangeValue = value.map(time => moment(time).format());

                onChange({
                  ...item,
                  label: timePicker ? getCustomRangeLabel(value, timeMode) : item.label,
                  value: rangeValue,
                });
              }}
              onClear={() => onChange({ ...item, value: undefined })}
              onSelect={() => {}}
            >
              <li>{_l('自定义日期')}</li>
            </DatePicker.RangePicker>
          </div>
        );
      })}
    </ul>
  );
}
