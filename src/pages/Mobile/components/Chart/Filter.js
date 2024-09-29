import React, { useState, useEffect, Fragment } from 'react';
import { Icon, Input } from 'ming-ui';
import styled from 'styled-components';
import { DatePicker } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { reportTypes } from 'statistics/Charts/common';
import {
  dropdownScopeData,
  timeDataParticle,
  timeGatherParticle,
  dropdownDayData,
  isTimeControl,
  isPastAndFuture,
} from 'statistics/common';

const naturalTime = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21];

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: #f5f5f5;
`;

function Group(props) {
  const { xaxes } = props.data;
  const { xaxes: defaultXaxes } = props.defaultData;
  const timeData =
    xaxes.controlType === 16 ? timeDataParticle : timeDataParticle.filter(item => ![6, 7].includes(item.value));
  const timeDataIndex = _.findIndex(timeData, { value: defaultXaxes.particleSizeType });
  const timeGatherParticleIndex = _.findIndex(timeGatherParticle, { value: defaultXaxes.particleSizeType });
  return (
    <Fragment>
      <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">{_l('归组')}</div>
      <div className="itemWrapper flexRow valignWrapper">
        {_.find(timeData, { value: defaultXaxes.particleSizeType }) &&
          timeData
            .filter((_, index) => index >= timeDataIndex)
            .map(item => (
              <div
                key={item.value}
                className={cx('item Font12 Gray', { active: xaxes.particleSizeType === item.value })}
                onClick={() => {
                  props.onChange({ particleSizeType: item.value });
                }}
              >
                {item.text}
              </div>
            ))}
        {_.find(timeGatherParticle, { value: xaxes.particleSizeType }) &&
          timeGatherParticle
            .filter((_, index) => index >= timeGatherParticleIndex)
            .map(item => (
              <div
                key={item.value}
                className={cx('item Font12 Gray', { active: xaxes.particleSizeType === item.value })}
                onClick={() => {
                  props.onChange({ particleSizeType: item.value });
                }}
              >
                {item.text}
              </div>
            ))}
      </div>
    </Fragment>
  );
}

function ChartFilter(props) {
  const datePeriod = dropdownScopeData.filter(item => ![20, 21].includes(item.value));
  const { reportType, xaxes, rangeValue, rangeType } = props.data;
  const { rangeValue: defaultRangeValue, rangeType: defaultRangeType, filter } = props.defaultData;
  const xAxisisTime = isTimeControl(xaxes.controlType);
  const moreVisible = true;

  const RenderDatePicker = () => {
    const isCustom = defaultRangeType === 20;
    const scopeData = _.find(dropdownScopeData, { value: defaultRangeType }) || {};
    const [minValue, maxValue] = isCustom
      ? defaultRangeValue.split('-').map(item => moment(item))
      : [moment(filter.startDate), moment(filter.endDate)];
    const startDateValue = minValue ? moment(minValue).toDate() : null;
    const endDateValue = maxValue ? moment(maxValue).toDate() : null;
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startVisible, setStartVisible] = useState(false);
    const [endVisible, setEndVisible] = useState(null);

    const labelRenderer = (type, data) => {
      switch (type) {
        case 'year':
          return data + '年';
        case 'month':
          return data + '月';
        case 'day':
          return data + '日';
        default:
          return data
      }
    }

    useEffect(() => {
      const start = moment(startDate || startDateValue).format('YYYY/MM/DD');
      const end = moment(endDate || endDateValue).format('YYYY/MM/DD');
      props.onChange({ rangeType: 20, rangeValue: `${start}-${end}` });
    }, [startDate, endDate]);

    return (
      <div className="flexRow mBottom16">
        <div className="flex">
          <DatePicker
            min={startDateValue}
            max={endDateValue}
            title={_l('开始时间')}
            value={startDate || startDateValue}
            onConfirm={date => {
              setStartDate(date);
            }}
            visible={startVisible}
            onClose={() => setStartVisible(false)}
            renderLabel={labelRenderer}
          />
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('开始')}
            value={moment(startDate || minValue).format('YYYY-MM-DD') || ''}
            onClick={() => setStartVisible(true)}
          />
        </div>
        <div className="flexRow valignWrapper mLeft7 mRight7">-</div>
        <div className="flex">
          <DatePicker
            min={startDateValue}
            max={endDateValue}
            title={_l('结束时间')}
            value={endDate || endDateValue}
            onConfirm={date => {
              setEndDate(date);
            }}
            visible={endVisible}
            onClose={() => setEndVisible(false)}
            renderLabel={labelRenderer}
          />
          <InputCon
            readOnly
            className="centerAlign"
            placeholder={_l('结束')}
            value={moment(endDate || maxValue).format('YYYY-MM-DD') || ''}
            onClick={() => setEndVisible(true)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="filterWrapper pAll15 mBottom20">
      <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">
        <div className="flex">
          {_l('时间周期')}
          {`(${_.find(dropdownScopeData, { value: defaultRangeType }).text})`}
        </div>
      </div>

      {naturalTime.includes(defaultRangeType) && RenderDatePicker()}

      {defaultRangeType === 0 && (
        <Fragment>
          <div className="itemWrapper flexRow valignWrapper">
            {(moreVisible ? datePeriod : datePeriod.slice(0, 6)).map((item, index) => (
              <div
                key={item.value}
                className={cx('item Font12 Gray', { active: rangeType === item.value })}
                onClick={() => {
                  props.onChange({ rangeType: item.value, rangeValue: isPastAndFuture(item.value) ? 7 : null });
                }}
              >
                {item.text}
              </div>
            ))}
          </div>
          {isPastAndFuture(rangeType) && (
            <Fragment>
              <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">
                {_.find(dropdownScopeData, { value: rangeType }).text}
              </div>
              <div className="itemWrapper flexRow valignWrapper">
                {dropdownDayData.map((item, index) => (
                  <div
                    key={item.value}
                    className={cx('item Font12 Gray', { active: rangeValue == item.value })}
                    onClick={() => {
                      props.onChange({ rangeValue: item.value });
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </Fragment>
          )}
        </Fragment>
      )}

      {isPastAndFuture(defaultRangeType) && (
        <div className="itemWrapper flexRow valignWrapper">
          {dropdownDayData
            .filter(item => item.value <= defaultRangeValue)
            .map((item, index) => (
              <div
                key={item.value}
                className={cx('item Font12 Gray', { active: rangeValue == item.value })}
                onClick={() => {
                  props.onChange({ rangeValue: item.value });
                }}
              >
                {item.text}
              </div>
            ))}
        </div>
      )}
      {reportType !== reportTypes.NumberChart && xAxisisTime && <Group {...props} />}
    </div>
  );
}

export default ChartFilter;
