import React, { forwardRef } from 'react';
import { getPickerValueProps, MomentTimePicker } from '../momentPicker';
import TimeRangePicker from '../TimeRangePicker';

const TimePicker = (props, ref) => <MomentTimePicker ref={ref} {...getPickerValueProps(props)} />;

const ForwardedTimePicker = forwardRef(TimePicker);
ForwardedTimePicker.RangePicker = TimeRangePicker;

export default ForwardedTimePicker;
