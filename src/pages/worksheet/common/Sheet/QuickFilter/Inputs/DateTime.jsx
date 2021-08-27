import React, { setState, useState } from 'react';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import cx from 'classnames';
import { func, shape, string } from 'prop-types';
import DatePicker from 'ming-ui/components/DatePicker';
import { DATE_OPTIONS } from 'src/pages/worksheet/common/WorkSheetFilter/enum';

const RangePicker = DatePicker.RangePicker;

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
  .mui-datetime-picker {
    line-height: 32px;
    padding: 0 6px 0 10px;
    display: block;
    > span {
      max-width: 100%;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: top;
    }
  }
`;

const Icon = styled.i`
  font-size: 18px;
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
  const { dateRange, minValue, maxValue, advancedSetting = {}, onChange = () => {} } = props;
  const [active, setActive] = useState();
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  return (
    <Con className={cx({ active })}>
      <Content className={cx({ isEmpty })}>
        {showDatePicker ? (
          <RangePickerCon>
            <RangePicker
              defaultVisible={!_.isEmpty(allowedDateRange)}
              className="ThemeHoverColor3"
              onOk={range => {
                onChange({
                  dateRange: 18,
                  filterType: 11,
                  minValue: range[0].startOf('day').format('YYYY-MM-DD'),
                  maxValue: range[1].endOf('day').format('YYYY-MM-DD'),
                });
              }}
              onClear={() => {
                onChange({ filterType: 11, dateRange: 0, minValue: undefined, maxValue: undefined });
              }}
              selectedValue={minValue && maxValue ? [moment(minValue), moment(maxValue)] : undefined}
              onVisibleChange={setActive}
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
