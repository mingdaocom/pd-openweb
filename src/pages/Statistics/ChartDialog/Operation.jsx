import React, { Component, Fragment } from 'react';
import { reportTypes } from '../Charts/common';
import Sort from '../components/Sort';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';

const Operation = ({
  settingVisible,
  scopeVisible,
  sheetVisible,
  direction,
  currentReport,
  reportData,
  worksheetInfo,
  base,
  onChangeScopeVisible,
  onChangeSheetVisible,
  onChangeDirection,
  changeCurrentReport,
  getReportData,
  getTableData
}) => {
  const { report } = base;
  const isChartPublicShare = location.href.includes('public/chart');
  const isPagePublicShare = location.href.includes('public/page') || window.shareAuthor;
  const isSheetView = ![reportTypes.PivotTable, reportTypes.NumberChart].includes(reportData.reportType);
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
            icon="rotate"
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
      {!settingVisible && !isChartPublicShare && !isPagePublicShare && (
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
      <Sort
        currentReport={currentReport}
        reportType={reportData.reportType}
        map={reportData.map}
        valueMap={reportData.valueMap}
        onChangeCurrentReport={data => {
          changeCurrentReport(data, true);
          if (sheetVisible) {
            getTableData();
          }
        }}
      />
    </div>
  );
}


export default connect(
  ({ statistics }) => ({
    ..._.pick(statistics, ['currentReport', 'reportData', 'worksheetInfo', 'base'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(Operation);
