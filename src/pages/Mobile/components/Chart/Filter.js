import React, { useEffect, useState, Fragment } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';
import {
  dropdownScopeData,
  timeParticleSizeDropdownData,
  dropdownDayData,
  isTimeControl,
  isPastAndFuture,
} from 'src/pages/worksheet/common/Statistics/common';

function ChartFilter(props) {
  const datePeriod = dropdownScopeData.filter(item => item.value !== 20);
  const dateParticle = timeParticleSizeDropdownData.filter(item => item.value <= 3);
  const { reportType, xaxes, rangeType, rangeValue } = props.data;
  const [moreVisible, setMoreVisible] = useState(false);
  const xAxisisTime = isTimeControl(xaxes.controlId, props.controls);
  return (
    <div className="filterWrapper pAll15 mBottom20">
      {/*<div className="Font15 Gray mBottom20">{_l('筛选时间范围')}</div>*/}
      <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">
        <div className="flex">{_l('时间周期')}</div>
        <Icon
          className="Font15 Gray_9e"
          icon={moreVisible ? 'arrow-down-border' : 'arrow-up-border'}
          onClick={() => {
            setMoreVisible(!moreVisible);
          }}
        />
      </div>
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
      {reportType !== reportTypes.NumberChart && xAxisisTime && (
        <Fragment>
          <div className="flexRow valignWrapper Font13 Gray_75 mBottom16">{_l('粒度')}</div>
          <div className="itemWrapper flexRow valignWrapper">
            {dateParticle.map((item, index) => (
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
      )}
    </div>
  );
}

export default ChartFilter;
