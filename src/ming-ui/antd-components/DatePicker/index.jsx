import React, { forwardRef } from 'react';
import DateRangePicker from '../DateRangePicker';
import MomentDatePicker, { getPickerValueProps } from '../momentPicker';

const DatePicker = (props, ref) => <MomentDatePicker ref={ref} {...getPickerValueProps(props)} />;

const ForwardedDatePicker = forwardRef(DatePicker);
ForwardedDatePicker.RangePicker = DateRangePicker;

export default ForwardedDatePicker;
