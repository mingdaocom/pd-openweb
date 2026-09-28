import React, { useState } from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import moment from 'moment';
import { func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { DateRangePicker, Divider, Select } from 'ming-ui/antd-components';
import DatePicker from 'src/components/Form/DesktopForm/widgets/Date';
import { getDatePickerConfigs, getShowFormat } from 'src/utils/domain/control/date';
import { DATE_TYPE } from 'src/utils/domain/worksheet/fastFilterConfig';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };
const SELECT_DIVIDER_LABEL = <Divider className="mTop6 mBottom6" />;
const SELECT_DIVIDER_STYLE = { minHeight: 13, padding: 0, cursor: 'default' };

function getDropdownData(dateOptions, allowedDateRange) {
  const groups = dateOptions
    .map(options => options.filter(option => _.includes(allowedDateRange.concat(18), option.value)))
    .filter(options => options.length);

  return _.flatMap(groups, (options, index) => [
    ...options,
    ...(index < groups.length - 1
      ? [
          {
            text: SELECT_DIVIDER_LABEL,
            value: `date-option-divider-${index}`,
            disabled: true,
            style: SELECT_DIVIDER_STYLE,
          },
        ]
      : []),
  ]);
}

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
  .hap-picker,
  .hap-select {
    width: 100%;
  }
  .backIcon {
    display: none;
    position: absolute;
    right: 8px;
    z-index: 1;
    padding: 0 2px;
    background: var(--color-background-primary) !important;
  }
  &:hover {
    .backIcon {
      cursor: pointer;
      display: flex;
      &:hover {
        color: var(--color-text-secondary);
      }
    }
  }
`;

const Content = styled.div`
  flex: 1;
  width: 0;
  &.isEmpty {
    .hap-select-selection-item {
      color: var(--color-text-disabled);
    }
  }
`;

const Icon = styled.i`
  font-size: 13px;
  color: var(--color-text-tertiary);
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
  const [pickerVisible, setPickerVisible] = useState();
  const resolvedControl = {
    ...control,
    advancedSetting: { ...control.advancedSetting },
  };

  if (dateRangeType) {
    resolvedControl.advancedSetting.showtype = String(dateRangeType);
    if (includes(['3', '4', '5'], String(dateRangeType))) {
      resolvedControl.type = 15;
    }
  }

  removeDateLimit(resolvedControl);
  const showType = _.get(resolvedControl, 'advancedSetting.showtype');
  const parsedDateRange = safeParse(advancedSetting?.daterange, 'array');
  const allowedDateRange = _.isArray(parsedDateRange) ? parsedDateRange : [];

  const showDatePicker = dateRange === 18 || (_.isEmpty(allowedDateRange) && dateRange === 0);
  const isEmpty =
    dateRange === 18
      ? filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN
        ? !(minValue && maxValue)
        : !value
      : !dateRange;
  const showValueFormat = getShowFormat(resolvedControl);
  const valueFormat = getDatePickerConfigs(resolvedControl).formatMode;
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

  const dropdownData = getDropdownData(dateOptions, allowedDateRange);
  let pickerComp = null;

  if (showDatePicker) {
    if (filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN) {
      pickerComp = (
        <DateRangePicker
          value={minValue && maxValue ? [moment(minValue, valueFormat), moment(maxValue, valueFormat)] : []}
          showTime={
            timeFormat
              ? {
                  format: timeFormat,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }
              : false
          }
          picker={getPicker(showType)}
          format={showValueFormat}
          open={pickerVisible}
          onOpenChange={setPickerVisible}
          onChange={moments => {
            setPickerVisible(false);
            if (!moments || !_.isArray(moments)) {
              moments = [];
            }

            onChange({
              dateRange: moments[0] && moments[1] ? 18 : 0,
              filterType: 31,
              minValue: moments[0] && moments[0].format(valueFormat),
              maxValue: moments[1] && moments[1].format(valueFormat),
            });
          }}
        />
      );
    } else {
      pickerComp = (
        <DatePicker
          {...{
            ...resolvedControl,
            advancedSetting: {
              ...resolvedControl.advancedSetting,
              showtimezone: '1',
              timezonetype: '1',
            },
          }}
          appId={appId}
          showTime={!!timeFormat}
          hideIcon={false}
          value={value && moment(value)}
          dropdownClassName="scrollInTable"
          compProps={{ inheritFieldStyle: false, ...(pickerVisible ? { showDatePicker: true } : {}) }}
          onChange={date => {
            onChange({
              dateRange: date ? 18 : 0,
              filterType: filterType || FILTER_CONDITION_TYPE.DATEENUM,
              value: date ? moment(date).format(valueFormat) : undefined,
              dateRangeType,
            });
          }}
          notConvertZone={true}
        />
      );
    }
  }

  return (
    <Con>
      <Content className={cx({ isEmpty })}>
        {pickerComp ||
          (_.find(dropdownData, o => o.value === dateRange) || isEmpty ? (
            <Select
              className="w100"
              allowClear
              value={isEmpty ? undefined : dateRange}
              options={dropdownData}
              fieldNames={SELECT_FIELD_NAMES}
              onChange={newValue => {
                const change = {
                  filterType: props.originalFilterType || filterType || FILTER_CONDITION_TYPE.DATEENUM,
                  dateRange: newValue,
                  minValue: undefined,
                  maxValue: undefined,
                  dateRangeType,
                };

                if (newValue === 18) {
                  window.setTimeout(() => setPickerVisible(true));
                }

                onChange(change);
              }}
            />
          ) : (
            <span className="mLeft8" style={{ color: 'red' }}>
              {_l('已删除')}
            </span>
          ))}
      </Content>
      {isEmpty && dateRange === 18 && (
        <Icon
          className="icon icon-arrow-down-border backIcon"
          onClick={() => {
            onChange({ dateRange: 0, minValue: undefined, maxValue: undefined, value: undefined });
          }}
        />
      )}
    </Con>
  );
}

DateTime.propTypes = {
  dateRange: number,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
