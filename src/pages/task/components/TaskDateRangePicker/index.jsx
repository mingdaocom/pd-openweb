import React, { useState } from 'react';
import moment from 'moment';
import { DatePicker } from 'ming-ui/antd-components';
import './index.less';

const TASK_TIME_FORMAT = 'YYYY-MM-DD HH:00';
const TASK_TIME_RANGE_SHOW_TIME = {
  defaultOpenValue: [moment('09:00', 'HH:mm'), moment('18:00', 'HH:mm')],
  format: 'HH',
  hideDisabledOptions: true,
};

const getInitialValue = selectedValue => {
  const [start, end] = selectedValue || [];
  return start && end ? [moment(start), moment(end)] : null;
};

export default function TaskDateRangePicker({ selectedValue, placeholder, onOk }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(() => getInitialValue(selectedValue));

  const handleChange = nextValue => {
    if (!nextValue) return;
    if (onOk(nextValue) === false) return;

    setValue(nextValue);
    setOpen(false);
  };

  return (
    <span className="taskDateRangePicker">
      <span className="icon-bellSchedule" onClick={() => setOpen(true)} />
      <DatePicker.RangePicker
        allowClear={false}
        className="taskDateRangePickerControl"
        format={TASK_TIME_FORMAT}
        inputReadOnly
        needConfirm
        open={open}
        placeholder={[placeholder, placeholder]}
        showNow={false}
        showTime={TASK_TIME_RANGE_SHOW_TIME}
        value={value}
        variant="borderless"
        onChange={handleChange}
        onOpenChange={setOpen}
      />
    </span>
  );
}
