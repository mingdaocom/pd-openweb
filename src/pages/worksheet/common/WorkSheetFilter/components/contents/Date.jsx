import React from 'react';
import _, { find, flatten, get, includes } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Checkbox, DateRangePicker, Input, Select, Space } from 'ming-ui/antd-components';
import TimeZoneTag, { shouldShowTimeZoneTag } from 'ming-ui/components/TimeZoneTag';
import DatePicker from 'src/components/Form/DesktopForm/widgets/Date';
import { getDatePickerConfigs, getShowFormat } from 'src/utils/domain/control/date';
import {
  DATE_COMPARE_FILTER_TYPES,
  DATE_COMPARE_RANGE_LABELS,
  DATE_OPTIONS,
  DATE_RANGE_TYPE,
  DATE_RANGE_TYPE_OPTIONS,
  FILTER_CONDITION_TYPE,
  getDateCompareRangeValues,
} from 'src/utils/domain/worksheet/filterConstants';

const HIDDEN_OPTION_STYLE = { display: 'none' };
const DATE_SELECT_STYLES = { popup: { root: { width: 220 } } };
const DATE_RANGE_TYPE_SELECT_STYLES = { popup: { root: { width: 80 } } };

const getSelectOptions = (options, hiddenValues = []) =>
  flatten(options).map(({ text, ...option }) => ({
    ...option,
    label: text,
    style: includes(hiddenValues, option.value) ? HIDDEN_OPTION_STYLE : option.style,
  }));

function getPicker(type) {
  return {
    4: 'month',
    5: 'year',
  }[type];
}

function getDateOptionsByCompareType(type, dateOptions) {
  const allowedValues = [18].concat(getDateCompareRangeValues(type));

  // 比较规则只展示当前方向支持的动态时间点，并复写“过去/将来”范围文案。
  return dateOptions
    .map(options =>
      options
        .filter(o => _.includes(allowedValues, o.value))
        .map(o => ({
          ...o,
          text: DATE_COMPARE_RANGE_LABELS[o.value] || o.text,
        })),
    )
    .filter(options => options.length);
}

export default function Date(props) {
  const {
    control = {},
    disabled,
    type,
    value,
    values,
    minValue,
    maxValue,
    dateRange,
    dateRangeType = DATE_RANGE_TYPE.DAY,
    onChange,
    from = '',
    appId,
  } = props;
  const dayNum = value;
  const isDateCompareFilter = includes(DATE_COMPARE_FILTER_TYPES, type);
  let dateOptions = DATE_OPTIONS;
  // if (
  //   dateRange === 18 &&
  //   _.includes(
  //     [
  //       FILTER_CONDITION_TYPE.DATEENUM,
  //       FILTER_CONDITION_TYPE.NDATEENUM,
  //       FILTER_CONDITION_TYPE.DATE_EQ,
  //       FILTER_CONDITION_TYPE.DATE_NE,
  //     ],
  //     type,
  //   ) &&
  //   (_.includes(['1', '2'], _.get(control, 'advancedSetting.showtype')) ||
  //     _.includes(['ctime', 'utime'], control.controlId))
  // ) {
  //   control.type = 15;
  //   control.advancedSetting = { showtype: '3' };
  // }
  let controlFormat = { ...control };
  let showTime;
  let showType = String(_.get(control, 'advancedSetting.showtype') || 3);

  if (includes(['ctime', 'utime'], control.controlId)) {
    showType = '6';
  }

  if (control.type === 16 && dateRangeType == DATE_RANGE_TYPE.DAY && dateRange === 18) {
    controlFormat.advancedSetting = _.assign({}, controlFormat.advancedSetting, { showtype: '3' });
    showTime = false;
  } else if (!includes(['5', '4'], showType)) {
    controlFormat.advancedSetting = _.assign({}, controlFormat.advancedSetting, { showtype: String(dateRangeType) });
  }

  const showValueFormat = getShowFormat(controlFormat);
  let timeFormat = showValueFormat.split(' ')[1];
  const valueFormat = getDatePickerConfigs(controlFormat).formatMode;

  // 5: 年 4: 年月
  if (showType === '2') {
    dateOptions = dateOptions.map(options => options.filter(o => o.value !== 18.1)).filter(options => options.length);
  } else if (showType === '3') {
    dateOptions = dateOptions
      .map(options => options.filter(o => !(o.value > 18 && o.value < 19)))
      .filter(options => options.length);
  } else if (_.includes(['4', '5'], showType)) {
    dateOptions = dateOptions
      .map(options =>
        options.filter(o =>
          _.includes(showType === '5' ? [15, 16, 17, 18] : [7, 8, 9, 12, 13, 14, 15, 16, 17, 18], o.value),
        ),
      )
      .filter(options => options.length);
  }

  if (!includes([FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE], type)) {
    dateOptions = dateOptions.map(options => options.filter(o => !(o.value > 18 && o.value < 19)));
  }

  if (isDateCompareFilter) {
    dateOptions = getDateOptionsByCompareType(type, dateOptions);
  }

  // 时区一致时 TimeZoneTag 不渲染内容，此处必须回退成 undefined，否则会顶掉控件默认的下拉箭头/日期图标
  const timeZoneSuffixIcon = shouldShowTimeZoneTag(appId) ? <TimeZoneTag appId={appId} /> : undefined;
  const isUnavailableDateRange = isDateCompareFilter && dateRange && !find(flatten(dateOptions), { value: dateRange });
  const unavailableDateRangeLabel =
    isUnavailableDateRange &&
    (DATE_COMPARE_RANGE_LABELS[dateRange] ||
      get(find(flatten(DATE_OPTIONS), { value: dateRange }), 'text') ||
      _l('请选择'));

  return (
    <div className="worksheetFilterDateCondition">
      {type === FILTER_CONDITION_TYPE.DATE_BETWEEN || type === FILTER_CONDITION_TYPE.DATE_NBETWEEN ? (
        <div className="dateInputCon customDate">
          <DateRangePicker
            disabled={disabled}
            value={minValue && maxValue ? [moment(minValue), moment(maxValue)] : []}
            showTime={timeFormat ? { format: timeFormat } : false}
            picker={getPicker(showType)}
            format={showValueFormat}
            onChange={moments => {
              if (!moments || !_.isArray(moments)) {
                moments = [];
              }

              onChange({
                minValue: moments[0] && moments[0].format(valueFormat === 'YYYY-MM-DD HH' ? undefined : valueFormat),
                maxValue: moments[1] && moments[1].format(valueFormat === 'YYYY-MM-DD HH' ? undefined : valueFormat),
              });
            }}
            suffixIcon={timeZoneSuffixIcon}
          />
        </div>
      ) : (
        <div>
          {from !== 'subTotal' && (
            <div className="dateType dateInputCon">
              <Select
                className="dateRangeType w100"
                disabled={disabled}
                options={getSelectOptions(dateOptions, [10, 11])}
                value={
                  includes([1, 2], dateRangeType) &&
                  includes([FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE], type) &&
                  dateRange === 18
                    ? dateRange + 0.1 * dateRangeType
                    : dateRange
                }
                showSearch={false}
                popupMatchSelectWidth={false}
                styles={DATE_SELECT_STYLES}
                labelRender={unavailableDateRangeLabel ? () => unavailableDateRangeLabel : undefined}
                suffixIcon={dateRange === 18 ? undefined : timeZoneSuffixIcon}
                onChange={newDateRange => {
                  const item = find(flatten(dateOptions), o => o.value === newDateRange);
                  if (!item) return;
                  let changes = { value: undefined, values: [] };

                  if (newDateRange === 10 || newDateRange === 11) {
                    changes = {
                      value: 1,
                    };
                  }

                  if (newDateRange === 18) {
                    changes.dateRangeType =
                      type === 15 || !includes([FILTER_CONDITION_TYPE.DATE_EQ, FILTER_CONDITION_TYPE.DATE_NE], type)
                        ? Number(showType)
                        : '3';
                  } else if (newDateRange > 18 && newDateRange < 19) {
                    changes.dateRangeType = get(item, 'dateRangeType');
                    newDateRange = parseInt(newDateRange);
                  } else {
                    changes.dateRangeType = undefined;
                  }

                  onChange(Object.assign({ dateRange: newDateRange }, changes));
                }}
              />
            </div>
          )}
          {includes([101, 102, 10, 11], dateRange) && (
            <div className="dateValue mTop10 flexRow alignItemsCenter">
              <Space.Compact className="flex">
                <Input
                  value={dayNum || ''}
                  placeholder={_l('请输入数字')}
                  disabled={disabled}
                  onBlur={() => {
                    let dayNumToChange = dayNum;

                    if (dateRangeType === DATE_RANGE_TYPE.YEAR && Number(dayNum) > 100) {
                      dayNumToChange = 100;
                    }

                    if (dayNum !== '0') {
                      onChange({ value: dayNumToChange, dateRangeType });
                    }
                  }}
                  onChange={e => onChange({ value: get(e, 'target.value', '').replace(/[^\d]/g, ''), dateRangeType })}
                />
                {(dateRange === 101 || dateRange === 102) && (
                  <Select
                    className="dateRangeType w100"
                    options={getSelectOptions(DATE_RANGE_TYPE_OPTIONS)}
                    value={dateRangeType || 3}
                    showSearch={false}
                    popupMatchSelectWidth={false}
                    styles={DATE_RANGE_TYPE_SELECT_STYLES}
                    onChange={newDateRangeType => {
                      const changes = { dateRangeType: newDateRangeType };

                      if (newDateRangeType === DATE_RANGE_TYPE.YEAR && Number(dayNum) > 100) {
                        changes.value = 100;
                      }

                      onChange(changes);
                    }}
                  />
                )}
              </Space.Compact>
              {(!includes([DATE_RANGE_TYPE.HOUR, DATE_RANGE_TYPE.MINUTE], dateRangeType) ||
                includes([10, 11], dateRange)) &&
                includes(
                  [
                    FILTER_CONDITION_TYPE.DATE_EQ,
                    FILTER_CONDITION_TYPE.DATE_NE,
                    FILTER_CONDITION_TYPE.DATEENUM,
                    FILTER_CONDITION_TYPE.NDATEENUM,
                    FILTER_CONDITION_TYPE.DATE_LTE,
                    FILTER_CONDITION_TYPE.DATE_GTE,
                  ],
                  type,
                ) && (
                  <Checkbox
                    className="includeToday"
                    checked={_.isEqual(values, ['today'])}
                    onChange={() =>
                      onChange({
                        values: _.isEqual(values, ['today']) ? [] : ['today'],
                      })
                    }
                  >
                    {{
                      [DATE_RANGE_TYPE.DAY]: _l('包括今天'),
                      [DATE_RANGE_TYPE.MONTH]: _l('包括本月'),
                      [DATE_RANGE_TYPE.YEAR]: _l('包括今年'),
                      [DATE_RANGE_TYPE.QUARTER]: _l('包括本季度'),
                    }[dateRangeType] || _l('包括今天')}
                  </Checkbox>
                )}
            </div>
          )}
          {dateRange === 18 && (
            <div className="customDate dateInputCon mTop10">
              <DatePicker
                {...{
                  ...control,
                  advancedSetting: {
                    ...control.advancedSetting,
                    min: '',
                    max: '',
                    showtimezone: '0',
                    timezonetype: '1',
                    showtype: !includes(['5', '4'], showType) ? String(dateRangeType) : showType,
                  },
                  type: _.includes(
                    [DATE_RANGE_TYPE.MINUTE, DATE_RANGE_TYPE.HOUR, DATE_RANGE_TYPE.SECOND],
                    dateRangeType,
                  )
                    ? 16
                    : 15,
                }}
                value={value && moment(value)}
                showTime={showTime}
                dropdownClassName="scrollInTable"
                suffixIcon={timeZoneSuffixIcon}
                onChange={date => {
                  let formattedDate;

                  if (date) {
                    if (dateRangeType === DATE_RANGE_TYPE.MINUTE) {
                      formattedDate = moment(date).format('YYYY-MM-DD HH:mm');
                    } else if (dateRangeType === DATE_RANGE_TYPE.HOUR) {
                      formattedDate = moment(date).format('YYYY-MM-DD HH');
                    } else if (dateRangeType === DATE_RANGE_TYPE.YEAR) {
                      formattedDate = moment(date).format('YYYY');
                    } else {
                      formattedDate = moment(date).format(valueFormat);
                    }
                  }

                  onChange({
                    value: formattedDate,
                  });
                }}
                compProps={{
                  inheritFieldStyle: false,
                  placeholder: _l('请选择'),
                }}
                notConvertZone={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Date.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.string,
  dateRange: PropTypes.number,
  minValue: PropTypes.string,
  maxValue: PropTypes.string,
  type: PropTypes.number,
};
