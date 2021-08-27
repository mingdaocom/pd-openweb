import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Dropdown, Input, Checkbox } from 'ming-ui';
import DatePicker from 'ming-ui/components/DatePicker';
import { FILTER_CONDITION_TYPE, DATE_OPTIONS } from '../../enum';

const RangePicker = DatePicker.RangePicker;

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
    const { disabled, type, value, values, minValue, maxValue, dateRange, onChange, from = '' } = this.props;
    return (
      <div className="worksheetFilterDateCondition">
        {type === FILTER_CONDITION_TYPE.BETWEEN || type === FILTER_CONDITION_TYPE.NBETWEEN ? (
          <div className="dateInputCon customDate">
            <RangePicker
              disabled={disabled}
              className="ThemeHoverColor3"
              onOk={range => {
                onChange({
                  minValue: range[0].startOf('day').format('YYYY-MM-DD'),
                  maxValue: range[1].endOf('day').format('YYYY-MM-DD'),
                });
              }}
              onClear={() => {}}
              selectedValue={[moment(minValue), moment(maxValue)]}
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
                        value: moment().format('YYYY-MM-DD'),
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
                <DatePicker
                  disabled={disabled}
                  selectedValue={moment(value ? value : moment().format('YYYY-MM-DD'))}
                  offsetTop={10}
                  format={_l('YYYY年M月D日')}
                  onOk={date => {
                    onChange({ value: date.format('YYYY-MM-DD') });
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
