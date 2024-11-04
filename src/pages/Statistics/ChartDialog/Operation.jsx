import React, { Component, Fragment } from 'react';
import { reportTypes } from '../Charts/common';
import Sort from '../components/Sort';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';
import _ from 'lodash';

const Operation = ({
  settingVisible,
  scopeVisible,
  sheetVisible,
  direction,
  currentReport,
  reportData,
  worksheetInfo,
  sourceType,
  base,
  onChangeScopeVisible,
  onChangeSheetVisible,
  onChangeDirection,
  changeCurrentReport,
  getReportData,
  getTableData,
}) => {
  const { report = {}, pageId } = base;
  const isPublicShare = _.get(window, 'shareState.shareId') || window.shareAuthor;
  const isSheetView = ![reportTypes.PivotTable].includes(reportData.reportType);
  const { style } = currentReport;
  const { pivotTableColumnWidthConfig } = style || {};
  return (
    <div className="flexRow valignWrapper">
      {sheetVisible && !settingVisible ? (
        <Tooltip title={direction === 'vertical' ? _l('切换为竖版模式') : _l('切换为横版模式')} placement="bottom">
          <Icon
            icon="call_to_action_on"
            className={cx('Font20 Gray_9e pointer mLeft16', direction)}
            onClick={() => {
              onChangeDirection();
            }}
          />
        </Tooltip>
      ) : (
        isSheetView && (
          <Tooltip title={_l('以表格显示')} placement="bottom">
            <Icon
              icon="worksheet"
              className="Font20 Gray_9e pointer mLeft16"
              onClick={() => {
                onChangeSheetVisible();
              }}
            />
          </Tooltip>
        )
      )}
      {!settingVisible && (
        <Tooltip title={_l('刷新')} placement="bottom">
          <Icon
            icon="task-later"
            className="Font20 Gray_9e pointer mLeft16"
            onClick={() => {
              getReportData();
              if (sheetVisible) {
                getTableData();
              }
            }}
          />
        </Tooltip>
      )}
      {!settingVisible && !isPublicShare && (
        <Tooltip title={_l('统计范围')} placement="bottom">
          <Icon
            icon="filter"
            className={cx('Font20 Gray_9e pointer mLeft16', { active: scopeVisible })}
            onClick={() => {
              onChangeScopeVisible(!scopeVisible);
            }}
          />
        </Tooltip>
      )}
      {settingVisible &&
        [reportTypes.PivotTable].includes(reportData.reportType) &&
        !_.isEmpty(pivotTableColumnWidthConfig) && (
          <Tooltip title={_l('等分')} placement="bottom">
            <Icon
              icon="equal_division"
              className="Font20 Gray_9e pointer mLeft16"
              onClick={() => {
                changeCurrentReport({
                  style: {
                    ...style,
                    pivotTableColumnWidthConfig: undefined,
                  },
                });
                sessionStorage.removeItem(`pivotTableColumnWidthConfig-${report.id}`);
              }}
            />
          </Tooltip>
        )}
      <Sort
        reportId={report.id}
        pageId={pageId}
        sourceType={sourceType}
        currentReport={currentReport}
        reportType={reportData.reportType}
        map={reportData.map}
        valueMap={reportData.valueMap}
        reportData={reportData}
        onChangeCurrentReport={data => {
          changeCurrentReport(data, true);
          if (sheetVisible) {
            getTableData();
          }
        }}
      />
    </div>
  );
};

export default connect(
  ({ statistics }) => ({
    ..._.pick(statistics, ['currentReport', 'reportData', 'worksheetInfo', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(Operation);
