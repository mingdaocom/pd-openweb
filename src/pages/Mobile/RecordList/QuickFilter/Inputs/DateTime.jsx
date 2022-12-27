import React, { useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { func, shape, string, number } from 'prop-types';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import { Input } from 'ming-ui';
import { DATE_OPTIONS } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import { Option } from './Options';
import RightSidebar from './RightSidebar';
import DateTimeList from './DateTimeList';
import _ from 'lodash';
import moment from 'moment';

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #f5f5f5;
`;

export default function DateTime(props) {
  const { dateRange, minValue, maxValue, advancedSetting = {}, onChange = () => {}, onRemove = () => {}, control } = props;
  const [moreVisible, setMoreVisible] = useState(false);
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  const showType = _.get(control, 'advancedSetting.showtype');
  const valueFormat = getShowFormat(control);
  const date = _.includes(['4', '5'], showType)
    ? DATE_OPTIONS.map(os =>
        os.filter(o => _.includes(showType === '5' ? [15, 16, 17] : [7, 8, 9, 12, 13, 14, 15, 16, 17], o.value)),
      )
        .filter(item => item.length)
        .map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)))
    : DATE_OPTIONS.map(v => v.filter(item => item.value !== 18)).filter(t => !_.isEmpty(t));
  const optionDate = _.flatten(date);
  const startDateValue = minValue ? moment(minValue).toDate() : null;
  const endDateValue = maxValue ? moment(maxValue).toDate() : null;
  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  };
  const handleSelectOptionDate = value => {
    if (dateRange === value) {
      onChange({ filterType: 0, dateRange: 0, minValue: undefined, maxValue: undefined });
    } else {
      onChange({ filterType: 17, dateRange: value, minValue: undefined, maxValue: undefined });
    }
  };
  const startDateExtraObj = endDateValue ? { max: new Date(endDateValue) } : {};
  const precisionObj = { 5: 'year', 4: 'month', 3: 'date', 2: 'hour', 1: 'minite', 6: 'second' };
  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {!!dateRange && dateRange !== 18 && (
          <div className="selected ellipsis">{_.find(optionDate, { value: dateRange }).text}</div>
        )}
      </div>
      <div className="flexRow">
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('开始')}
            value={minValue || ''}
            onClick={() => {
              setStartDateVisible(true);
            }}
          />
          {startDateVisible && (
            <MobileDatePicker
              customHeader={_l('开始时间')}
              precision={precisionObj[showType]}
              isOpen={startDateVisible}
              value={startDateValue ? new Date(startDateValue) : new Date()}
              onSelect={date => {
                const d =
                  control.controlId === 'ctime' || control.controlId === 'utime'
                    ? moment(date).format('YYYY-MM-DD HH:mm:ss')
                    : moment(date).format(valueFormat);

                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: d,
                  maxValue: maxValue ? maxValue : d,
                });
                setStartDateVisible(false);
              }}
              onCancel={() => {
                setStartDateVisible(false);
                if (maxValue) {
                  onChange({
                    dateRange: 18,
                    filterType: 31,
                    minValue: null,
                    maxValue,
                  });
                } else {
                  onRemove();
                }
              }}
              {...startDateExtraObj}
            />
          )}
        </div>
        <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
        <div className="flex">
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('结束')}
            value={maxValue || ''}
            onClick={() => {
              setEndDateVisible(true);
            }}
          />
          {endDateVisible && (
            <MobileDatePicker
              customHeader={_l('结束时间')}
              isOpen={endDateVisible}
              value={endDateValue ? new Date(endDateValue) : new Date()}
              min={new Date(startDateValue)}
              precision={precisionObj[showType]}
              onSelect={date => {
                const d =
                  control.controlId === 'ctime' || control.controlId === 'utime'
                    ? moment(date).format('YYYY-MM-DD HH:mm:ss')
                    : moment(date).format(valueFormat);
                onChange({
                  dateRange: 18,
                  filterType: 31,
                  minValue: minValue ? minValue : d,
                  maxValue: d,
                });
                setEndDateVisible(false);
              }}
              onCancel={() => {
                setEndDateVisible(false);
                if (minValue) {
                  onChange({
                    dateRange: 18,
                    filterType: 31,
                    minValue,
                    maxValue: null,
                  });
                } else {
                  onRemove();
                }
              }}
            />
          )}
        </div>
      </div>
      <div className="mTop12">
        {optionDate.slice(0, 10).map((item, i) => (
          <Option
            key={i}
            className={cx('ellipsis', { checked: dateRange === item.value })}
            onClick={() => {
              handleSelectOptionDate(item.value);
            }}
          >
            {item.text}
          </Option>
        ))}
        {optionDate.length > 10 && (
          <Option className="more" onClick={handleSetMoreVisible}>
            {_l('更多...')}
          </Option>
        )}
      </div>
      {moreVisible && (
        <RightSidebar name={control.controlName} onHideSidebar={handleSetMoreVisible}>
          <DateTimeList date={date} dateRange={dateRange} onSelectOptionDate={handleSelectOptionDate} />
        </RightSidebar>
      )}
    </div>
  );
}

DateTime.propTypes = {
  dateRange: number,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
