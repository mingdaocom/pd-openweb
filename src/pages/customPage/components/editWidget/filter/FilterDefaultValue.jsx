import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Select, Divider } from 'antd';
import { connect } from 'react-redux';
import Inputs, { OptionsTypes } from 'worksheet/common/Sheet/QuickFilter/Inputs/index';
import _ from 'lodash';

function FilterDefaultValue(props) {
  const { appPkg, filter, setFilter, firstControlData } = props;
  const { filterType, dateRangeType, advancedSetting = {} } = filter;
  const { projectId, id } = appPkg;
  const { direction } = advancedSetting;
  const defsource = _.pick(
    filter,
    'dateRange',
    'dateRangeType',
    'filterType',
    'value',
    'values',
    'minValue',
    'maxValue',
  );

  return (
    <Fragment>
      <div className="Gray Font13 mBottom10 Font13">{_l('默认值')}</div>
      <div className={cx({ WhiteBG: direction != 1 })}>
        <Inputs
          projectId={projectId}
          appId={id}
          advancedSetting={{
            ...advancedSetting,
            navfilters: advancedSetting.showNavfilters ? advancedSetting.showNavfilters : advancedSetting.navfilters,
          }}
          control={firstControlData}
          filterType={filterType}
          dateRangeType={dateRangeType}
          {...defsource}
          onChange={(change = {}, { forceUpdate } = {}) => {
            const data = {
              ...defsource,
              ...change,
            };
            setFilter({
              ..._.pick(data, 'dateRange', 'value', 'values', 'minValue', 'maxValue', 'filterType'),
            });
          }}
        />
      </div>
    </Fragment>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
}))(FilterDefaultValue);
