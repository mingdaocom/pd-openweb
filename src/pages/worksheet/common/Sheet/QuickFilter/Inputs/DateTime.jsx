import React, { setState, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, MdAntDateRangePicker } from 'ming-ui';
import DatePicker from 'src/components/newCustomFields/widgets/Date';
import cx from 'classnames';
import { func, shape, string } from 'prop-types';
import { getShowFormat, getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { DATE_OPTIONS } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import _ from 'lodash';
import moment from 'moment';

function getPicker(type) {
  return {
    4: 'month',
    5: 'year',
  }[type];
}
const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  .backIcon {
    display: none;
    position: absolute;
    right: 0px;
    padding-right: 2px;
  }
  .customAntPicker {
    box-shadow: none;
    border: none;

    border-radius: 4px;
    .ant-picker-clear {
      display: none;
    }
    .ant-picker-input input {
      font-size: 13px;
    }
  }
  &:hover:not(.active) {
    border-color: #ccc;
  }
  &.active {
    border-color: #2196f3;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
    .backIcon {
      cursor: pointer;
      display: inline-block;
      background: #fff;
      &:hover {
        color: #777;
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  width: 0;
  .Dropdown {
    width: 100%;
    .Dropdown--input {
      padding: 0 10px !important;
    }
    .Icon.ming {
      position: absolute;
      right: 10px;
      line-height: 32px;
    }
  }
  &.isEmpty {
    .Dropdown--input .value,
    .mui-datetime-picker {
      color: #bdbdbd;
    }
  }
`;

const RangePickerCon = styled.div`
  .ant-picker-input > input {
    font-size: 13px !important;
  }
  .ant-picker-suffix {
    display: none;
  }
`;

const Icon = styled.i`
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
  &.icon-cancel {
    cursor: pointer;
    &:hover {
      color: #777;
    }
  }
  &.clearIcon {
    display: none;
    position: absolute;
    right: 0;
    background: #fff;
  }
`;

export default function DateTime(props) {
  const {
    appendToBody,
    control,
    dateRange,
    value,
    minValue,
    maxValue,
    advancedSetting = {},
    onChange = () => {},
  } = props;
  let dateOptions = DATE_OPTIONS;
  const [active, setActive] = useState();
  const showType = _.get(control, 'advancedSetting.showtype');
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  if (_.includes(['ctime', 'utime'], control.controlId)) {
    control.advancedSetting = { showtype: '6' };
  }
  const showValueFormat = getShowFormat(control);
  const valueFormat = getDatePickerConfigs(control).formatMode;
  const timeFormat = showValueFormat.split(' ')[1];
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
    <Con className={cx({ active })}>
      <Content className={cx({ isEmpty })}>
        {showDatePicker ? (
          <RangePickerCon>
            <MdAntDateRangePicker
              className="customAntPicker"
              value={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
              showTime={timeFormat ? { format: timeFormat } : false}
              picker={getPicker(showType)}
              format={showValueFormat}
              onChange={moments => {
                if (!moments || !_.isArray(moments)) {
                  moments = [];
                }
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: moments[0] && moments[0].format(valueFormat),
                  maxValue: moments[1] && moments[1].format(valueFormat),
                });
              }}
            />
          </RangePickerCon>
        ) : (
          <Dropdown
            isAppendToBody={appendToBody}
            value={dateRange}
            data={dateOptions.map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)))}
            menuStyle={appendToBody ? {} : { width: '100%' }}
            onChange={newValue => {
              const change = { filterType: 17, dateRange: newValue, minValue: undefined, maxValue: undefined };
              onChange(change);
            }}
            onVisibleChange={setActive}
          />
        )}
      </Content>
      {showDatePicker && (
        <Icon
          className={cx('icon', minValue || maxValue ? 'icon-cancel' : 'icon-event')}
          onClick={() => {
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined });
          }}
        />
      )}
      {isEmpty && dateRange === 18 && (
        <Icon
          className="icon icon-arrow-down-border backIcon"
          onClick={() => {
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined, filterType: 0 });
          }}
        />
      )}
      {!isEmpty && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={() => {
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined, filterType: 0 });
          }}
        />
      )}
    </Con>
  );
}

DateTime.propTypes = {
  dateRange: string,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
