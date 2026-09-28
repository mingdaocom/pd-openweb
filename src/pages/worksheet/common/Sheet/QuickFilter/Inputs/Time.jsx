import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { func, shape, string } from 'prop-types';
import { TimePicker } from 'ming-ui/antd-components';

export default function Time(props) {
  const { control, minValue, maxValue, onChange = () => {} } = props;
  const unit = String(control.unit);
  const timeFormat = unit === '1' ? 'HH:mm' : 'HH:mm:ss';
  return (
    <TimePicker.RangePicker
      className="w100"
      format={timeFormat}
      value={minValue && maxValue ? [moment(minValue, timeFormat), moment(maxValue, timeFormat)] : []}
      onChange={moments => {
        if (!moments || !_.isArray(moments)) {
          moments = [];
        }

        onChange({
          dateRange: 18,
          filterType: 31,
          minValue: moments[0] && moments[0].format(timeFormat),
          maxValue: moments[1] && moments[1].format(timeFormat),
        });
      }}
    />
  );
}

Time.propTypes = {
  dateRange: string,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
