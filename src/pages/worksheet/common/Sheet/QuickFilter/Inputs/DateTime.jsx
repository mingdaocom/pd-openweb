import React, { setState, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, MdAntDateRangePicker } from 'ming-ui';
import cx from 'classnames';
import { func, shape, string } from 'prop-types';
import { DATE_OPTIONS } from 'src/pages/worksheet/common/WorkSheetFilter/enum';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dddddd;
  border-radius: 4px;
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
  const { control, dateRange, minValue, maxValue, advancedSetting = {}, onChange = () => {} } = props;
  const [active, setActive] = useState();
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  let timeFormat;
  let dateFormat = 'YYYY-MM-DD';
  if (control.type === 16) {
    timeFormat = _.includes(['ctime', 'utime'], control.controlId) ? 'HH:mm:ss' : 'HH:mm';
    dateFormat = _.includes(['ctime', 'utime'], control.controlId) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm';
  }
  return (
    <Con className={cx({ active })}>
      <Content className={cx({ isEmpty })}>
        {showDatePicker ? (
          <RangePickerCon>
            <MdAntDateRangePicker
              defaultValue={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
              showTime={timeFormat ? { format: timeFormat } : false}
              format={dateFormat}
              onChange={moments => {
                if (!_.isArray(moments)) {
                  return;
                }
                onChange({
                  dateRange: 18,
                  filterType: 11,
                  minValue: moments[0].format(dateFormat),
                  maxValue: moments[1].format(dateFormat),
                });
              }}
            />
          </RangePickerCon>
        ) : (
          <Dropdown
            value={dateRange}
            data={DATE_OPTIONS.map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)))}
            menuStyle={{ width: '100%' }}
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
