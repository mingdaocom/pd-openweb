import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Dropdown, Input, Checkbox, MdAntDateRangePicker } from 'ming-ui';
import DatePicker from 'src/components/newCustomFields/widgets/Date';
import { getShowFormat, getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { FILTER_CONDITION_TYPE, DATE_OPTIONS } from '../../enum';
import _ from 'lodash';

function getPicker(type) {
  return {
    4: 'month',
    5: 'year',
  }[type];
}
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
    let dateOptions = DATE_OPTIONS;
    if (
      dateRange === 18 &&
      _.includes(
        [
          FILTER_CONDITION_TYPE.DATEENUM,
          FILTER_CONDITION_TYPE.NDATEENUM,
          FILTER_CONDITION_TYPE.DATE_EQ,
          FILTER_CONDITION_TYPE.DATE_NE,
        ],
        type,
      ) &&
      (_.includes(['1', '2'], _.get(control, 'advancedSetting.showtype')) ||
        _.includes(['ctime', 'utime'], control.controlId))
    ) {
      control.type = 15;
      control.advancedSetting = { showtype: '3' };
    }
    const showValueFormat = getShowFormat(control);
    const timeFormat = showValueFormat.split(' ')[1];
    const valueFormat = getDatePickerConfigs(control).formatMode;
    const showType = String(_.get(control, 'advancedSetting.showtype'));
    // 5: 年 4: 年月
    if (_.includes(['4', '5'], showType)) {
      dateOptions = dateOptions
        .map(options =>
          options.filter(o =>
            _.includes(showType === '5' ? [15, 16, 17, 18] : [7, 8, 9, 12, 13, 14, 15, 16, 17, 18], o.value),
          ),
        )
        .filter(options => options.length);
    }
    return (
      <div className="worksheetFilterDateCondition">
        {type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN ? (
          <div className="dateInputCon customDate">
            <MdAntDateRangePicker
              disabled={disabled}
              defaultValue={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
              showTime={timeFormat ? { format: timeFormat } : false}
              picker={getPicker(showType)}
              format={showValueFormat}
              onChange={(moments, times) => {
                if (!moments || !_.isArray(moments)) {
                  moments = [];
                }
                onChange({
                  minValue: moments[0] && moments[0].format(valueFormat),
                  maxValue: moments[1] && moments[1].format(valueFormat),
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
                  data={dateOptions}
                  defaultValue={dateRange}
                  isAppendToBody
                  menuStyle={{ width: 220 }}
                  onChange={newDateRange => {
                    let changes = { value: undefined, values: [] };
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
                  {...control}
                  value={value && moment(value)}
                  dropdownClassName="scrollInTable"
                  onChange={date => {
                    onChange({
                      value: date ? moment(date).format(valueFormat) : undefined,
                    });
                  }}
                  compProps={{
                    placeholder: _l('请选择'),
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
