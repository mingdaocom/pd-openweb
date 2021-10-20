import React, { useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { func, shape, string, number } from 'prop-types';
import { DatePicker } from 'antd-mobile';
import { Input } from 'ming-ui';
import { DATE_OPTIONS } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { Option } from './Options';
import RightSidebar from './RightSidebar';
import DateTimeList from './DateTimeList';

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #F5F5F5;
`;

export default function DateTime(props) {
  const { dateRange, minValue, maxValue, advancedSetting = {}, onChange = () => {}, control } = props;
  const [active, setActive] = useState();
  const [moreVisible, setMoreVisible] = useState(false);
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {}
  const showDatePicker = dateRange === 18 || _.isEmpty(allowedDateRange);
  const isEmpty = dateRange === 18 ? !(minValue && maxValue) : !dateRange;
  const date = DATE_OPTIONS.map(os => os.filter(o => _.includes(allowedDateRange, o.value))).filter(item => item.length);
  const optionDate = _.flatten(date);
  const startDateValue = minValue ? moment(minValue).toDate() : null;
  const endDateValue = maxValue ? moment(maxValue).toDate() : null;
  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  }
  const handleSelectOptionDate = (value) => {
    if (dateRange === value) {
      onChange({ filterType: 0, dateRange: 0, minValue: undefined, maxValue: undefined });
    } else {
      onChange({ filterType: 17, dateRange: value, minValue: undefined, maxValue: undefined });
    }
  }
  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis">{control.controlName}</div>
        {(!!dateRange && dateRange !== 18) && <div className="selected ellipsis">{_.find(optionDate, { value: dateRange }).text}</div>}
      </div>
      <div className="flexRow">
        <div className="flex">
          <DatePicker
            mode="date"
            maxDate={endDateValue}
            title={_l('开始时间')}
            value={startDateValue}
            onChange={date => {
              const d = moment(date).format('YYYY-MM-DD');
              onChange({
                dateRange: 18,
                filterType: 11,
                minValue: d,
                maxValue: maxValue ? maxValue : d,
              });
            }}
          >
            <InputCon
              readOnly
              className="centerAlign"
              placeholder={_l('开始')}
              value={minValue || ''}
            />
          </DatePicker>
        </div>
        <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
        <div className="flex">
          <DatePicker
            mode="date"
            minDate={startDateValue}
            title={_l('结束时间')}
            value={endDateValue}
            onChange={date => {
              const d = moment(date).format('YYYY-MM-DD');
              onChange({
                dateRange: 18,
                filterType: 11,
                minValue: minValue ? minValue : d,
                maxValue: d
              });
            }}
          >
            <InputCon
              readOnly
              className="centerAlign"
              placeholder={_l('结束')}
              value={maxValue || ''}
            />
          </DatePicker>
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
        <Option className="more" onClick={handleSetMoreVisible}>{_l('更多...')}</Option>
      </div>
      {moreVisible && (
        <RightSidebar
          name={control.controlName}
          onHideSidebar={handleSetMoreVisible}
        >
          <DateTimeList
            date={date}
            dateRange={dateRange}
            onSelectOptionDate={handleSelectOptionDate}
          />
        </RightSidebar>
      )}
    </div>
  )
}

DateTime.propTypes = {
  dateRange: number,
  advancedSetting: shape({}),
  minValue: string,
  maxValue: string,
  onChange: func,
};
