import React, { useState } from 'react';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { DatePicker, Select } from 'ming-ui/antd-components';

const CUSTOM_DATE_VALUE = 'custom';
const DATE_FORMAT = 'YYYY-MM-DD';
const RANGE_PICKER_TRIGGER_STYLE = {
  position: 'absolute',
  inset: 0,
  opacity: 0,
  pointerEvents: 'none',
};
const TIME_RANGE_PICKER_TRIGGER_STYLE = {
  position: 'absolute',
  inset: 0,
  zIndex: 1,
};
const TIME_MODE_FORMATS = {
  hour: 'HH',
  minute: 'HH:mm',
  second: 'HH:mm:ss',
};
const TIME_MODE_CONFIGS = {
  hour: { format: TIME_MODE_FORMATS.hour },
  minute: { format: TIME_MODE_FORMATS.minute },
  second: { format: TIME_MODE_FORMATS.second },
};

const DATE_OPTIONS = [
  { value: 0, label: _l('今天') },
  { value: 1, label: _l('昨天') },
  { value: 2, label: _l('本周') },
  { value: 3, label: _l('上周') },
  { value: 4, label: _l('本月') },
  { value: 5, label: _l('上月') },
  { value: 6, label: _l('最近7天') },
  { value: 7, label: _l('最近30天') },
  { value: 9, label: _l('最近90天') },
  { value: 8, label: _l('最近半年') },
  { value: 10, label: _l('最近1年') },
];

function getPresetDateRange(value, now = moment()) {
  const end = now.clone();

  switch (value) {
    case 0:
      return [now.clone(), end];
    case 1:
      return [now.clone().subtract(1, 'day'), end.subtract(1, 'day')];
    case 2:
      return [now.clone().startOf('week'), end];
    case 3:
      return [now.clone().subtract(1, 'week').startOf('week'), end.subtract(1, 'week').endOf('week')];
    case 4:
      return [now.clone().startOf('month'), end];
    case 5:
      return [now.clone().subtract(1, 'month').startOf('month'), end.subtract(1, 'month').endOf('month')];
    case 6:
      return [now.clone().subtract(6, 'days'), end];
    case 7:
      return [now.clone().subtract(29, 'days'), end];
    case 8:
      return [now.clone().subtract(6, 'months'), end];
    case 9:
      return [now.clone().subtract(89, 'days'), end];
    case 10:
      return [now.clone().subtract(1, 'year'), end];
    default:
      return [now.clone(), end];
  }
}

const isRangeExceeded = (start, end, maxRange) =>
  maxRange && start.isBefore(end.clone().subtract(maxRange.value, maxRange.unit));

const getMaxRangeMessage = maxRange =>
  maxRange.unit === 'year' ? _l('时间跨度不得超过%0年', maxRange.value) : _l('时间跨度不得超过%0个月', maxRange.value);

export default function CustomSelectDate(props) {
  const {
    allowClear = true,
    changeDate = () => {},
    className,
    hiddenDateValues = [],
    placeholder,
    min,
    maxRange,
    timePicker,
    timeMode,
    dateInfo = {},
  } = props;
  const [openDateRangePicker, setOpenDateRangePicker] = useState(false);
  const visibleDateOptions = DATE_OPTIONS.filter(item => {
    if (hiddenDateValues.includes(item.value)) return false;

    const [start, end] = getPresetDateRange(item.value);

    if (min && start.isBefore(min, 'day')) return false;
    if (isRangeExceeded(start, end, maxRange)) return false;

    return true;
  });
  const selectOptions = [
    ...visibleDateOptions,
    { value: CUSTOM_DATE_VALUE, label: _l('自定义日期'), title: dateInfo.searchDateStr?.trim() },
  ];
  const selectedOption = visibleDateOptions.find(item => item.label === dateInfo.searchDateStr);
  const selectedValue = dateInfo.searchDateStr ? (selectedOption?.value ?? CUSTOM_DATE_VALUE) : undefined;
  const timeFormat = TIME_MODE_FORMATS[timeMode] || TIME_MODE_FORMATS.minute;
  const pickerFormat = timePicker ? `YYYY-MM-DD ${timeFormat}` : 'YYYY-MM-DD';
  const rangeDefaultValue =
    selectedValue === CUSTOM_DATE_VALUE && dateInfo.startDate && dateInfo.endDate
      ? [moment(dateInfo.startDate), moment(dateInfo.endDate)]
      : undefined;
  const disabledDate =
    min || maxRange
      ? (current, info = {}) => {
          if (!current) return false;
          if (min && current.isBefore(min, 'day')) return true;
          if (!maxRange || !info.from) return false;

          return (
            current.isBefore(info.from.clone().subtract(maxRange.value, maxRange.unit), 'day') ||
            current.isAfter(info.from.clone().add(maxRange.value, maxRange.unit), 'day')
          );
        }
      : undefined;

  const changeFields = item => {
    const [start, end] = getPresetDateRange(item.value);
    const startDate = start.format(DATE_FORMAT);
    const endDate = end.format(DATE_FORMAT);

    changeDate({ startDate, endDate, searchDateStr: item.label, ...item });
  };

  const handleRangeConfirm = range => {
    if (!Array.isArray(range) || !range[0] || !range[1]) return;

    const [start, end] = range;

    if (isRangeExceeded(start, end, maxRange)) {
      alert(getMaxRangeMessage(maxRange), 3);
      return;
    }

    const searchDateStr = `${start.format(pickerFormat)}~${end.format(pickerFormat)} `;

    setOpenDateRangePicker(false);
    changeDate({
      startDate: start.format(pickerFormat),
      endDate: end.format(pickerFormat),
      searchDateStr,
    });
  };

  return (
    <div className="w100 Relative">
      <Select
        allowClear={allowClear}
        className={className}
        labelRender={({ value, label }) =>
          value === CUSTOM_DATE_VALUE && dateInfo.searchDateStr ? dateInfo.searchDateStr : label
        }
        options={selectOptions}
        placeholder={placeholder || _l('最近30天')}
        suffixIcon={<Icon icon="sidebar_calendar" className="Font16" />}
        value={selectedValue}
        onChange={value => {
          if (value === CUSTOM_DATE_VALUE) return;

          if (value === undefined) {
            changeDate({ startDate: undefined, endDate: undefined, searchDateStr: undefined });
            return;
          }

          changeFields(DATE_OPTIONS.find(item => item.value === value));
        }}
        onSelect={value => {
          if (value === CUSTOM_DATE_VALUE) {
            setOpenDateRangePicker(true);
          }
        }}
      />
      {openDateRangePicker && (
        <DatePicker.RangePicker
          allowClear={false}
          defaultValue={rangeDefaultValue}
          disabledDate={disabledDate}
          format={pickerFormat}
          inputReadOnly
          needConfirm={timePicker}
          open
          placeholder={timePicker ? [_l('开始时间'), _l('结束时间')] : undefined}
          showTime={timePicker ? TIME_MODE_CONFIGS[timeMode] || TIME_MODE_CONFIGS.minute : false}
          style={timePicker ? TIME_RANGE_PICKER_TRIGGER_STYLE : RANGE_PICKER_TRIGGER_STYLE}
          onChange={handleRangeConfirm}
          onOpenChange={open => {
            if (!open) {
              setOpenDateRangePicker(false);
            }
          }}
        />
      )}
    </div>
  );
}
