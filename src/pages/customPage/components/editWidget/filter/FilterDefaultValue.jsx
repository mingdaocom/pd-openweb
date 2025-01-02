import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import Inputs from 'worksheet/common/Sheet/QuickFilter/Inputs/index';
import { WIDGETS_TO_API_TYPE_ENUM } from 'pages/widgetConfig/config/widget';
import DefCom from 'worksheet/common/ViewConfig/components/fastFilter/Edit/DefCom';
import worksheetApi from 'src/api/worksheet';
import { formatFilterValues } from 'worksheet/common/Sheet/QuickFilter/utils';
import _ from 'lodash';

const transitionTypes = [
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE,
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY,
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY,
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
  WIDGETS_TO_API_TYPE_ENUM.CASCADER
];

function FilterDefaultValue(props) {
  const { appPkg, urlParams = [], filter, dataType, allControls, sheet, setFilter, firstControlData } = props;
  const { filterType, dateRangeType, advancedSetting = {} } = filter;
  const { projectId, id } = appPkg;
  const { direction } = advancedSetting;
  const defsource = _.pick(
    filter,
    'dynamicSource',
    'dateRange',
    'dateRangeType',
    'filterType',
    'value',
    'values',
    'minValue',
    'maxValue',
  );
  const { showDefsource } = filter;

  const handleGetShowDefsource = conditions => {
    worksheetApi.getWorksheetFilterById({
      filterId: '',
      projectId,
      worksheetId: sheet.worksheetId,
      items: conditions,
    }).then(data => {
      const { items = [] } = data;
      setFilter({
        showDefsource: _.get(items[0], 'values'),
        values: formatFilterValues(dataType, _.get(items[0], 'values'))
      });
    });
  }

  if (![1, 2, 32, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 46, 9, 10, 11, 36, 27, 26, 48, 29, 35].includes(dataType)) {
    return null;
  }

  return (
    <Fragment>
      <DefCom
        view={{
          advancedSetting: {
            urlparams: JSON.stringify(urlParams)
          }
        }}
        currentSheetInfo={sheet}
        control={{
          ...firstControlData,
          ...defsource,
          ...({ values: showDefsource ? showDefsource : defsource.values }),
          advancedSetting: {
            ...firstControlData.advancedSetting,
            ...advancedSetting,
          }
        }}
        dataType={dataType}
        dataControls={firstControlData}
        advancedSetting={{
          ...advancedSetting,
          navfilters: advancedSetting.showNavfilters ? advancedSetting.showNavfilters : advancedSetting.navfilters,
        }}
        worksheetControls={allControls}
        updateViewSet={(data) => {
          if (transitionTypes.includes(dataType) && !_.isEmpty(data.values)) {
            handleGetShowDefsource([{
              ...defsource,
              controlId: firstControlData.controlId,
              dataType,
              values: data.values
            }]);
          } else {
            setFilter({
              ...data,
              showDefsource: undefined
            });
          }
        }}
      />
      {/*
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
      */}
    </Fragment>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
  urlParams: state.customPage.urlParams,
}))(FilterDefaultValue);
