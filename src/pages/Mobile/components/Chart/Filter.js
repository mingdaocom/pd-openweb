import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Input } from 'ming-ui';
import { reportTypes } from 'statistics/Charts/common';
import { isTimeControl } from 'statistics/common/controlUtils';
import {
  dropdownDayData,
  dropdownScopeData,
  isPastAndFuture,
  timeDataParticle,
  timeGatherParticle,
} from 'statistics/common/timeUtils';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';

const naturalTime = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21];

const InputCon = styled(Input)`
  width: 100%;
  border-radius: 18px !important;
  border: none !important;
  background-color: var(--color-background-secondary);
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
      <div className="flexRow valignWrapper Font13 textSecondary mBottom16">{_l('归组')}</div>
      <div className="itemWrapper flexRow valignWrapper">
        {_.find(timeData, { value: defaultXaxes.particleSizeType }) &&
          timeData
            .filter((_, index) => index >= timeDataIndex)
            .map(item => (
              <div
                key={item.value}
                className={cx('item Font12 textPrimary', { active: xaxes.particleSizeType === item.value })}
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
                className={cx('item Font12 textPrimary', { active: xaxes.particleSizeType === item.value })}
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
  const datePeriod = dropdownScopeData.filter(item => ![20, 21, 24].includes(item.value));
  const { reportType, xaxes, rangeValue, rangeType } = props.data;
  const { rangeValue: defaultRangeValue, rangeType: defaultRangeType, filter } = props.defaultData;
  const xAxisisTime = isTimeControl(xaxes.controlType);
  const moreVisible = true;

  const RenderDatePicker = () => {
    const isCustom = defaultRangeType === 20;
    const [minValue, maxValue] = isCustom
      ? defaultRangeValue.split('-').map(item => moment(item))
      : [moment(filter.startDate), moment(filter.endDate)];
    const startDateValue = minValue ? moment(minValue).toDate() : null;
    const endDateValue = maxValue ? moment(maxValue).toDate() : null;
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startVisible, setStartVisible] = useState(false);
    const [endVisible, setEndVisible] = useState(false);

    useEffect(() => {
      const start = moment(startDate || startDateValue).format('YYYY/MM/DD');
      const end = moment(endDate || endDateValue).format('YYYY/MM/DD');
      props.onChange({ rangeType: 20, rangeValue: `${start}-${end}` });
    }, [startDate, endDate]);

    return (
      <div className="flexRow mBottom16">
        <div className="flex">
          {startVisible && (
            <MobileDatePicker
              customHeader={_l('开始时间')}
              showType="date"
              precision="date"
              isOpen={startVisible}
              value={startDate || startDateValue}
              min={startDateValue}
              max={endDateValue}
              onClose={() => setStartVisible(false)}
              onCancel={() => setStartVisible(false)}
              onSelect={date => {
                setStartDate(date);
                setStartVisible(false);
              }}
            />
          )}
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
          {endVisible && (
            <MobileDatePicker
              customHeader={_l('结束时间')}
              showType="date"
              precision="date"
              isOpen={endVisible}
              value={endDate || endDateValue}
              min={startDateValue}
              max={endDateValue}
              onClose={() => setEndVisible(false)}
              onCancel={() => setEndVisible(false)}
              onSelect={date => {
                setEndDate(date);
                setEndVisible(false);
              }}
            />
          )}
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
      <div className="flexRow valignWrapper Font13 textSecondary mBottom16">
        <div className="flex">
          {_l('时间周期')}
          {`(${_.find(dropdownScopeData, { value: defaultRangeType }).text})`}
        </div>
      </div>

      {naturalTime.includes(defaultRangeType) && RenderDatePicker()}

      {defaultRangeType === 0 && (
        <Fragment>
          <div className="itemWrapper flexRow valignWrapper">
            {(moreVisible ? datePeriod : datePeriod.slice(0, 6)).map(item => (
              <div
                key={item.value}
                className={cx('item Font12 textPrimary', { active: rangeType === item.value })}
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
              <div className="flexRow valignWrapper Font13 textSecondary mBottom16">
                {_.find(dropdownScopeData, { value: rangeType }).text}
              </div>
              <div className="itemWrapper flexRow valignWrapper">
                {dropdownDayData.map(item => (
                  <div
                    key={item.value}
                    className={cx('item Font12 textPrimary', { active: rangeValue == item.value })}
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
            .map(item => (
              <div
                key={item.value}
                className={cx('item Font12 textPrimary', { active: rangeValue == item.value })}
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
