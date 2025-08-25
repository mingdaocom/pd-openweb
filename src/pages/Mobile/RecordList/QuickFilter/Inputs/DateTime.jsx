import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Input, TimeZoneTag } from 'ming-ui';
import { DATE_TYPE } from 'worksheet/common/ViewConfig/components/fastFilter/config';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import { getDatePickerConfigs, getShowFormat } from 'src/pages/widgetConfig/util/setting.js';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import DateTimeList from './DateTimeList';
import { Option } from './Options';
import RightSidebar from './RightSidebar';

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #f5f5f5;
`;

const replaceTimeValue = value => (value.replace ? value.replace(/[\u4e00-\u9fa5]+/g, '-') : value);

const formatValue = (control, value, valueFormat) => {
  const showType = _.get(control, 'advancedSetting.showtype');
  return value
    ? control.controlId === 'ctime' || control.controlId === 'utime'
      ? moment(value).format('YYYY-MM-DD HH:mm:ss')
      : moment(value).format(showType === '2' ? 'YYYY-MM-DD HH:00' : valueFormat)
    : '';
};

export default function DateTime(props) {
  const {
    dateRange,
    dateRangeType,
    value,
    minValue,
    maxValue,
    advancedSetting = {},
    onChange = () => {},
    onRemove = () => {},
    control,
    appId,
  } = props;

  const filterType = props.filterType || FILTER_CONDITION_TYPE.DATE_BETWEEN;
  const [moreVisible, setMoreVisible] = useState(false);
  const [startDateVisible, setStartDateVisible] = useState(false);
  const [endDateVisible, setEndDateVisible] = useState(false);
  let allowedDateRange = [];
  try {
    allowedDateRange = JSON.parse(advancedSetting.daterange);
  } catch (err) {
    console.log(err);
  }
  if (dateRangeType) {
    control.advancedSetting.showtype = String(dateRangeType);
  }

  const showType = _.get(control, 'advancedSetting.showtype');
  const showValueFormat = getShowFormat(control);
  const valueFormat = getDatePickerConfigs(control).formatMode;
  let date = _.includes(['4', '5'], showType)
    ? DATE_TYPE.map(os =>
        os.filter(o =>
          _.includes(showType === '5' ? [15, 16, 17, 18] : [7, 8, 9, 12, 13, 14, 15, 16, 17, 18], o.value),
        ),
      )
        .filter(item => item.length)
        .map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)))
    : DATE_TYPE.map(os => os.filter(o => _.includes(allowedDateRange.concat(18), o.value)));
  date = date.filter(v => v.length);
  const optionDate = _.flatten(date);
  const startDateValue = minValue ? moment(replaceTimeValue(minValue)).toDate() : null;
  const endDateValue = maxValue ? moment(replaceTimeValue(maxValue)).toDate() : null;
  const handleSetMoreVisible = () => {
    setMoreVisible(!moreVisible);
  };
  const handleSelectOptionDate = value => {
    if (dateRange === value) {
      onChange({ dateRange: 0, minValue: undefined, maxValue: undefined });
    } else {
      const filterType = props.filterType || FILTER_CONDITION_TYPE.DATEENUM;
      onChange({
        filterType: filterType,
        dateRange: value,
        minValue: undefined,
        maxValue: undefined,
        value: undefined,
      });
    }
  };
  const startDateExtraObj = endDateValue ? { max: moment(replaceTimeValue(endDateValue)).toDate() } : {};
  const precisionObj = { 5: 'year', 4: 'month', 3: 'date', 2: 'hour', 1: 'minite', 6: 'second' };
  return (
    <div className="controlWrapper">
      <div className="flexRow valignWrapper mBottom15">
        <div className="Font14 bold flex ellipsis controlName">{control.controlName}</div>
        {!!dateRange && dateRange !== 18 && (
          <div className="selected ellipsis">{_.get(_.find(optionDate, { value: dateRange }), 'text')}</div>
        )}
        <TimeZoneTag
          appId={appId}
          position={{
            position: 'unset',
            color: '#9e9e9e ',
            border: 'none',
            height: 'auto',
            lineHeight: 'unset',
            paddingLeft: '6px',
          }}
        />
      </div>
      {filterType === FILTER_CONDITION_TYPE.DATE_BETWEEN ? (
        <div className="flexRow">
          <div className="flex">
            <InputCon
              readOnly
              className="centerAlign"
              placeholder={_l('开始')}
              value={formatValue(control, minValue, showValueFormat)}
              onClick={() => {
                setStartDateVisible(true);
              }}
            />
            {startDateVisible && (
              <MobileDatePicker
                customHeader={_l('开始时间')}
                precision={precisionObj[showType]}
                isOpen={startDateVisible}
                value={startDateValue ? moment(replaceTimeValue(startDateValue)).toDate() : new Date()}
                onClose={() => {
                  setStartDateVisible(false);
                }}
                onSelect={date => {
                  onChange({
                    dateRange: 18,
                    filterType: 31,
                    minValue: moment(date).format(valueFormat),
                    maxValue: moment(date).format(valueFormat),
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
              value={formatValue(control, maxValue, showValueFormat)}
              onClick={() => {
                setEndDateVisible(true);
              }}
            />
            {endDateVisible && (
              <MobileDatePicker
                customHeader={_l('结束时间')}
                isOpen={endDateVisible}
                value={endDateValue ? moment(replaceTimeValue(endDateValue)).toDate() : new Date()}
                min={moment(startDateValue).toDate()}
                precision={precisionObj[showType]}
                onClose={() => {
                  setEndDateVisible(false);
                }}
                onSelect={date => {
                  onChange({
                    dateRange: 18,
                    filterType: 31,
                    minValue: minValue,
                    maxValue: moment(date).format(valueFormat),
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
      ) : (
        <div className="flexRow">
          <div className="flex">
            <InputCon
              readOnly
              className="centerAlign"
              placeholder={_l('请选择日期')}
              value={formatValue(control, value, showValueFormat)}
              onClick={() => {
                setStartDateVisible(true);
              }}
            />
            {startDateVisible && (
              <MobileDatePicker
                customHeader={_l('请选择日期')}
                precision={precisionObj[showType]}
                isOpen={startDateVisible}
                value={value ? moment(replaceTimeValue(value)).toDate() : new Date()}
                onClose={() => {
                  setStartDateVisible(false);
                }}
                onSelect={date => {
                  onChange({
                    dateRange: 18,
                    filterType: filterType || FILTER_CONDITION_TYPE.DATEENUM,
                    value: moment(date).format(valueFormat),
                  });
                  setStartDateVisible(false);
                }}
                onCancel={event => {
                  setStartDateVisible(false);
                  if (event) {
                    onChange({
                      dateRange: 18,
                      filterType: filterType || FILTER_CONDITION_TYPE.DATEENUM,
                      value: '',
                    });
                    onRemove();
                  }
                }}
                {...startDateExtraObj}
              />
            )}
          </div>
        </div>
      )}
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
