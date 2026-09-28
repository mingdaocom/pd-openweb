import React from 'react';
import MomentDatePicker, { getPickerValueProps } from '../momentPicker';

export default function TimeRangePicker(props) {
  return <MomentDatePicker.RangePicker {...getPickerValueProps(props)} picker="time" mode={undefined} />;
}
