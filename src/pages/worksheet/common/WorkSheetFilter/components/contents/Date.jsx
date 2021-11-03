import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Dropdown, Input, Checkbox, MdAntDatePicker, MdAntDateRangePicker } from 'ming-ui';
import { FILTER_CONDITION_TYPE, DATE_OPTIONS } from '../../enum';
import { formatDateValue } from '../../util';

export default class Date extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    value: PropTypes.string,
    dateRange: PropTypes.number,
    minValue: PropTypes.string,
    maxValue: PropTypes.string,
    type: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      control = {},
      disabled,
      type,
      value,
      values,
      minValue,
      maxValue,
      dateRange,
      onChange,
      from = '',
    } = this.props;
    let timeFormat;
    let dateFormat = 'YYYY-MM-DD';
    if (control.type === 16 && !(type === FILTER_CONDITION_TYPE.DATEENUM || type === FILTER_CONDITION_TYPE.NDATEENUM)) {
      timeFormat = _.includes(['ctime', 'utime'], control.controlId) ? 'HH:mm:ss' : 'HH:mm';
      dateFormat = _.includes(['ctime', 'utime'], control.controlId) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
    }
    return (
      <div className="worksheetFilterDateCondition">
        {type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN ? (
          <div className="dateInputCon customDate">
            <MdAntDateRangePicker
              disabled={disabled}
              defaultValue={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
              showTime={timeFormat ? { format: timeFormat } : false}
              format={dateFormat}
              onChange={(moments, times) => {
                if (!_.isArray(moments)) {
                  return;
                }
                onChange({
                  minValue: moments[0].format(dateFormat),
                  maxValue: moments[1].format(dateFormat),
                });
              }}
            />
          </div>
        ) : (
          <div>
            {from !== 'subTotal' && (
              <div className="dateType dateInputCon">
                <Dropdown
                  disabled={disabled}
                  defaultValue={dateRange}
                  data={DATE_OPTIONS}
                  isAppendToBody
                  menuStyle={{ width: 220 }}
                  onChange={newDateRange => {
                    let changes = { value: undefined, values: [] };
                    if (newDateRange === 18) {
                      changes = {
                        value: moment(
                          type === FILTER_CONDITION_TYPE.DATE_GT ? moment().endOf('day') : moment().startOf('day'),
                        ).format('YYYY-MM-DD HH:mm:ss'),
                      };
                    }
                    if (newDateRange === 10 || newDateRange === 11) {
                      changes = {
                        value: 1,
                      };
                    }
                    onChange(Object.assign({ dateRange: newDateRange }, changes));
                  }}
                />
              </div>
            )}
            {(dateRange === 10 || dateRange === 11) && (
              <div className="dateValue mTop10">
                <Input
                  className="ruleDateValue"
                  defaultValue={value}
                  placeholder={_l('请输入天数')}
                  disabled={disabled}
                  valueFilter={v => v.replace(/[^-\d]/g, '')}
                  onBlur={e => {
                    onChange({ value: e.target.value || undefined, dateRangeType: 1 });
                  }}
                />
                <Checkbox
                  className="includeToday"
                  text={_l('包括今天')}
                  checked={_.isEqual(values, ['today'])}
                  onClick={() => onChange({ values: _.isEqual(values, ['today']) ? [] : ['today'] })}
                />
              </div>
            )}
            {dateRange === 18 && (
              <div className="customDate dateInputCon mTop10">
                <MdAntDatePicker
                  disabled={disabled}
                  defaultValue={moment(value)}
                  showTime={timeFormat ? { format: timeFormat } : false}
                  format={dateFormat}
                  onChange={date => {
                    if (!date) {
                      return;
                    }
                    if (timeFormat) {
                      onChange({ value: date.format('YYYY-MM-DD HH:mm:ss') });
                    } else {
                      onChange({ value: formatDateValue({ type, value: date }) });
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
