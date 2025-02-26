import React, { setState, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, MdAntDateRangePicker } from 'ming-ui';
import DatePicker from 'src/components/newCustomFields/widgets/Date';
import cx from 'classnames';
import { func, shape, string } from 'prop-types';
import { getShowFormat, getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { DATE_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/config';
import _, { includes } from 'lodash';
import moment from 'moment';
import TimeZoneTag from 'ming-ui/components/TimeZoneTag';

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
  border: 1px solid var(--border-color);
  border-radius: 4px;
  .backIcon {
    display: none;
    position: absolute;
    right: 0px;
    padding-right: 2px;
  }
  .customFormControlBox,
  .customAntPicker {
    box-shadow: none;
    border: none !important;
    border-radius: 4px;
    padding: 4px 11px 4px !important;
    font-size: 14px !important;
    background: #fff !important;
    height: 30px !important;
    .ant-picker-clear {
      display: none;
    }
    .ant-picker-input input {
      font-size: 13px;
    }
  }
  &:hover:not(.active) {
    border-color: var(--border-color);
  }
  &.active {
    border-color: #2196f3;
  }
  &:not(.isEmpty):hover {
    .icon-event {
      display: none;
    }
    .clearIcon {
      display: inline-block;
    }
    .backIcon {
      cursor: pointer;
      display: inline-block;
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

const PickerCon = styled.div`
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
  }
`;

function removeDateLimit(control) {
  control.advancedSetting.min = undefined;
  control.advancedSetting.max = undefined;
  control.advancedSetting.allowweek = undefined;
  control.advancedSetting.allowtime = undefined;
  control.advancedSetting.timeinterval = undefined;
}
export default function DateTime(props) {
  const {
    control,
    dateRange,
    dateRangeType,
    value,
    minValue,
    maxValue,
    advancedSetting = {},
    onChange = () => {},
    appId,
  } = props;
  const filterType = props.filterType || FILTER_CONDITION_TYPE.DATE_BETWEEN;
  let dateOptions = DATE_TYPE.concat([[{ text: _l('指定时间'), value: 18 }]]);
  const [active, setActive] = useState();
  if (dateRangeType) {
    control.advancedSetting.showtype = String(dateRangeType);
    if (includes(['3', '4', '5'], String(dateRangeType))) {
      control.type = 15;
    }
  }
  removeDateLimit(control);
  const showType = _.get(control, 'advancedSetting.showtype');
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty =
    dateRange === 18
      ? filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN
        ? !(minValue && maxValue)
        : !value
      : !dateRange;
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
  let pickerComp = null;
  if (showDatePicker) {
    if (filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN) {
      pickerComp = (
        <PickerCon>
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
        </PickerCon>
      );
    } else {
      pickerComp = (
        <PickerCon>
          <DatePicker
            {...control}
            showTime={!!timeFormat}
            hideIcon={true}
            value={value && moment(value)}
            dropdownClassName="scrollInTable"
            onChange={date => {
              onChange({
                dateRange: 18,
                filterType: filterType || FILTER_CONDITION_TYPE.DATEENUM,
                value: moment(date).format(valueFormat),
                dateRangeType,
              });
            }}
            notConvertZone={true}
          />
        </PickerCon>
      );
    }
  }
  return (
    <Con className={cx({ active, isEmpty })}>
      <Content className={cx({ isEmpty })}>
        {pickerComp || (
          <Dropdown
            isAppendToBody
            value={dateRange}
            data={dateOptions.map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)))}
            onChange={newValue => {
              const change = {
                filterType: filterType || FILTER_CONDITION_TYPE.DATEENUM,
                dateRange: newValue,
                minValue: undefined,
                maxValue: undefined,
                dateRangeType,
              };
              onChange(change);
            }}
            onVisibleChange={setActive}
          />
        )}
        <TimeZoneTag appId={appId} />
      </Content>
      {pickerComp && (
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
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined, value: undefined });
          }}
        />
      )}
      {!isEmpty && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={() => {
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined, value: undefined });
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
