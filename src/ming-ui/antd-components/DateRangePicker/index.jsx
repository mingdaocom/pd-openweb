import React, { forwardRef } from 'react';
import MomentDatePicker, { getPickerValueProps } from '../momentPicker';

const DateRangePicker = (props, ref) => <MomentDatePicker.RangePicker ref={ref} {...getPickerValueProps(props)} />;

export default forwardRef(DateRangePicker);
